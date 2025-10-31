---
title: codemirror-editor-vue3：在 Vue 3 中集成 CodeMirror 文本编辑器的完美选择
sidebar: false
description: "这是一个在 Vue 3 中集成 CodeMirror 文本编辑器的完美选择。

codemirror-editor-vue3 提供了简单而强大的方式，让您可以在 Vue 3 项目中充分利用 CodeMirror 的功能。它支持语法高亮、代码补全和代码折叠等特性，使您的编辑体验更加高效和愉悦。"
# outline: [2,3]
sticky: 999
top: 1
hiddenInHome: false
tags:
 - 我的开源
 - codemirror-editor-vue3
 - Web IDE
 - vue3

cover: https://files.catbox.moe/6laqa8.png
hiddenCover: true
date: 2023-09-10
---

# codemirror-editor-vue3：在 Vue 3 中集成 CodeMirror 文本编辑器的完美选择
[![GitHub stars](https://img.shields.io/github/stars/RennCheung/codemirror-editor-vue3)](https://github.com/RennCheung/codemirror-editor-vue3/stargazers) [![npm downloads](https://img.shields.io/npm/dt/codemirror-editor-vue3)](https://www.npmjs.com/package/codemirror-editor-vue3) [![GitHub issues](https://img.shields.io/github/issues/RennCheung/codemirror-editor-vue3)](https://github.com/RennCheung/codemirror-editor-vue3/issues) [![GitHub forks](https://img.shields.io/github/forks/RennCheung/codemirror-editor-vue3)](https://github.com/RennCheung/codemirror-editor-vue3/network) [![GitHub last commit](https://img.shields.io/github/last-commit/RennCheung/codemirror-editor-vue3)](https://github.com/RennCheung/codemirror-editor-vue3) [![license](https://img.shields.io/github/license/RennCheung/codemirror-editor-vue3)](https://github.com/RennCheung/codemirror-editor-vue3)

[查看文档](https://rennzhang.github.io/codemirror-editor-vue3/)


## 效果展示
<component v-if="dynamicComponent" :is="dynamicComponent"></component>

![6laqa8.png](https://files.catbox.moe/6laqa8.png)


## "自卖自瓜"
> 以下内容来自 ChatGPT

这是一个在 Vue 3 中集成 CodeMirror 文本编辑器的完美选择。

codemirror-editor-vue3 提供了简单而强大的方式，让您可以在 Vue 3 项目中充分利用 CodeMirror 的功能。它支持语法高亮、代码补全和代码折叠等特性，使您的编辑体验更加高效和愉悦。

该组件与 Vue 3 深度集成，充分发挥 Vue 3 的响应式系统和组件化架构的优势。您可以轻松地在 Vue 3 组件中使用 codemirror-editor-vue3，并通过 Vue 的数据绑定和组件通信机制实现实时更新和交互。

codemirror-editor-vue3 提供了丰富的选项和配置，以满足不同的需求和设计风格。您可以自定义编辑器的外观、行为和功能，使其与您的项目完美融合。

此外，codemirror-editor-vue3 的开发团队持续维护和更新该项目，保持与最新的 Vue 3 版本和 CodeMirror 特性同步。

## 使用示例



### 安装

::: code-group

```bash [npm]
npm install codemirror-editor-vue3 codemirror@5.x -S
```

```bash [yarn]
yarn add codemirror-editor-vue3 codemirror@^5.65.12
```

```bash [pnpm]
pnpm i codemirror-editor-vue3 codemirror@^5.65.12 -S
```

:::

::: details 使用 Typescript

如果你的项目需要支持 Typescript，那还需要安装对应的类型包.

::: code-group

```bash [npm]
npm install @types/codemirror -D
```

```bash [yarn]
yarn add @types/codemirror
```

```bash [pnpm]
pnpm i @types/codemirror -D
```

:::

### 注册全局组件

::: warning

提示不建议全局注册组件，这会导致无法正确获取模板上的类型提示。

:::

::: code-group

```js [main.js]
import { createApp } from "vue"
import App from "./App.vue"
import { InstallCodemirro } from "codemirror-editor-vue3" // [!code ++]

const app = createApp(App)
app.use(InstallCodemirro) // [!code ++]
app.mount("#app")
```

:::

全局注册组件名称是`Codemirror`，也可以自定义一个组件名称，例如：

::: code-group

```js [main.js]
// ....
app.use(InstallCodemirro, { componentName: "customName" }) // [!code ++]
```

:::

---

### 在组件中使用

这是一个常用的 javascript 语言的案例。

<component v-if="dynamicComponent" :is="dynamicComponent"></component>

具体代码如下：

::: code-group

```vue [index.vue]
<template>
  <Codemirror
    v-model:value="code"
    :options="cmOptions"
    border
    ref="cmRef"
    height="400"
    width="600"
    @change="onChange"
    @input="onInput"
    @ready="onReady"
  >
  </Codemirror>
</template>
<script>
  import { ref, onMounted, onUnmounted } from "vue"
  import "codemirror/mode/javascript/javascript.js"
  import Codemirror from "codemirror-editor-vue3"
  export default {
    components: { Codemirror },
    setup() {
      const code = ref(
        `var i = 0;
for (; i < 9; i++) {
    console.log(i);
    // more statements
}
`
      )

      const cmRef = ref()
      const cmOptions = {
        mode: "text/javascript"
      }
      const onChange = (val, cm) => {
        console.log(val)
        console.log(cm.getValue())
      }

      const onInput = (val) => {
        console.log(val)
      }

      const onReady = (cm) => {
        console.log(cm.focus())
      }

      onMounted(() => {
        setTimeout(() => {
          cmRef.value?.refresh()
        }, 1000)

        setTimeout(() => {
          cmRef.value?.resize(300, 200)
        }, 2000)

        setTimeout(() => {
          cmRef.value?.cminstance.isClean()
        }, 3000)
      })

      onUnmounted(() => {
        cmRef.value?.destroy()
      })

      return {
        code,
        cmRef,
        cmOptions,
        onChange,
        onInput,
        onReady
      }
    }
  }
</script>
```

```vue [index.vue(ts setup)]
<template>
  <Codemirror
    v-model:value="code"
    :options="cmOptions"
    border
    ref="cmRef"
    height="400"
    width="600"
    @change="onChange"
    @input="onInput"
    @ready="onReady"
  >
  </Codemirror>
</template>
<script lang="ts" setup>
  import { ref, onMounted, onUnmounted } from "vue"
  import "codemirror/mode/javascript/javascript.js"
  import Codemirror from "codemirror-editor-vue3"
  import type { CmComponentRef } from "codemirror-editor-vue3"
  import type { Editor, EditorConfiguration } from "codemirror"

  const code = ref(
    `var i = 0;
for (; i < 9; i++) {
    console.log(i);
    // more statements
}
`
  )
  const cmRef = ref<CmComponentRef>()
  const cmOptions: EditorConfiguration = {
    mode: "text/javascript"
  }

  const onChange = (val: string, cm: Editor) => {
    console.log(val)
    console.log(cm.getValue())
  }

  const onInput = (val: string) => {
    console.log(val)
  }

  const onReady = (cm: Editor) => {
    console.log(cm.focus())
  }

  onMounted(() => {
    setTimeout(() => {
      cmRef.value?.refresh()
    }, 1000)

    setTimeout(() => {
      cmRef.value?.resize(300, 200)
    }, 2000)

    setTimeout(() => {
      cmRef.value?.cminstance.isClean()
    }, 3000)
  })

  onUnmounted(() => {
    cmRef.value?.destroy()
  })
</script>
```

:::
<script >
import {shallowRef} from "vue"
export default {
  data() {
    return {
      dynamicComponent: null
    }
  },

  mounted() {
    import('../../../demo/codemirror.vue').then((module) => {
      this.dynamicComponent = shallowRef(module.default)
    })
  }
}
</script>
<!-- <UserWorksPage /> -->
