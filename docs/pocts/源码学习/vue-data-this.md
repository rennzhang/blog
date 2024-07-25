---
tags:
 - 源码学习
 - vue
 - this
top: 2
sidebar: false
sticky: false
data: 2023-9-22 22:07:19
---

# 为什么 Vue2 this 能够直接获取到 data 和 methods
**本文参加了由[公众号@若川视野](https://link.juejin.cn/?target=https%3A%2F%2Flxchuan12.gitee.io "https://lxchuan12.gitee.io") 发起的每周源码共读活动，[点击了解详情一起参与。](https://juejin.cn/post/7079706017579139102 "https://juejin.cn/post/7079706017579139102")**

## 解读原理

### new Vue 的大致走向：

![image.png](https://cdn.jsdelivr.net/gh/rennzhang/blog-pics@main/images/1695396697979image.png)

### initMethods

>实现 this 获取 methods 的原理就是吧 methods 的方法遍历出来，挂载到当前 vm 实例上

看到这里逻辑上本身没有太多疑问，但是 `bind`这里用了较多的时间去理解，开始理解函数直接挂到 `vm` 上了，`vm` 调用方法，那么 `this` 指向的一定是 `vm`，没有想到 bind 强制绑定 this的原因， 这里有趣复习了一下 this，先后尝试了箭头函数、构造函数、闭包等等，发现都没有影响到 this 指向（this 确实有段时间没看了，哈哈哈）


在川哥的讨论区看了几个答案，没有发现深究这个问题的，最后还是多谢川哥解答。

结论是bind强制绑定 this 可以避免this 丢失的问题，比如：

1.  `template` 中`@click`绑定的事件，这里是没有用 `this.someFunc`调用的，并且从测试情况来看，`template` 编译过程也没有额外处理 `this`
1.  解构，没有 this 可能会直接报错，比如在业务中用这种写法：`const { validate } = this.$refs["formRef"]`

```js
function initMethods (vm, methods) {
  var props = vm.$options.props;
  for (var key in methods) {
    // 不是函数会警告
    if (process.env.NODE_ENV !== 'production') {
      if (typeof methods[key] !== 'function') {
        warn(
          "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
          "Did you reference the function correctly?",
          vm
        );
      }
      // 不能和 props 上的属性重名
      if (props && hasOwn(props, key)) {
        warn(
          ("Method \"" + key + "\" has already been defined as a prop."),
          vm
        );
      }
      // 不能以 $ 或者 _ 开头
      if ((key in vm) && isReserved(key)) {
        warn(
          "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
          "Avoid defining component methods that start with _ or $."
        );
      }
    }
    // 把 methods 下的所有函数挂到 vm 实例上
    // 下一步会把 data 的所有属性挂到 vm 实例上，因此 this 可以访问到 data 和 methods中的属性和方法
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}
```

### initData

>处理 data 要比 methods 复杂很多，处理遍历挂载到 vm 上，还需要做响应式的处理


总结：

1.  处理 data 前，要先关掉依赖收集器，初始化阶段不用处理依赖
1.  通过 Object.defineProperty 处理 _data 属性，并把属性挂到 vm 上，保证数据的及时更新
1.  给 data 对象递归创建观察者实例
```js
function getData (data, vm) {
  // #7573 disable dep collection when invoking data getters => 在调用数据获取器时禁用dep收集
  // pushTarget 应该有一个参数，这里是 undefined，传进去之后当前的可观察对象为 undefined
  pushTarget();
  try {
    // 好家伙，这里不看源码，还真的不知道函数形式的 data 还有一个参数
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, "data()");
    return {}
  } finally {
    // 从收集器堆栈中弹出刚才 push 的 undefined，即开启 dep 收集功能
    popTarget();
  }
}
```

```js
function initData (vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {};
  // data 函数必须 return 一个对象，否则警告
  if (!isPlainObject(data)) {
    data = {};
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;
  while (i--) {
    var key = keys[i];
    // data 中的 key 名和 methods 中重复则控制台警告
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          ("Method \"" + key + "\" has already been defined as a data property."),
          vm
        );
      }
    }
    // data 中的 key 名和 props 中重复则控制台警告
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        "The data property \"" + key + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      );
    } else if (!isReserved(key)) { // key 名不能以 $ 或者 _ 开头
      // 通过 Object.defineProperty 处理 _data 属性，并把属性挂到 vm 上
      proxy(vm, "_data", key);
    }
  }

  // observe data
  // 给 data 创建一个观察者实例，并且添加到依赖收集中，set 属性的时候会触发该依赖的notify函数
  // 如果 data 中的属性是一个对象，则会创建一个新的观察者实例递归创建)
  // 如果是数组则会遍历每一项创建观察者实例，但是 defineProperty 只能作用于函数，通过数组索引值直接赋值不能触发依赖收集
  observe(data, true /* asRootData */);
}
```

## 实现一个简单版本
仅供参考
```js
// 创建代理
function proxy(target, source, key) {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    get() {
      console.log("读取了key："+key);
      return this[source][key];
    },
    set(value) {
      console.log("设置了key："+key+"值为："+value);

      this[source][key] = value;
     },
  })
}

// 观察者
 function observe(value) {
  if (!value || typeof value !== "object") {
    return;
  }
  // return new Observer(value, vm);
}
function getData() {
// 这里会暂时关闭掉dep收集
  // 强制绑定 this 为 vm，并传入参数
  return vm.$options.data.call(vm,vm)
 }

function initData(vm) {
  var data = vm.$options.data;
  // 获取 data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {};


  for (const key in data) {
  // 通过 proxy 将 data 上的属性代理到 vm 上
    proxy(vm, "_data", key);
  }
  // 给 data 创建一个观察者实例
  observe(data);
}

function initMethods(methods, vm) {
  for (const key in methods) {
    if (typeof methods[key] !== "function") return "ERROR";
    // 这里必须使用 bind 强制绑定 this
    vm[key] = methods[key].bind(vm);
  }
}

function Vue(options) {
  this.$options = options;
  this._init(options);
}

Vue.prototype._init = function (options) {
  const vm = this;
  vm._data=options.data;
  initData(vm);
  initMethods(options.methods, vm);
};

const _vm = new Vue({
  data: {
    msg: "hello",
    name: "赵四",
  },
  methods: {
    say() {
      console.log("say" + this.msg);
    },
    setMsg(msg) {
      this.msg = msg;
    }
  },
});

_vm.say();
_vm.setMsg("hello world");
_vm.say();



```
## 总结

第一次阅读源码，因为没有用过 vscode 的调试功能，虽然看过了川哥的新手教程，但是开始调试 vue 的时候还是很懵。再一个就是使用 cli 生成的新项目，用以下的方式会有 render 的处理过程，调了半天也没进入正题。
```js

new Vue({
  render: h => h(App),
}).$mount('#app')
```

参考了其他同学的文章，才知道这么写可以让整个调试过程更顺畅，更利索：
```js
new Vue({
  data: {
    msg: "Hello World",
  },
  methods: {
    changeMsg() {
      this.msg="Hello Vue.js";
    }
  },
}).$mount("#app");
```
