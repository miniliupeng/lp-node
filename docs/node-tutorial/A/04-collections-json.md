# A04 集合与 JSON

对应示例：[`examples/node-tutorial/A/04-json.mjs`](../../../examples/node-tutorial/A/04-json.mjs)。迭代器助手的可运行片段在 [`C/07-pipeline.mjs`](../../../examples/node-tutorial/C/07-pipeline.mjs)。

## 数组

用数组保存有顺序的列表。判断是否为数组用 `Array.isArray`，因为 `typeof []` 是 `"object"`。

ES2023 起有不修改原数组的方法：`toSorted`、`toReversed`、`toSpliced`、`with`。22.23.4 上这些函数存在。`sort()` 默认把元素转成字符串再比较，数字排序要传比较函数 `(a, b) => a - b`。

`map` / `filter` / `reduce` 返回新数组或折叠值，不改原数组。`splice` 会改原数组。

## Map、Set、分组

`Map` 的键可以是任意值，查找不把键转成字符串。`Object` 的键总会变成字符串或 symbol。需要“以对象为键”时用 `Map`。

`Set` 按 `SameValueZero` 比较：`NaN` 只出现一次，`+0` 与 `-0` 视为同一个。22.23.4 有 `intersection`、`isSubsetOf` 等方法。

`Object.groupBy(items, fn)` 按键分组，返回普通对象。`Map.groupBy` 返回 `Map`。示例 `C/07-pipeline.mjs` 断言了 `kind === 'a'` 的分组长度为 2。

迭代器助手可以在中间不建临时数组：

```javascript
[1, 2, 3, 4].values().filter((n) => n % 2 === 0).take(1).toArray();
```

结果是 `[2]`。大数据管道上这能少分配数组；对几个元素的列表，直接用数组方法更清楚。

## JSON 实际会做什么

`JSON.stringify`：

- 对象里值为 `undefined` 的字段会被丢掉。示例：`{ a: undefined, b: 1 }` 变成 `'{"b":1}'`。
- 数组里的 `undefined` 变成 `null`。示例：`[1, undefined, 3]` 变成 `[1,null,3]`。
- `Date` 变成 ISO 字符串，`JSON.parse` 不会变回 `Date`。
- `bigint` 直接抛 `TypeError`。
- 函数、`symbol` 在对象里会被丢掉；在数组里变成 `null`。
- 循环引用抛 `TypeError`。

`JSON.parse` 只接受 JSON 文本，不接受尾逗号、单引号、注释。

## `__proto__` 与原型

`JSON.parse('{"__proto__":{"admin":true}}')` 在 22.23.4 上得到一个**自己的**属性，名字是字符串 `"__proto__"`。`parsed.admin` 是 `undefined`，对象的原型仍是 `Object.prototype`。示例断言了这一点。

原型污染出在“递归合并对象”的库：它们见到键 `__proto__` 或 `constructor` 时去改了原型。防御是合并时只复制普通自有属性，忽略这些键，或者使用没有原型的对象 `Object.create(null)` 存放外部字典。

## 自测

1. 为什么 HTTP 接口不要用 JSON 传 `bigint` 主键？`JSON.stringify` 会抛错。可以传十进制字符串。
2. 数组里的 `undefined` 和对象字段里的 `undefined` 经 JSON 后有何不同？数组位置变成 `null`，对象字段消失。
3. `JSON.parse` 会不会把 `__proto__` 设成原型？在本版本不会，它成为普通自有属性。
