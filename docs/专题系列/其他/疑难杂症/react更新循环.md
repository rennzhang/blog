---
group:
 title: 疑难杂症
tags:
 - 疑难杂症
 - Ant Design
 - React
# top: 1
sidebar: false
sticky: 1
date: 2024-11-14 14:36:20
---


# React 性能优化：解决表单组件的更新循环问题

## 问题背景
最近在开做 appsmith 项目的二开，在开发一个基于 Ant Design Form 的 JSON 表单组件时，我们遇到了一个性能问题。当用户在 TreeSelect 组件中选择选项时，页面会变得卡顿。通过分析发现这是由状态更新引起的循环重渲染导致的。

## 问题复现

让我们先看一个简化的示例来复现这个问题：

```tsx
function TreeSelectForm() {
  const [formData, setFormData] = useState({});

  const updateFormData = useCallback((values) => {
    const newFormData = {...formData, ...values};
    if (!isEqual(formData, newFormData)) {
      setFormData(newFormData);
    }
  }, [formData]);

  const handleChange = useCallback((value) => {
    updateFormData({ field: value });
  }, [updateFormData]);

  return (
    <Form>
      <TreeSelect
        onChange={handleChange}
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' }
        ]}
      />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </Form>
  );
}
```

在这个例子中，每次 TreeSelect 的值改变时会触发以下更新循环：

1. TreeSelect 值变化 → 触发 handleChange
2. handleChange 调用 updateFormData
3. updateFormData 更新 formData 状态
4. formData 变化 → updateFormData 重新创建
5. updateFormData 变化 → handleChange 重新创建
6. handleChange 变化 → TreeSelect 重新渲染
7. 回到步骤 1

## 解决方案探索

### 方案1：减少依赖项

最直观的想法是减少 useCallback 的依赖项：

```tsx
const handleChange = useCallback((value) => {
  updateFormData({ field: value });
}, []); // 去掉 updateFormData 依赖
```

但这样做会违反 React Hooks 的规则，可能导致更新不及时或使用到过期的闭包值。

### 方案2：使用 useReducer

尝试用 useReducer 来管理状态：

```tsx
function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FORM':
      return {...state, ...action.payload};
    default:
      return state;
  }
}

function TreeSelectForm() {
  const [state, dispatch] = useReducer(reducer, {});

  const handleChange = useCallback((value) => {
    dispatch({ type: 'UPDATE_FORM', payload: { field: value } });
  }, []);

  return (
    <Form>
      <TreeSelect
        onChange={handleChange}
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' }
        ]}
      />
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </Form>
  );
}
```

这个方案可以工作，但当表单逻辑复杂时，reducer 的维护成本会很高。

### 方案3：使用 useRef（最终方案）

最后我们采用了使用 useRef 来存储表单数据的方案：

```tsx
function TreeSelectForm() {
  // 使用 ref 存储表单数据
  const formDataRef = useRef({});
  // 用于触发UI更新的state
  const [, forceUpdate] = useState({});

  const updateFormData = useCallback((values) => {
    const newFormData = {...formDataRef.current, ...values};
    if (!isEqual(formDataRef.current, newFormData)) {
      formDataRef.current = newFormData;
      // 只在需要更新UI时触发重渲染
      forceUpdate({});
    }
  }, []); // 没有依赖项

  const handleChange = useCallback((value) => {
    updateFormData({ field: value });
  }, []); // 只依赖稳定的函数

  return (
    <Form>
      <TreeSelect
        onChange={handleChange}
        options={[
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' }
        ]}
      />
      <pre>{JSON.stringify(formDataRef.current, null, 2)}</pre>
    </Form>
  );
}
```

## 完整示例

这里是一个完整的可运行示例，展示了优化前后的性能差异：

```tsx
import React, { useState, useCallback, useRef } from 'react';
import { Form, TreeSelect } from 'antd';
import { isEqual } from 'lodash';

// 优化前的实现
function BeforeOptimization() {
  const [formData, setFormData] = useState({});

  const updateFormData = useCallback((values) => {
    const newFormData = {...formData, ...values};
    if (!isEqual(formData, newFormData)) {
      setFormData(newFormData);
    }
  }, [formData]);

  const handleChange = useCallback((value) => {
    updateFormData({ field: value });
  }, [updateFormData]);

  console.log('BeforeOptimization render');

  return (
    <div>
      <h3>优化前</h3>
      <Form>
        <TreeSelect
          onChange={handleChange}
          style={{ width: 200 }}
          treeData={[
            { value: '1', title: 'Option 1' },
            { value: '2', title: 'Option 2' }
          ]}
        />
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </Form>
    </div>
  );
}

// 优化后的实现
function AfterOptimization() {
  const formDataRef = useRef({});
  const [, forceUpdate] = useState({});

  const updateFormData = useCallback((values) => {
    const newFormData = {...formDataRef.current, ...values};
    if (!isEqual(formDataRef.current, newFormData)) {
      formDataRef.current = newFormData;
      forceUpdate({});
    }
  }, []);

  const handleChange = useCallback((value) => {
    updateFormData({ field: value });
  }, []);

  console.log('AfterOptimization render');

  return (
    <div>
      <h3>优化后</h3>
      <Form>
        <TreeSelect
          onChange={handleChange}
          style={{ width: 200 }}
          treeData={[
            { value: '1', title: 'Option 1' },
            { value: '2', title: 'Option 2' }
          ]}
        />
        <pre>{JSON.stringify(formDataRef.current, null, 2)}</pre>
      </Form>
    </div>
  );
}

// 对比组件
function ComparisonDemo() {
  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <BeforeOptimization />
      <AfterOptimization />
    </div>
  );
}

export default ComparisonDemo;
```

## 性能提升原理

1. **状态存储**：使用 useRef 存储表单数据，ref 的更新不会触发组件重渲染

2. **依赖稳定**：
   - updateFormData 没有依赖项，保持稳定
   - handleChange 也没有依赖项，不会随状态变化而重新创建

3. **按需更新**：
   - 只在表单数据真正变化时才触发 UI 更新
   - 避免了不必要的中间状态更新

4. **避免循环**：
   - 打破了状态更新→回调重建→组件重渲染的循环
   - 回调函数保持稳定，减少子组件的重渲染

## 性能对比

可以通过 React DevTools 的 Profiler 观察到：

- 优化前：每次选择都会触发多次渲染
- 优化后：只在数据真正变化时触发一次渲染

## 最佳实践建议

1. 优先考虑是否真的需要将数据放入 state
2. 使用 useRef 存储不需要触发重渲染的数据
3. 谨慎设计 useCallback 的依赖项
4. 合理使用 memo 来避免子组件不必要的重渲染
5. 使用 React DevTools 进行性能分析和优化

## 总结

这个案例展示了在 React 应用中处理表单状态时的一个常见性能问题。通过使用 useRef 和精心设计的状态更新策略，我们可以显著提升表单组件的性能。这个优化方案不仅适用于这个特定场景，也可以推广到其他需要管理复杂状态且对性能敏感的场景中。
