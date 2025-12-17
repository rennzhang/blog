---
hiddenInHome: false
description: JS Array 对应方法速查
title: Array 速查
readingTime: false
# group:
#  title: JS 速查表
date: 2025-01-17 00:00:00

tags:
 - 重学前端
 - javascript
 - js
 - 速查
# 左侧边栏推荐文章顺序
recommend: 2
---
# JavaScript 数组方法完全学习指南

---

## 一、方法分类速查表

### 1. 遍历方法
- **forEach**: 遍历数组，执行回调函数。
- **map**: 映射新数组，返回每个元素执行回调后的结果。
- **filter**: 过滤数组，返回满足条件的元素。
- **every**: 检查数组中的所有元素是否都满足条件。
- **some**: 检查数组中是否有元素满足条件。

### 2. 查找方法
- **find**: 查找第一个满足条件的元素。
- **findIndex**: 查找第一个满足条件的元素的索引。
- **includes**: 检查数组是否包含某个值。
- **indexOf**: 查找某个值的第一个索引。
- **lastIndexOf**: 查找某个值的最后一个索引。

### 3. 转换方法
- **reduce**: 累加器，将数组元素累加为一个值。
- **reduceRight**: 从右向左的累加器。
- **flat**: 扁平化嵌套数组。
- **flatMap**: 先映射后扁平化。

### 4. 修改方法
- **push**: 在数组末尾添加元素。
- **pop**: 删除数组末尾的元素。
- **unshift**: 在数组开头添加元素。
- **shift**: 删除数组开头的元素。
- **splice**: 在任意位置添加或删除元素。

### 5. 其他方法
- **slice**: 切片，返回数组的一部分。
- **concat**: 合并数组。
- **join**: 将数组元素连接为字符串。
- **reverse**: 反转数组。
- **sort**: 排序数组。
- **fill**: 填充数组。

---

## 二、详细说明

### 遍历类方法

#### 1. **forEach**
```javascript
array.forEach((item, index, array) => {})
```
遍历数组每个元素并执行回调函数。

**特点：**
- 返回值：`undefined`。
- 不修改原数组（除非在回调中修改）。
- 不能中断循环。
- 跳过空元素。
- 不支持 `async/await`。

**适用场景：**
- 简单遍历执行操作。
- DOM 操作。
- 日志打印。
- 副作用操作。

**示例：**
```javascript
const numbers = [1, 2, 3];
numbers.forEach(num => console.log(num * 2));
// 输出: 2, 4, 6
```

#### 2. **map**
```javascript
const newArray = array.map((item, index, array) => {})
```
创建一个新数组，其结果是对原数组每个元素执行回调函数的结果。

**特点：**
- 返回新数组。
- 不修改原数组。
- 保持数组长度不变。
- 支持链式调用。
- 跳过空元素。

**适用场景：**
- 数据转换。
- 格式化数组。
- 数学计算。
- 对象属性提取。

**示例：**
```javascript
const numbers = [1, 2, 3];
const doubled = numbers.map(num => num * 2);
// doubled: [2, 4, 6]
```

#### 3. **filter**
```javascript
const newArray = array.filter((item, index, array) => {})
```
创建一个新数组，包含所有通过测试的元素。

**特点：**
- 返回新数组。
- 不修改原数组。
- 可能改变数组长度。
- 支持链式调用。
- 跳过空元素。

**适用场景：**
- 数据筛选。
- 条件过滤。
- 去除无效值。
- 数据清洗。

**示例：**
```javascript
const numbers = [1, 2, 3, 4, 5];
const evenNumbers = numbers.filter(num => num % 2 === 0);
// evenNumbers: [2, 4]
```

---

### 查找类方法

#### 4. **find**
```javascript
const element = array.find((item, index, array) => {})
```
返回第一个满足测试条件的元素。

**特点：**
- 返回元素或 `undefined`。
- 不修改原数组。
- 找到即返回。
- 可用于复杂对象查找。

**适用场景：**
- 查找特定元素。
- 对象数组搜索。
- 条件查找。
- 单一元素获取。

**示例：**
```javascript
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
];
const user = users.find(user => user.id === 1);
// user: { id: 1, name: 'John' }
```

