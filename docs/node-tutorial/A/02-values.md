# A02 值、类型、相等

对应示例：[`examples/node-tutorial/A/02-values.mjs`](../../../examples/node-tutorial/A/02-values.mjs)

Node 执行的就是 JavaScript。这一章只保留后面每章都要用到的值模型。

## 两类值

原始值：`undefined`、`null`、布尔、数字、大整数 `bigint`、字符串、符号 `symbol`。

对象：普通对象、数组、函数、日期、`Map`、`Set`、缓冲区视图等。函数是可以调用的对象。

`typeof null` 的结果是历史遗留的 `"object"`。判断空值用 `value === null`。示例把这一点断言下来。

## 数字

JavaScript 的普通数字是 IEEE-754 双精度。整数在 `Number.MIN_SAFE_INTEGER` 与 `Number.MAX_SAFE_INTEGER`（含两端，约 ±9e15）之间才能精确表示。数据库自增主键、雪花 ID 如果超过这个范围，用 `bigint` 或字符串，不要用普通数字来回转。

`Number('nope')` 得到 `NaN`。`NaN` 与自己做 `===` 比较，结果是 `false`。`Object.is(NaN, NaN)` 是 `true`。示例用函数包住 `===`，避免源码里写成字面量自比较；语义就是严格相等。

`+0` 与 `-0` 用 `===` 比较为 `true`，`Object.is` 为 `false`。`1 / -0` 是 `-Infinity`。示例用 `Number('-0')` 构造负零，因为源码里的 `-0` 经过部分格式化工具后会变成 `0`，负号会丢。

## 引用

```javascript
const shared = { n: 1 };
const alias = shared;
alias.n = 2;
```

`alias` 和 `shared` 是同一个对象。把对象传进函数时，函数收到的是引用，函数里改字段，调用方看得到。

原始值赋值会复制值本身。`let a = 1; let b = a; b = 2` 之后 `a` 仍是 1。

## 拷贝

浅拷贝只复制第一层：对象展开 `{ ...obj }`、`Object.assign`、数组的 `slice()`。嵌套对象仍然共享。

`structuredClone` 做结构化克隆：普通对象、数组、`Date`、`Map`、`Set`、`ArrayBuffer` 等可以复制。示例断言日期在克隆后仍然是同一时刻。

它不克隆函数，也不保留类的原型方法。示例里的 `Box` 实例克隆之后变成普通对象 `{ n: 3 }`，`double` 方法消失。循环引用可以被结构化克隆处理；`JSON.stringify` 遇到循环会抛 `TypeError`，那是 [A04](./04-collections-json.md) 的事。

## 字符串

JavaScript 字符串是 UTF-16 码元序列。`length` 统计的是码元，不是“用户看到的字符”，也不是 UTF-8 字节。带色调的 emoji 可能占两个码元。和 `Buffer` 的字节长度对比放在 [B01](../B/01-buffer.md)。示例里的 `héllo` 在 Buffer 那一章是 5 个码元、6 个 UTF-8 字节。

## 自测

1. 为什么不能用 `===` 判断 `NaN`？因为严格相等规定 `NaN` 不等于 `NaN`。用 `Number.isNaN` 或 `Object.is`。
2. `structuredClone` 之后为什么不能再调用原来的方法？克隆结果的原型是 `Object.prototype`，方法没有被复制。
3. 两个变量指向同一对象时，改其中一个的字段会发生什么？另一个变量看到同一份字段。
