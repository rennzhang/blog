---
tags:
 - 微前端
 - qiankun
 - 工程化
# top: 1
sidebar: false
sticky: false
date: 2023-09-02
---
# 微前端子应用中渲染父应用组件技术方案



## 需求背景

在bms车辆页面-车辆详情页中，需增加两个tab页：*违章信息页面* 和 *年检信息页面*

这两个页面是**基座应用中已有的两个组件，**为了避免重复开发需要实现功能复用。

## 预研方案

### iframe 嵌入

- 优点
    - 简单快速（不准确，参考缺点三）
- 缺点
    - 组件通信困难
    - 资源重复加载，性能差
    - **有多个入口可以进入页面，这两个组件需要初始化查询参数，意味着每个入口的跳转 url 都需要改造**

### **MicroAPP + CreatePortal**

- 优点
    - 通信简单
    - 组件复用
    - **无需改造所有入口url，在子应用内可以拿到所需参数**
- 缺点
    - 实现逻辑相对复杂，会对理解代码有一定心智负担

## 实现思路

1. 通过 qiankun 全局 state 注册一个**挂载函数(mountMicroPortalComponent)**
2. 子应用中确定**挂载点（micro-portal-container），**并在挂载点所在**组件初始渲染**后调用**挂载函数**（携带唯一ID 和 父应用所需参数）
3. 父应用中处理参数并根据唯一ID控制对应组件的创建渲染（isMount）
4. 通过 ReactDOM.createPortal 方法把父应用组件 "传送" 到子应用挂载点



如图：

![Untitled](https://open-aletopelta-5c5.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F071b3916-4691-493f-a204-c5c77d551cac%2F55557621-db2a-426b-a809-170ad1b6daf8%2FUntitled.png?table=block&id=8eb81c23-c591-4182-b9fe-1016b84d7f42&spaceId=071b3916-4691-493f-a204-c5c77d551cac&width=2000&userId=&cache=v2)

## 具体实施

### 一、在父应用中维护一个需要 portal 的组件状态对象

> 子应用挂载点应有一个特殊前缀（MICRO_PORTAL_CONTAINER_PREFIX），方便区分
>

```jsx
// 子应用中嵌入父应用的容器id前缀
const MICRO_PORTAL_CONTAINER_PREFIX = 'MICRO_PORTAL_CONTAINER_';
const portalComponentMap = useReactive<PortalComponentMap>({
    compA: {
      // 要嵌入子应用中的组件
      component: ViolationList,
      // 嵌入子应用的容器id
      containerId: MICRO_PORTAL_CONTAINER_PREFIX + "compA",
      // 是否挂载组件，通过在子应用中调用mountMicroPortalComponent方法来修改
      isMount: false,
      props: {
        microPortalParams: {}, // 子应用传递的参数
      },
    },
    // compB: {...},
    // compC: {...}
  });

```

### 二、在 qiankun GlobalState (父应用)中注册挂载函数和特殊前缀

```jsx
  Actions.setGlobalState({
    quickEntryList: [1, 2, 3],
    microUrl: microUrlIn,

    // 挂载函数
    mountMicroPortalComponent: (
      name: keyof typeof portalComponentMap,
      params: MicroPortalProps['microPortalParams'],
    ) => {
      portalComponentMap[name].isMount = true;
      portalComponentMap[name].props.microPortalParams = params;
    },
    // 特殊前缀
    MICRO_PORTAL_CONTAINER_PREFIX,
  });
```

### 三、在子应用中调用挂载函数通知父应用挂载

1. 接收挂载函数并挂到window上，方便所有组件访问

```jsx
import Actions from '../utils/Action';

export default {
  namespace: 'global',
  state: {/** ... */},
  effects: {/** ... */},
  reducers: {/** ... */},

  subscriptions: {
    // ...
    microAPP({ dispatch }) {
      Actions.onGlobalStateChange((state) => {
        const {
          microUrl,
          mountMicroPortalComponent,
          MICRO_PORTAL_CONTAINER_PREFIX
        } = state;

        window.mountMicroPortalComponent = mountMicroPortalComponent;
				window.MICRO_PORTAL_CONTAINER_PREFIX = MICRO_PORTAL_CONTAINER_PREFIX

        dispatch({
          type: 'changeCurrUrl',
          payload: {
            currUrl: microUrl,
          },
        });
      }, true);
    },
  }
```

1. 封装一个通用的**挂载点组件**

```jsx
import React, { useEffect } from 'react';

/*
用来渲染微前端的组件, div 用来挂载父应用组件
必须保证id和父应用的id一致
*/
export default function MicroPortalContainer({ id, params }) {

  useEffect(() => {
    window?.mountMicroPortalComponent?.(id,params);
  }, [])

  return <div id={window.MICRO_PORTAL_CONTAINER_PREFIX + id}></div>;
}
```

1. 在相关业务组件中使用**挂载点组件**

```jsx
<MicroPortalContainer id="violationList" params={microPortalCompParams} />
```

### 四、触发父应用挂载

- 参考上面的挂载函数，主要逻辑如下

```jsx
portalComponentMap[name].isMount = true;
portalComponentMap[name].props.microPortalParams = params;
```

创建组件并通过 ReactDOM.createPortal 把目标组件 "传送" 到子应用的**挂载点**

```jsx
{
  Object.values(portalComponentMap).map((item) => {
    return (
      item.isMount &&
      ReactDOM.createPortal(
        <item.component microPortalParams={item.props.microPortalParams} />,
        document.querySelector("#" + item.containerId) || document.body
      )
    );
  });
}
```

[无标题-2023-09-01-1714.excalidraw](https://prod-files-secure.s3.us-west-2.amazonaws.com/071b3916-4691-493f-a204-c5c77d551cac/aee0b5a0-d96f-485e-a183-d395adde25a6/%E6%97%A0%E6%A0%87%E9%A2%98-2023-09-01-1714.excalidraw)