#### 5. **findIndex**
```javascript
const index = array.findIndex((item, index, array) => {})
```
返回第一个满足测试条件的元素的索引。

**特点：**
- 返回索引或 `-1`。
- 不修改原数组。
- 找到即返回。

**适用场景：**
- 查找元素的索引。
- 对象数组搜索。

**示例：**
```javascript
const numbers = [1, 2, 3, 4, 5];
const index = numbers.findIndex(num => num === 3);
// index: 2
```

---

### 转换类方法

#### 6. **reduce**
```javascript
const result = array.reduce((accumulator, item, index, array) => {}, initialValue)
```
将数组元素累加为一个值。

**特点：**
- 返回累加结果。
- 不修改原数组。
- 需要初始值（可选）。

**适用场景：**
- 数组求和。
- 数组转对象。
- 分组统计。

**示例：**
```javascript
const numbers = [1, 2, 3, 4];
const sum = numbers.reduce((acc, num) => acc + num, 0);
// sum: 10
```

#### 7. **flat**
```javascript
const newArray = array.flat(depth)
```
将嵌套数组扁平化。

**特点：**
- 返回新数组。
- 不修改原数组。
- 可指定扁平化深度。

**适用场景：**
- 扁平化嵌套数组。
- 处理多维数组。

**示例：**
```javascript
const nestedArray = [1, [2, [3, [4]]];
const flatArray = nestedArray.flat(2);
// flatArray: [1, 2, 3, [4]]
```

---

## 三、常见用法模式

### 1. 数据转换模式
```javascript
// 对象转换
const users = [{ name: 'John' }, { name: 'Jane' }];
const names = users.map(user => user.name);

// 数据过滤和转换
const validData = data
  .filter(item => item != null)
  .map(item => ({ ...item, processed: true }));
```

### 2. 累加器模式
```javascript
// 数组转对象
const arrayToObject = arr.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {});

// 分组统计
const groupBy = arr.reduce((acc, curr) => {
  acc[curr.type] = (acc[curr.type] || 0) + 1;
  return acc;
}, {});
```

---

## 四、性能优化建议

### 1. 选择合适的方法
```javascript
// 不好的做法
array.filter(x => x > 0).map(x => x * 2);

// 好的做法
array.reduce((acc, x) => {
  if (x > 0) acc.push(x * 2);
  return acc;
}, []);
```

### 2. 避免重复遍历
```javascript
// 不好的做法
const filtered = array.filter(x => x > 0);
const mapped = filtered.map(x => x * 2);

// 好的做法
const result = array.reduce((acc, x) => {
  if (x > 0) acc.push(x * 2);
  return acc;
}, []);
```

---

## 五、测试和调试

### 1. 常见测试场景
```javascript
// 空数组测试
method([]);

// 含空元素测试
method([1, , 3]);

// 边界值测试
method([Number.MAX_VALUE, -Infinity, NaN]);
```

### 2. 调试技巧
```javascript
// 使用 console.log 调试链式调用
array
  .map(x => { console.log('map:', x); return x * 2; })
  .filter(x => { console.log('filter:', x); return x > 0; });
```

---

## 六、实际应用示例

### 1. 数据处理
```javascript
// 用户数据处理
const users = [/* ... */];
const activeUsers = users
  .filter(user => user.active)
  .map(user => ({
    id: user.id,
    name: user.name,
    lastLogin: new Date(user.lastLogin)
  }));
```

### 2. DOM 操作
```javascript
// 列表渲染
const items = ['item1', 'item2', 'item3'];
items.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item;
  list.appendChild(li);
});
```

---

## 七、常见陷阱和注意事项

### 1. 返回值误区
```javascript
// push 返回长度而不是数组
const arr = [];
const result = arr.push(1, 2); // result: 2

// map 需要返回值
const mapped = arr.map(x => {
  x * 2; // 忘记 return，结果全是 undefined
});
```

### 2. 修改原数组
```javascript
// sort 会修改原数组
const arr = [3, 1, 2];
const sorted = arr.sort();
// arr 和 sorted 都被修改
```

---


