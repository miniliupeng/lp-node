# 集合与 JSON

示例：`examples/A/04-json.mjs`，分组见 `examples/C/07-pipeline.mjs`。

数组用 `Array.isArray` 判断。`sort()` 默认按字符串比较，数字要传 `(a, b) => a - b`。`toSorted`、`toReversed`、`toSpliced`、`with` 不修改原数组，22.23.4 上都在。

`Map` 的键可以是对象。普通对象的键会变成字符串或 symbol。`Set` 按 SameValueZero 去重：`NaN` 只留一个。`Object.groupBy` 返回普通对象，`Map.groupBy` 返回 `Map`。

迭代器助手可以少建中间数组：

```javascript
[1, 2, 3, 4].values().filter((n) => n % 2 === 0).take(1).toArray();
```

结果是 `[2]`。

`JSON.stringify` 会丢掉对象里值为 `undefined` 的字段，把数组里的 `undefined` 变成 `null`。`Date` 变成 ISO 字符串，`parse` 不会变回日期。`bigint` 抛 `TypeError`。循环引用抛 `TypeError`。

`JSON.parse('{"__proto__":{"admin":true}}')` 在 22.23.4 上得到一个名叫 `"__proto__"` 的自有属性。`admin` 仍是 `undefined`，原型仍是 `Object.prototype`。原型污染出在递归合并：代码看到这个键就去改了 `Object.prototype`。合并外部对象时跳过 `__proto__`、`prototype`、`constructor`，或用 `Object.create(null)` 当字典。


## 是什么

数组、普通对象、`Map`、`Set` 是四套不同的容器。JSON 是一种文本格式，不是 JavaScript 对象图。`JSON.parse` / `JSON.stringify` 只覆盖 JSON 能表达的子集。

## 为什么容器选错会变成安全问题

普通对象的键会变成字符串。用户传入的 `"__proto__"` 作为键写进普通对象，再被递归合并，会改到 `Object.prototype`。22.23.4 的 `JSON.parse` 不会做这件事：它得到一个名叫 `"__proto__"` 的自有属性，`admin` 仍是 `undefined`。污染发生在你自己的合并函数。

## 容器怎么选

| 需求 | 用 |
| --- | --- |
| 有序列表 | 数组。判断用 `Array.isArray`，因为 `typeof [] === 'object'` |
| 字符串键的字典，且键来自代码 | 普通对象 |
| 键可能是对象，或键来自外部 | `Map`，或 `Object.create(null)` |
| 去重 | `Set`。`NaN` 在 `Set` 里只保留一个 |
| 分组 | `Object.groupBy` 得到普通对象，`Map.groupBy` 得到 `Map` |

`sort()` 默认把元素变成字符串再比 UTF-16 码元。`"10" < "2"` 为真，因为首字符 `'1' < '2'`，所以 `[10, 2].sort()` 得到 `[10, 2]`，不是按数值。数字排序必须传 `(a, b) => a - b`。`toSorted`、`toReversed`、`toSpliced`、`with` 不改原数组。

迭代器助手可以少建中间数组：`[1,2,3,4].values().filter((n) => n % 2 === 0).take(1).toArray()` 得到 `[2]`。

## JSON 丢了什么

`JSON.stringify` 丢掉对象里值为 `undefined` 的字段、函数、symbol 键。数组里的 `undefined` 变成 `null`。`Date` 变成 ISO 字符串，`parse` 不会变回 `Date`。`bigint` 抛 `TypeError`。循环引用抛 `TypeError`。键的顺序在现代实现里对字符串键是插入序，但不要依赖这一点做签名，签名前应自己规定字段顺序。

## 本章问答

### 1. `JSON.parse` 会不会造成原型污染？

**考点：** 分清解析和合并。

**回答：** 在 22.23.4 上，`JSON.parse('{"__proto__":{"admin":true}}')` 的原型仍是 `Object.prototype`，`parsed.admin` 是 `undefined`。危险的是递归 `Object.assign` 或自己写的深合并看见这个键就去改原型。合并时跳过 `__proto__`、`prototype`、`constructor`，或用 `null` 原型对象当字典。

**易错：** 背「只要 parse 了 JSON 就会污染原型」。那是旧的、错误的合并写法，不是 `JSON.parse` 本身。

### 2. 为什么 `[10, 2].sort()` 的结果不符合数字大小？

**考点：** 默认比较器是字符串。

**回答：** 不传比较函数时，元素先变成字符串再按码元比较。`"10"` 比 `"2"` 小，因为第一个字符 `'1' < '2'`。数字必须写 `(a, b) => a - b`。不想改原数组就用 `toSorted`。

### 3. `Map` 和对象字典差在哪？

**考点：** 键的类型和原型。

**回答：** 对象的键只能是字符串或 symbol，而且对象带原型。`Map` 的键按 SameValueZero 比较，可以是对象。外部输入当键时，用 `Map` 或 `Object.create(null)`，避免碰上原型上的 `toString`。

## 事故复盘

合并配置的函数看见键 `"__proto__"` 就 `Object.assign` 到目标的原型上。`JSON.parse` 本身在 22.23.4 是安全的，合并函数不安全。修法是跳过 `__proto__`、`prototype`、`constructor`，或者把字典建成 `Object.create(null)`。

`sort()` 没传比较函数，版本号列表变成字符串序，`10` 排在 `2` 前面，灰度发布先打到错误的批次。数字排序写 `(a, b) => a - b`。不想改原数组就用 `toSorted`。

`JSON.stringify` 丢掉了值为 `undefined` 的字段，下游把「没这个字段」和「字段是 null」当成同一种缺省，把价格写成 0。需要保留缺省语义时不要用 JSON 表达 `undefined`。

### 再答一题

**题目：** 为什么签名前不能依赖 stringify 的键顺序？

**回答：** 键顺序是实现细节。两边对象的插入顺序不同，字符串就不同，签名对不上。签名前按约定的字段顺序自己拼，或使用规范的序列化。`bigint`、函数、循环引用都会让 `stringify` 抛错或丢字段，这些都不能进签名输入而不自知。
