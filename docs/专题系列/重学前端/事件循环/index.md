---
tags:
 - 重学前端
 - 浏览器运行机制
 - 事件循环
 - 任务队列
 - 异步编程
# top: 1
sidebar: false
sticky: 2
date: 2024-08-08 17:02:59
---
# 重学前端之事件循环模型

事件循环老生常谈了，社区的相关文章也非常多，但这次为了彻底搞懂，我深度查看了规范中的规则以及 Chromium中的源码实现。本文章作为笔记记录。

::: info
本文主要参考了 [`WHATWG`](#whatwg) 规范中的定义。建议直接从规范中学习。
各家浏览器对事件循环的具体实现会有细微差别，本文所有代码输出均使用 chrome。
:::

::: tip
面试碰到很多问题，比如下面这些，面试官实际上很可能想问的是 **事件循环**，搞明白了之后就不用害怕被面试官牵着走了，甚至可以主动引导面试官问事件循环。
:::
1. 什么是进程？什么是线程？
2. 为什么 js 是异步的？
3. 说说 Promise解决了什么问题？
4. 什么是微任务和宏任务？
5. js 引擎执行代码的顺序是什么？
6. dom 点击事件中有大量计算后更新 dom，会有卡死现象如何优化？
7. 为什么 dom 点击事件中有大量的计算，即使使用异步，还是会影响用户交互操作？
8. JS 能实现精准计时器吗？
9. 如何实现一个尽可能精准的计时器？
10. 为什么说 js 是事件驱动的？
11. …

## 浏览器的进程模型

### 进程 (Process)

**定义**

进程是一个正在执行的程序的实例。它包含程序代码、数据、资源（如文件、内存）以及执行中的程序计数器、寄存器和堆栈。

**特点**

- **独立性**：进程是独立的执行单元，拥有自己的内存空间和资源。一个进程不能直接访问另一个进程的内存。
- **资源开销**：创建和销毁进程的开销较大，因为操作系统需要分配和管理独立的资源。
- **安全性**：由于进程之间相互独立，不同进程之间的错误不会直接影响彼此，提高了系统的稳定性。

**示例**

操作系统中的每个运行的应用程序，如文本编辑器、浏览器或计算器，都是一个进程。

### 线程 (Thread)

**定义**

线程是进程中的一个执行路径，也被称为轻量级进程（Lightweight Process, LWP）。一个进程可以包含多个线程，它们共享进程的内存和资源。

**特点**

- **共享资源**：同一个进程内的线程共享内存和资源，因此线程间通信和数据共享更加容易和高效。
- **开销较小**：创建和销毁线程的开销比进程小，因为线程之间共享进程的资源。
- **并行执行**：多线程允许一个进程中的多个任务并行执行，从而提高程序的执行效率。

**示例**

在一个文本编辑器中，可能会有一个线程负责响应用户输入，另一个线程负责自动保存文档，还有一个线程负责拼写检查。

**进程与线程的对比**

| 特性 | 进程 | 线程 |
| --- | --- | --- |
| 内存空间 | 独立 | 共享进程内存 |
| 创建开销 | 大 | 小 |
| 通信方式 | 通过进程间通信（IPC） | 通过共享内存 |
| 崩溃影响 | 独立进程崩溃不影响其他进程 | 线程崩溃可能导致整个进程崩溃 |
| 执行效率 | 较低（独立内存） | 较高（共享内存） |

**进程与线程的使用场景**

- **进程**：适用于需要高隔离性和稳定性的任务。例如，操作系统中的不同应用程序通常运行在独立的进程中。
- **线程**：适用于需要高效并行执行且可以共享资源的任务。例如，服务器应用程序中的每个请求可以由一个独立的线程处理。

**总结**

- **进程**是操作系统中独立运行的程序实例，拥有独立的内存空间和资源，适用于需要高隔离性和稳定性的任务。创建和销毁进程开销较大，但稳定性高。
- **线程**是进程中的执行路径，共享进程的内存和资源，适用于需要高效并行执行的任务。线程创建和销毁开销较小，但一个线程崩溃可能影响整个进程。

总结来说，进程提供隔离性和稳定性，而线程提供高效的并行执行能力。

### 浏览器有哪些进程和线程

**浏览器是一个多进程多线程的应用程序**，而 js 则是单线程的。

- **主进程**

    负责浏览器的用户界面（比如浏览器上面的地址栏、前进后退、书签管理等等）、管理各个子进程（管理和创建**渲染进程**）、处理用户输入以及与操作系统的交互（如文件访问）

- **渲染进程**

    每个标签页、iframe 都是一个独立的渲染进程。渲染进程需要处理非常多的任务，譬如：

    - 解析 HTML
    - 构建 DOM 树
    - 解析 CSS
    - 计算样式
    - 计算布局
    - 页面绘制（重排重绘）
    - 每秒渲染 60 次页面
    - 执行 JS 代码，处理宏任务微任务
    - …
- **网络进程**

    专门负责网络请求和资源下载，独立于主进程和渲染进程

- **GPU进程**

    负责处理图形相关任务，如3D绘图和硬件加速，以提高渲染性能

- **插件进程**

    浏览器插件运行在独立的插件进程中，负责处理插件相关的任务。

- …

---

在浏览器的每个渲染进程中，通常包括以下线程：

1. **主线程**：
    - 执行 JavaScript
    - 处理事件循环
    - 执行布局和绘制
2. **渲染线程**：
    - 负责页面的绘制
3. **合成线程**：
    - 处理 CSS 动画和合成层
4. **光栅化线程**：
    - 将合成层转换为位图
5. **网络线程**：
    - 处理网络请求
6. **Worker 线程**：
    - 用于 Web Worker 和 Service Worker 的执行


## 异步编程

众所周知，**JavaScript在浏览器的主线程中是单线程执行的**。***而异步编程允许代码在不阻塞主线程的情况下执行耗时操作。***

### 同步编程带来的问题

在浏览器环境中，每个标签页都有其独立的渲染进程，其中包含一个主线程负责处理多项任务，如解析 HTML、构建 DOM 树、解析 CSS、计算样式和布局、渲染页面以及执行 JavaScript 代码等。

如果所有这些任务都同步执行，可能会导致以下问题：

1. **主线程效率低下**：例如，在等待 AJAX 请求返回结果时，主线程处于空闲状态。
2. **用户体验差**：长时间的计算或等待可能导致页面无响应，影响交互。

为解决这些问题，浏览器引入了异步编程模型处理各种类型的任务，确保了主线程不会被阻塞，提高了程序的整体效率和响应性。事件循环就是异步的实现方式。

## JavaScript 中的任务类型

同步代码、微任务、宏任务的执行顺序是什么？

### 同步代码

在初始阶段，script 标签中的代码被包装称为一个宏任务放到任务队列中，此时是没有其他微任务的。在全局代码中按照出现的顺序立即执行的都是同步代码。

异步代码则分为微任务和宏任务。

### 微任务

在 JavaScript 中，微任务（Microtasks）是为了在当前事件循环结束之前执行的小任务。

微任务在 JavaScript 执行堆栈为空时运行；微任务的执行优先级高于宏任务（Macrotasks）。另外，W3C 规范中规定每个渲染进程（标签页或 **Web Worker** ）中必须且只能有一个微任务队列！

::: tip
不理解也没关系，只需要记住下面的微任务即可
:::


1. **Promise 回调函数**

    通过 `.then()`、`.catch()`、`.finally()` 注册的**回调函数是微任务**。但**Promise本身不是微任务。**

    例如：下面代码中`console.log('Promise');` 属于全局同步代码，并不会进入微任务队列！

    ```jsx
    console.log('Script start');

    setTimeout(() => {
        console.log('setTimeout');
    }, 0);

    new Promise((resolve, reject) => {
        console.log('Promise');
        resolve();
    }).then(() => {
        console.log('then');
    });

    // 监听 DOM 变化的回调
    const observer = new MutationObserver(() => {
    		// 该回调函数会进入为任务队列
        console.log('MutationObserver');
    });
    observer.observe(document.querySelector('.box'), {
        attributes: true
    });
    document.querySelector('.box').setAttribute('data', Math.random());

    Promise.resolve()
        .then(() => {
            console.log('Promise 1');
        })
        .then(() => {
            console.log('Promise 2');
        });

    console.log('Script end');

    // 执行结果：
    // Script start
    // Promise
    // Script end
    // then
    // MutationObserver
    // Promise 1
    // Promise 2
    // setTimeout
    ```

2. **[MutationObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver) 的回调函数**

    当监听 DOM 变化，其**触发的回调函数是微任务**。参考上面的代码 `console.log('MutationObserver');` 是先进入微任务队列后按队列顺序执行的。

3. **[queueMicrotask](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide) 的回调函数**

    显式将任务添加到微任务队列。可以用来改变某些代码的执行顺序，但如果增加过多`queueMicrotask` ，可能导致其他任务无法执行或延迟， 比如页面渲染任务。

    ```jsx
    console.log('Script start');

    setTimeout(() => {
        console.log('setTimeout');
    }, 0);

    new Promise((resolve, reject) => {
        console.log('Promise');
        resolve();
    }).then(() => {
        console.log('then');
    });

    // 如果执行下面的无限递归addMicrotask
    // 那么页面上.box textContent永远也不会变化，渲染 dom 是一个宏任务
    // 微任务没有执行完，控制权不会交换给事件循环，因此无法执行宏任务
    // function addMicrotask() {
    //     queueMicrotask(() => {
    //         console.log('Microtask executed');
    //         addMicrotask(); // 继续添加微任务
    //     });
    // }
    // addMicrotask()
    queueMicrotask(() => {
        console.log('Microtask 1');
    });

    const observer = new MutationObserver(() => {
        console.log('MutationObserver');
    });
    observer.observe(document.querySelector('.box'), {
        attributes: true,
    });
    document.querySelector('.box').textContent = +Date.now();

    console.log('Script end');

    // 执行结果
    // Script start
    // Promise
    // Script end
    // then
    // Microtask 1
    // setTimeout
    ```


### 宏任务

> 在最新的 W3C(WHATWG) 规范中，其实并没有宏任务的定义，而是直接称之为“[**任务**](https://html.spec.whatwg.org/multipage/webappapis.html#concept-task)”，为了容易区分，我们暂时还称为宏任务，但请记住，规范的说法是“[**任务**](https://html.spec.whatwg.org/multipage/webappapis.html#concept-task)”。

宏任务（Macrotasks）同样用于处理异步操作，他和微任务的最大区别在于执行时机，宏任务在微任务之后执行。js 中主要有以下宏任务：

1. **setTimeout/setInterval 定时器回调函数**
2. Node.js 中的 **setImmediate**
3. **I/O 操作：**  处理文件读写、网络请求等输入输出操作。
4. **UI 渲染：**  页面绘制、DOM更新等等
5. **MessageChannel：**  可以在不同的浏览器上下文之间持续双向通信
6. **postMessage：**  在不同窗口、iframe、或 worker 之间传递单个消息，单向通信
7. **事件回调：**  绑定到 DOM 事件，如点击、输入等

### 其他特殊任务

事实上，还有一些特殊的任务，他们既不是微任务也不是宏任务，有自己独立的运行机制，不适用于常规的事件循环机制，比如：

- **requestIdleCallback：**  在浏览器空闲时执行代码的 API，优先级较低
- **requestAnimationFrame：**  浏览器在下一次重绘之前，调用用户提供的回调函数。它的优先级高于宏任务，但低于微任务

## 任务队列

任务队列在[规范](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue)中有明确的说明：

- [事件循环](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop)有一个或多个任务队列。[任务队列](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue)是一[组](https://infra.spec.whatwg.org/#ordered-set)[任务](https://html.spec.whatwg.org/multipage/webappapis.html#concept-task)。
- *[任务队列](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue)是[集合](https://infra.spec.whatwg.org/#ordered-set)，而不是[队列](https://infra.spec.whatwg.org/#queue)，因为[事件循环处理模型](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)从所选队列中获取第一个[可运行的](https://html.spec.whatwg.org/multipage/webappapis.html#concept-task-runnable)[任务](https://html.spec.whatwg.org/multipage/webappapis.html#concept-task)，而不是使第一个任务[出队](https://infra.spec.whatwg.org/#queue-dequeue)。*
- *[微任务队列](https://html.spec.whatwg.org/multipage/webappapis.html#microtask-queue)不是[任务队列](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue)（这里指的是“宏”任务队列）。*



### 微任务队列

**[微任务队列](https://html.spec.whatwg.org/multipage/webappapis.html#microtask-queue)是当前 JavaScript 主线程中所有微任务的集合。**[规范](https://html.spec.whatwg.org/multipage/webappapis.html#microtask-queue)要求每个[事件循环](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop)都有一个微任务队列，最初是空的。

在所有的同步任务执行完成后，控制权移交事件循环，并获取微任务队列中第一个可运行的任务创建执行上下文后在执行堆栈中运行。

### 任务队列

::: tip
和上面所说的宏任务一样，规范中的准确定义是 **[`任务队列`](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue) 。**
:::



**[任务队列](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue)是当前 JavaScript 主线程中所有微任务的集合。** 但和为任务队列不同的是每个事件循环中可以有多个任务队列。

当页面加载或脚本执行时，最初的同步代码被视为一个宏任务。而此时执行栈是空的，微任务队列也是空的，所以这个“宏任务”会优先执行。

其他的情况则是按照 **执行同步代码 → 执行微任务 → 执行宏任务**的顺序。

> 使用定时器无法实现精准的定时效果，给他们传入延时参数只是最快执行的时间，而实际上即使计时到了，也必须等待所有的同步代码和微任务执行完成。

    另外，定时器嵌套达到5层后会延时参数最小值会强制从0变为4，这也增大了误差。


规范中定义了多个任务的类型，他们有自己关联的任务队列，比如，可能有以下队列：

- **DOM 操作队列：**  处理 DOM 相关的任务
- **网络事件队列：**  处理网络请求的响应
- **计时器队列：**  处理 `setTimeout` 和 `setInterval`
- **用户交互队列：**  处理用户输入事件，如点击和键盘输入。
- **渲染队列：**  处理与页面渲染相关的任务。

多个任务队列如何保证执行顺序？通常来说是按照进入队列的时间，不过规范中并没有严格定义，允许各家浏览器自行实现内部细节，但用户交互相关任务（如鼠标点击、键盘输入等）的优先级会较高一些，以确保用户操作的响应速度。

> 规范中的原文如下：
For example, a user agent could have one [task queue](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue) for mouse and key events (to which the [user interaction task source](https://html.spec.whatwg.org/multipage/webappapis.html#user-interaction-task-source) is associated), and another to which all other [task sources](https://html.spec.whatwg.org/multipage/webappapis.html#task-source) are associated. Then, using the freedom granted in the initial step of the [event loop processing model](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model), it could give keyboard and mouse events preference over other tasks three-quarters of the time, keeping the interface responsive but not starving other task queues. Note that in this setup, the processing model still enforces that the user agent would never process events from any one [task source](https://html.spec.whatwg.org/multipage/webappapis.html#task-source) out of order.

### **任务派发流程**

在浏览器环境中，虽然 JavaScript 是单线程执行的，但每个渲染进程（如每个 Tab 或 Worker）由多个线程组成。这些线程包括：

- **主线程（UI 线程）**：执行 JavaScript、布局、绘制等。
- **合成线程：**  处理页面合成和光栅化。
- **工作线程（Web Workers）**：包括Web Workers和其他后台任务处理线程。
- **IO线程：**  处理IPC通信和网络请求。
- **定时器线程**：处理定时任务（如 `setTimeout`、`setInterval`）。

当JavaScript代码在主线程的执行栈中运行时，遇到异步API（如定时器、网络请求、事件监听器等）会触发任务分发：

- **定时器任务：**  由定时器线程管理，到期后将回调函数封装为任务，放入任务队列。
- **网络请求：**  由IO线程处理，完成后将回调封装为任务，加入网络任务队列。
- **DOM事件：**  由主线程监听，事件触发时将监听器封装为任务，加入事件任务队列。
- **Promise微任务：**  在当前执行栈清空后，主线程立即处理这些微任务。

接下来等待**事件循环**处理任务队列即可。

- 浏览器内部会有一套非常复杂的逻辑用于管理不同优先级的任务队列，例如chromium 中的 [sequence_manger](https://github.com/chromium/chromium/blob/d53578e9ef7779254dc7b5681a339c75bbf2e234/base/task/sequence_manager/README.md)

## 事件循环

::: info
在 w3c 标准中称为[**`Event loops`**](https://www.w3.org/TR/2011/WD-html5-20110525/webappapis.html#event-loops) ，而在谷歌的 chromium 中称为 `Message Loop` ，源码中具体的实现方法是[`MessagePumpDefault::Run`](https://github.com/chromium/chromium/blob/main/base/message_loop/message_pump_default.cc#L32C6-L32C29) ，参考以下代码：

::: details
```cpp
    void MessagePumpDefault::Run(Delegate* delegate) {
      // 通过AutoReset类自动管理keep_running_的值。构造函数将keep_running_设置为true，
      // 析构函数将其恢复为原来的值。
      AutoReset<bool> auto_reset_keep_running(&keep_running_, true);

      // 无限循环，直到keep_running_被设置为false或遇到break语句。
      for (;;) {
    #if BUILDFLAG(IS_APPLE)
        // 在Apple平台上，创建一个自动释放池（autorelease pool），
        // 用于管理Objective-C对象的内存。
        apple::ScopedNSAutoreleasePool autorelease_pool;
    #endif

        // 调用delegate的DoWork方法获取下一步工作的信息。
        Delegate::NextWorkInfo next_work_info = delegate->DoWork();
        // 检查是否有更多的紧急工作需要立即处理。
        bool has_more_immediate_work = next_work_info.is_immediate();
        // 如果keep_running_被设置为false，退出循环。
        if (!keep_running_)
          break;

        // 如果有更多的紧急工作，继续循环处理，而不进行等待。
        if (has_more_immediate_work)
          continue;

        // 调用delegate的DoIdleWork方法，处理空闲时的工作。
        delegate->DoIdleWork();
        // 再次检查keep_running_，如果为false，则退出循环。
        if (!keep_running_)
          break;

        // 根据next_work_info中的信息决定是否进行等待。
        if (next_work_info.delayed_run_time.is_max()) {
          // 如果next_work_info.delayed_run_time为最大值，
          // 则进行无限等待，直到event_被触发。
          event_.Wait();
        } else {
          // 否则，等待指定的时间（remaining_delay）后再继续。
          event_.TimedWait(next_work_info.remaining_delay());
        }
        // Since event_ is auto-reset, we don't need to do anything special here
        // other than service each delegate method.
        // event_是自动重置的，因此我们不需要在这里做特殊处理。
        // 只需要继续服务每个delegate的方法。
      }
    }
```
:::





了解上面的内容后，事件循环就非常容易理解了。**整体流程如下：**

1. **主线程运行全局/局部同步代码，同时处理微任务队列和任务队列**
2. **同步代码执行完成通知事件循环启动并查询微任务队列中第一个可运行的任务交由执行栈运行代码，直至微任务队列为空**
3. **查询其他任务队列，取出第一个可运行任务交由执行栈运行代码**
4. **宏任务中可能存在同步代码或微任务，重复1-4，直至任务队列全部清空**

![https://fastly.jsdelivr.net/gh/rennzhang/blog-pics@main/images/1723099122073%E7%94%BB%E5%B8%83%E4%B8%80.png](https://fastly.jsdelivr.net/gh/rennzhang/blog-pics@main/images/1723099122073%E7%94%BB%E5%B8%83%E4%B8%80.png)

**Javascript 是事件驱动的。**

## 代码输出顺序

> 下面这道地狱级别输出题，能答对70%我相信就能应对大部分面试官了🤓（可以去掉**requestAnimationFrame和requestIdleCallback，这两个干扰比较大**）


> 这个案例中从输出结果来看channel.port2.postMessage的优先级似乎比 settimeout 要低一些，并没有严格按照代码出现顺序执行

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Macro and Microtasks</title>
    <style></style>
</head>

<body>
    <textarea name="" id=""></textarea>
    <div class="box"></div>

    <script>
        console.log("1");

        setTimeout(() => {
            console.log("2");
        }, 0);

        setTimeout(() => {
            console.log("3");
        }, 1000);

        const channel = new MessageChannel();
        channel.port1.onmessage = (val) => {
            console.log(val);
        };
        channel.port2.postMessage("4");

        setInterval(() => {
            console.log("55");
        }, 1000);

        let a = 1;
        while (a < 100000) {
            a++;
            if (a == 1000 || a == 100000) console.log(a);
        }

        new Promise(function (resolve, reject) {
            console.log("5");
            resolve(3);
        }).then(function (val) {
            console.log("6");
        });
        console.log(7);

        Promise.resolve()
            .then(() => {
                console.log("8");
            })
            .then(() => {
                console.log("9");
            });

        const observer = new MutationObserver(() => {
            console.log("MutationObserver 10");
        });
        observer.observe(document.querySelector(".box"), {
            attributes: true,
        });
        document.querySelector(".box").setAttribute("data", Math.random());
        setTimeout(() => {
            console.log("11");
            Promise.resolve().then(() => {
                console.log("12");
            });
            requestAnimationFrame(() => {
                console.log("RAF 13");
            });
        }, 0);

        console.log("14");
        requestIdleCallback(() => {
            console.log("requestIdleCallback 15");
        });

        queueMicrotask(() => {
            console.log("16");
            new Promise((resolve, reject) => {
                console.log("17");
                resolve();
            }).then(() => {
                console.log("18");
            });
            Promise.resolve()
                .then(() => {
                    console.log("19");
                })
                .then(() => {
                    console.log("20");
                });

            setTimeout(() => {
                console.log("21");
            }, 0);

            requestAnimationFrame(() => {
                console.log("RAF 22");
            });
        });

        Promise.resolve()
            .then(() => {
                console.log("23");
            })
        channel.port2.postMessage("24");

        requestAnimationFrame(() => {
            console.log("RAF 25");
        });

        console.log("26");
    </script>
</body>

</html>

```

## 参考资料

### WHATWG

虽然W3C曾是Web标准的主要制定者，但在HTML方面，WHATWG的“Living Standard”模式更适合快速变化的Web环境。W3C的标准更新较慢，可能无法及时反映最新的技术和浏览器实现。最重要的是，各大浏览器厂商通常使用WHATWG的规范来实现HTML和DOM标准。

### 资料列表

1. [事件循环 - HTML Standard](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop)
2. [任务队列 - HTML Standard](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue)
3. [任务源类型 - HTML Standard](https://html.spec.whatwg.org/multipage/webappapis.html#generic-task-sources)
4. [事件循环执行步骤 - HTML Standard](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)
5. [深入：微任务与 Javascript 运行时环境 - Web API | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth)
6. [并发模型与事件循环 - JavaScript | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Event_loop)
7. [在 JavaScript 中通过 queueMicrotask() 使用微任务 - Web API | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide#任务_vs_微任务)
8. [base::CurrentTaskRunner 提案](https://docs.google.com/document/u/0/d/1iugySsfTXtSg4cBwAarhObu89392hYZp-119x7inhR0/mobilebasic?_immersive_translate_auto_translate=1)
9. [Chromium Docs - Threading and Tasks in Chrome](https://chromium.googlesource.com/chromium/src/+/main/docs/threading_and_tasks.md#Posting-to-the-Current-Virtual_Thread)
10. [chromium/base/task/sequence_manager/README.md · chromium/chromium](https://github.com/chromium/chromium/blob/d53578e9ef7779254dc7b5681a339c75bbf2e234/base/task/sequence_manager/README.md)
11. [Chrome 浏览器中的事件循环工作原理 | 作者：Roman Melnik](https://javascript.plainenglish.io/how-the-event-loop-works-in-the-chrome-browser-ccf99c6c5a5)
12. [浏览器线程 | Cycle263 Blog](https://cycle263.github.io/blogs/javascripts/depth/async/thread.html)
