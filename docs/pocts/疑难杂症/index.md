---
tags:
 - 疑难杂症
 - Ant Design
 - React
# top: 1
sidebar: false
sticky: 1
date: 2024-07-25 18:30:04
---

# 使用字典表管理 Antd 时间选择器禁用时间，支持多时段禁用

你是否遇到过这样的需求：在 Ant Design 的时间选择器中使用 disabledTime 属性来禁用某个时间？或者禁用过去某个时间段、未来某个时间段，甚至多个时间段？在我基于 Appsmith 进行二次开发时，就碰到了这样一个难题。

为了应对这些复杂的禁用规则，我找到了一种高效且简洁、易于管理和扩展的解决方案——使用字典表来管理这些禁用时间。

或许已经有大佬实现了类似甚至更强的功能，但由于我没找到相关资料，因此写下这篇文章，文章写的不好，只是记录碰到的问题，分享下我的解决方案，希望能对有同样需求的你有所帮助。

具体的代码实现在最下方。

## 前言

如果你用过 `disabledTime` 属性，就知道他和日期选择器组件的 `disabledDate` 是完全不一样的。

对于`disabledDate`，他接受的是一个函数，函数返回值为布尔值，你可以通过 dayjs 直接对比大小或者使用 `isAfter`、`isBefore`、`isSame` 等 api 来实现：

```ts
const disabledDate: RangePickerProps["disabledDate"] = (current) => {
  // Can not select days before today and today
  return current && current < dayjs("2020-01-01");
};

// or
const disabledDate: RangePickerProps["disabledDate"] = (current) => {
  const today = dayjs();
  // Can not select days before today and today
  return current && current.isAfter(today, "day");
};

```

相比较下时间的禁用就复杂的多：

```ts
// 禁用 12:30:00、12:20:40、14:20:45
const disabledDateTime = () => ({
  disabledHours: () => [],
  disabledMinutes: (selectedHour: number) => {
    if (selectedHour == 12) {
      return [30];
    }
  },
  disabledSeconds: (selectedHour: number, selectedMinute: number) => {
    if (selectedHour == 12) {
      if (selectedMinute == 30) return [0];
      if (selectedMinute == 20) return [40];
    } else if (selectedHour == 14) {
      if (selectedMinute == 20) return [45];
    }
  },
});

```

如果要支持更多的时间禁用，代码就更不好写了

## 为什么会有这样的需求？

最近，我在基于 [Appsmith](https://github.com/appsmithorg/appsmith) 二开（个人学习），需要将 Ant Design 的时间选择器组件集成到 Appsmith 中，Appsmith 是一个开源的低代码平台，所有的组件属性都由配置项控制，为了适配 TimePicker 的 `disabledTime` 属性并支持多种复杂的禁用规则，比如禁用当日已过时间、禁用未来某个时间段、禁用上午或下午等，我需要编写一个简洁通用、容易维护的方法。

![1721902655253Untitled.png](https://fastly.jsdelivr.net/gh/rennzhang/blog-pics@main/images/1721902655253Untitled.png)

如图所示，我需要预置一些禁用方案供使用 Appsmith 的人员来自主选择需要禁用那些时间，我提供了一些预置方案，比如：

*   禁用当日已过时间
*   禁用当日剩余时间
*   禁用上午
*   禁用下午
*   禁用过去10分钟
*   禁用未来10分钟
*   禁用过去30分钟
*   禁用未来30分钟
*   禁用过去1小时
*   禁用未来1小时
*   禁用过去3小时
*   禁用未来3小时
*   禁用指定时分秒
*   禁用特定时间
*   自定义多时间段

## 初步实现（掉坑）

或许你只需要实现其中一种就够了，但我做的低代码二开，本着尽可能让低代码组件更好用的想法，我想把这些规则全部实现。观察一下上面的这些规则其实可以分为 5 类：

1.  禁用上午、下午：这是最简单的

```ts
let disabledRule = "am"; // or pm

const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};

const disabledTime = () => {
  return {
    disabledHours: () => (disabledRule === "am" ? range(0, 12) : range(12, 23)),
  };
};

```

1.  禁用指定时分秒，也很简单：

```ts
const specificHours = [1, 5, 12, 18];
const specificMinutes = [10, 20, 30, 40, 50];
const specificSeconds = [3, 6, 9];
const disabledTime = () => {
  return {
    disabledHours: () => specificHours,
    disabledMinutes: () => specificMinutes,
    disabledSeconds: () => specificSeconds,
  };
};
```

1.  禁用特定的时间

```ts
// antd 时间选择器禁用指定的时间
const specificTimes = ["08:00:00", "10:20:00", "12:30:50"];
const disabledTime = () => {
  return {
    disabledHours: () => {
      return [];
    },
    disabledMinutes: (h: number) => {
      let dm = [];
      return dm;
    },
    disabledSeconds: (h: number, m: number) => {
      let ds: number[] = [];
      specificTimes.forEach((time) => {
        const [hour, minute, second] = time
          .split(":")
          .map((item) => parseInt(item));
        if (h === hour && m === minute) {
          ds.push(second);
        }
      });
      return ds;
    },
  };
};

```

1.  禁用某个时间段，比如过去十分钟、未来一小时等，我也实现了一种方案：

<https://stackblitz.com/edit/react-7nww5n?file=demo.tsx>

```ts
// 禁用过去五分钟
// const [start, end] = [dayjs().subtract(5, 'minute'), dayjs()];
// 禁用未来十分钟
// const [start, end] = [dayjs(), dayjs().add(10, 'minute')];
// 禁用未来 3 小时
// const [start, end] = [dayjs(), dayjs().add(3, 'h')];
// 禁用过去 3 小时
const [start, end] = [dayjs().subtract(3, "h"), dayjs()];

const disabledTime = () => {
  let endTime = end;
  let startTime = start;
  let startWith0 = !start.minute() && !start.seconds();
  const disabledHours = () => {
    const _hours = [];

    const now = endTime;
    if (startWith0) {
      return range(0, endTime.hour() - 1);
    }
    let curTime = dayjs(start).add(1, "hour");
    while (curTime.isBefore(now)) {
      _hours.push(curTime.hour());
      curTime = curTime.add(1, "hour");
    }
    return _hours;
  };

  const disabledMinutes = (selectedHour: number) => {
    let minutes: number[] = [];
    if (selectedHour > startTime.hour() && selectedHour < endTime.hour()) {
      minutes = range(0, 59);
    } else {
      // 获取当前时间
      const now = endTime;
      let curTime = dayjs(start).add(1, "minute");
      // 初始化数组来存储时间点
      const timeMinuteMap: any = {};
      while (curTime.isBefore(now)) {
        timeMinuteMap[curTime.hour()] = [
          ...(timeMinuteMap[curTime.hour()] || []),
          curTime.minute(),
        ];
        curTime = curTime.add(1, "minute");
      }
      startWith0 && (timeMinuteMap[selectedHour] || [])?.pop();
      minutes = timeMinuteMap[selectedHour] || [];
    }
    return minutes;
  };

  const disabledSeconds = (selectedHour: number, selectedMinute: number) => {
    let seconds: number[] = [];

    if (selectedHour == -1 || selectedMinute == -1) return seconds;

    if (
      selectedHour === startTime.hour() &&
      selectedMinute === startTime.minute()
    ) {
      seconds = range(startTime.second(), 60);
    } else if (
      selectedHour === endTime.hour() &&
      selectedMinute === endTime.minute()
    ) {
      seconds = range(0, endTime.second() - 1);
    } else if (
      selectedHour > startTime.hour() &&
      selectedHour < endTime.hour()
    ) {
      seconds = range(0, 59);
    }

    return seconds;
  };

  return {
    disabledHours,
    disabledMinutes,
    disabledSeconds,
  };
};

```

上面的代码都是可用的，但当我处理第五种规则`自定义多时段` 时，才发现有坑，我当然可以在写一套适配`自定义多时段` 规则的方案，但是也意味着我我需要至少维护 5 套规则的代码，感觉好像有点开始恶心了...

维护吃力不说，调试验证也很复杂。能不能设计一套方案，所有的规则共用呢？我在看上面第四个规则的代码时，有一行代码给了我灵感！

```ts
// 初始化数组来存储时间点
const timeMinuteMap: any = {};
```

可不可以把所有需要禁用的时分秒存储为字典呢？！

## 重构方案实现字典表（映射）查询禁用时间节点

### 规则分析

首先观察一下上面的规则，禁用上午下午、禁用时分秒没有复杂逻辑，多写一个判断就可以了，没必要处理，而`禁用某个时间段`、`自定义多时间段`具有同一个特点，就是**时间段**，时间段一定有开始时间和结束时间。

再看禁用某个特定时间，他是一个固定的时间点，如果能让他也变成时间段，那就可以把它当作`禁用某个时间段` ，这很简单，让结束时间等于开始时间就可以了：

```ts
const specificTimes = ["08:00:00", "10:20:00", "12:30:50"];

// 转换后结果
const transTimes = ["08:00:00-08:00:00", "10:20:00-10:20:00", "12:30:50-12:30:50"];
```

现在只需要实现一种方案就可以适配所有规则了！

### 如何设计字典表（映射）

字典表的 key 是什么？时分秒是否需要嵌套结构？

假设我们需要禁用以下时段：

```ts
const disabledRangeTimes = ["08:00:00-09:00:00", "09:45:00-10:30:00", "12:30:40-14:45:50"]
```

首先了解一个前提，antd 时间选择器 `disabledTime` 属性，如果禁用整个小时，比如 8，那8 点这个小时是无法选择的，分也同理，可以推断出一些规律：

*   如果开始时间是 `"HH:00:00"` 或者 结束时间是 `"HH:59:59"`，那么这整个小时被禁用，不需要处理分和秒
*   "12:30:40-14:45:50" 开始时间和结束时间中间有完整的一小时，那么这整个小时被禁用，不需要处理分和秒

完整的小时处理完成后就该分钟了，以 `"09:45:00-10:30:00"` 为例：

*   开始时间`09:45:00` ，那么在 9 点这个时段，`45-59` 分钟是需要禁用的
*   结束时间`10:30:00` ，在 10 点这个时段，`0-30` 分钟是需要禁用的

接下来是秒，以`"12:30:40-14:45:50"` 为例：

*   开始时间`12:30:40`，在 12:30 这个分钟内，`40-59` 秒是需要禁用的
*   结束时间`14:45:50`，在 12:45 这个分钟内，`0-50` 秒是需要禁用的

如果开始时间和结束时间相同，比如`12:30:40-12:30:40`，那么在 12:30 这个分钟内，`40` 秒是需要禁用的

整体的逻辑分析出来了，可以确定的是字典表是一个平铺结构，不需要嵌套，key 的规则如下：

*   需要禁用的秒集合对应的 key 为 `${h}:${m}`
*   需要禁用的分集合对应的 key 为 `${h}`
*   需要禁用的时集合对应的 key 是非动态的，直接定义为 `HH`

所以我们得到的结果应这是这样的：

```ts
// 需要禁用的时间段
const disabledRangeTimes = [
  "08:00:00-09:00:00",
  "09:45:00-10:30:00",
  "12:30:40-14:45:50",
];

// 经过转换后的结构
const disabledTimeMap = {
  HH: [8, 13],
  "9": [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
  "10": [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29,
  ],
  "12": [
    31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
    50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
  ],
  "14": [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44,
  ],
  "9:0": [0],
  "10:30": [0],
  "12:30": [
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
    59,
  ],
  "14:45": [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  ],
};
¸
```

实际代入一下：

*   假设用户选择的小时为 12，分钟为30，那么拼接 key 为 `12:30` ，在字典表中取值得到结果`[40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]`
*   假设用户选择的小时为 9，那么 key 为 `9` ，在字典表中取值得到结果 `[46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]`
*   假设用户选择的小时为 9，分钟为 0，那么 key 为 `9:0` ,在字典表中取值得到结果 `[0]`

这样就可以完全满足以上需求了，并且还有诸多好处：

1.  所有的禁用时间不需要在每次用户点击选中后重新计算，在用户点击之前我们就已经知道哪些是需要禁用的了，大幅度降低代码的重复运算
2.  方便管理和调试，我们可以不依赖时间选择组件，直接查看字典表中的禁用时间是否正确
3.  可以用于校验，如果这个时间不是用户选择的，而是通过其他组件控制传入的，那么我们可以根据这个字典表来校验传入的时间是否合法（非禁用时间）

## 最终实现方案

### 校验传入时间的合法性
```ts
const isDisabledTime = (t: string) => {
  const [h, m, s] = parseTime(t);
  return (
    disabledTimeMap?.["HH"]?.includes(h) ||
    disabledTimeMap?.[h]?.includes(m) ||
    disabledTimeMap?.[`${h}:${m}`]?.includes(s)
  );
};

const isTimeDisabled = isDisabledTime("12:30:00");

```

### 完整代码
在实际的实现方案中，我对传入的时间格式做了更多兼容，支持传入 `"HH:MM:SS-HH:MM:SS" | "HH:MM-HH:MM" | "HH-HH"` 多种格式

可以通过正则对格式进行校验，gpt 给我生成的正则：`/^(?:(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d-(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d|(?:[01]\d|2[0-3])-(?:[01]\d|2[0-3])|(?:[01]\d|2[0-3]):[0-5]\d-(?:[01]\d|2[0-3]):[0-5]\d)$/`

传入禁用时间段参考：

```ts
const disabledRangeTimes = [
  "08:00:00-09:00:00",
  "09:45:00-10:30:00",
  "12:30:40-14:45:50",
  "15:10-15:30",
  "16-18",
];

```

完整代码如下：

> 代码注释由 [Aide](https://marketplace.visualstudio.com/items?itemName=nicepkg.aide-pro) 插件一键生成

```ts
const disabledRangeTimes = [
  "08:00:00-09:00:00",
  "09:45:00-10:30:00",
  "12:30:40-14:45:50",
  "15:10-15:30",
  "16-18",
];


// 导出一个名为 parseTime 的函数，参数是一个时间字符串，格式为 "HH:MM:SS"
export function parseTime(time: string) {
  // 将时间字符串按冒号分隔，并将分隔后的每个部分转换为数字
  const parts = time.split(":").map(Number);
  // 确保 parts 数组中至少包含小时（h）、分钟（m）和秒（s），不足的部分填充 0
  while (parts.length < 3) parts.push(0);
  return parts; // 返回一个包含小时、分钟和秒的数组
}

// 添加分钟范围到结果对象中
function addMinutesRange(
  result: Record<string, any>, // 结果对象
  h: string, // 小时部分的字符串
  startMinute: number, // 开始的分钟数
  endMinute: number, // 结束的分钟数
) {
  if (!startMinute && endMinute == 59) return; // 如果范围为整个小时，则不处理
  for (let minute = startMinute; minute <= endMinute; minute++) {
    if (!result[h]) { // 如果结果对象中还没有该小时的数据，初始化为一个空数组
      result[h] = [];
    }
    result[h].push(minute); // 将分钟数添加到结果对象中对应的小时数组中
  }
}

// 一个将时间字符串转换为数组的函数
const beforeTransFunc = (timeString: string | string[], isSingle?: boolean) => {
  let timeArray: string[] = [];
  try {
    // 如果时间字符串是一个数组，直接赋值给 timeArray，否则尝试将其解析为 JSON 数组
    timeArray = Array.isArray(timeString)
      ? timeString
      : JSON.parse(timeString as string);
  } catch (error) {
    // 如果解析失败，将时间字符串按逗号分隔
    timeArray = (timeString as string).split(",");
  }
  if (isSingle) {
    // 如果 isSingle 为 true，将每个时间段改为 "start-end" 形式
    timeArray = timeArray.map((item) => `${item}-${item}`);
  }
  return timeArray; // 返回处理后的时间数组
};

// 导出一个名为 convertTimeRanges 的函数，用于转换时间范围字符串
export function convertTimeRanges(
  timeString: string | string[],
  isSingle?: boolean,
) {
  if (!timeString) return undefined; // 如果时间字符串为空，返回 undefined

  // 先将字符串按逗号拆分为数组
  const timeArray: string[] = beforeTransFunc(timeString, isSingle);
  console.log("时间选择 convertTimeRanges", timeArray);

  // 定义一个结果对象，初始化时包含一个 "HH" 属性，其值为空数组
  const result: Record<string, number[]> = {
    HH: [],
  };

  // 遍历时间数组的每一个时间范围
  timeArray.forEach((range) => {
    // 将时间范围按 "-" 拆分为起始时间和结束时间
    const [start, end] = range.split("-");
    // 分别解析起始时间和结束时间，得到小时、分钟和秒
    const [sh, sm, ss] = parseTime(start);
    const [eh, em, es] = parseTime(end);

    if (sh === eh) { // 如果起始小时和结束小时相同
      if (sm === em) {
        // 如果起始分钟和结束分钟相同，处理秒
        addMinutesRange(result, `${sh}:${sm}`, ss, es);
      } else {
        // 如果起始分钟和结束分钟不同，处理分钟和秒
        addMinutesRange(result, `${sh}:${sm}`, ss, 59);
        addMinutesRange(result, `${eh}:${em}`, 0, es);
        if (em - sm > 1) {
          // 如果分钟范围跨越多个完整的分钟
          for (let m = sm + 1; m < em; m++) {
            !result[sh] && (result[sh] = []);
            result[sh].push(m);
          }
        }
      }
    } else {
      const endWith59 = em == 59 && es == 59; // 结束时间为某小时的整点 59:59
      const endWith0 = !em && !es; // 结束时间为某小时的 00:00
      const startWith0 = !sm && !ss; // 起始时间为某小时的 00:00

      // 处理整小时的情况
      if (eh - sh > 1) {
        for (let h = sh + 1; h < eh; h++) {
          result["HH"]?.push(h);
        }
      }

      if (endWith59) result["HH"].push(eh); // 如果结束时间是整点 59 分，将结束小时加入结果
      if (startWith0) result["HH"].push(sh); // 如果起始时间是整点 00 分，将起始小时加入结果

      // 处理 HH:00:00
      // endWith0 && (result[`${eh}:0`] = [0]);

      // 处理起始时间的分钟
      addMinutesRange(result, `${sh}:${sm}`, ss, 59);
      // 处理结束时间的分钟
      addMinutesRange(result, `${eh}:${em}`, 0, es);

      // 处理中间的分钟
      if (em > 0 && em < 59) {
        for (let m = 0; m < em; m++) {
          !result[eh] && (result[eh] = []);
          result[eh].push(m);
        }
      }

      if (sm > 0 && sm < 59) {
        // 如果当前小时在"HH"中，说明已经处理过，是重合的部分
        if (result["HH"].includes(sh)) return;
        for (let m = sm + 1; m < 60; m++) {
          !result[sh] && (result[sh] = []);
          result[sh].push(m);
        }
      }
    }
  });

  return result; // 返回最终的结果对象
}

console.log(convertTimeRanges(disabledRangeTimes));
```

在组件中使用

```tsx
const disabledTimeMapMemo =useMemo(()=> convertTimeRanges([
  "08:00:00-09:00:00",
  "09:45:00-10:30:00",
  "12:30:40-14:45:50",
  "15:10-15:30",
  "16-18",
]));

// 当传入时间为指定时间时，第二参数 true，会自动转换为时间段格式
// const disabledTimeMapMemo =useMemo(()=> convertTimeRanges(["08:00:00", "10:20:00", "12:30:50"],true));

const disabledTime = useCallback(
  (d) => {
    return {
      disabledHours: () => disabledTimeMapMemo?.["HH"] || [],
      disabledMinutes: (h: number) => disabledTimeMapMemo?.[h] || [],
      disabledSeconds: (h: number, m: number) =>
        disabledTimeMapMemo?.[`${h}:${m}`] || [],
    };
  },
  [disabledTimeMapMemo]
);

const App = ()=>{
   return (<TimePicker disabledTime={disabledTime}} />)
}
```

Done!
