# A03 函数、闭包、this

对应示例：[`examples/node-tutorial/A/03-functions.mjs`](../../../examples/node-tutorial/A/03-functions.mjs)

## 闭包

函数记住定义时所在的绑定。`makeCounter` 里的 `n` 在函数返回后仍然活着，因为返回的函数还引用它。三次调用得到 1、2、3。两次调用 `makeCounter()` 会得到两份互不影响的 `n`。

闭包是状态的一种合法存放处。无界地捕获大对象，会让这些对象无法被回收。内存一章会回到这件事。

## this

ESM 文件是严格模式。示例里的对象方法 `method` 通过 `box.method()` 调用时，`this` 是 `box`。方法内部的箭头函数没有自己的 `this`，它使用外层方法的 `this`，所以能读到 `box.n`。

把方法拆下来：

```javascript
const detached = box.method;
detached();
```

此时调用方没有把接收者设成 `box`，严格模式下 `this` 是 `undefined`，读取 `this.n` 抛出 `TypeError`。示例断言了这个异常。

修复方式：

- 调用时写 `box.method()`
- 或 `const bound = box.method.bind(box)`
- 或把函数写成箭头函数并放在确实有外层 `this` 的地方

不要用 `self = this` 这种旧写法。箭头函数已经表达“沿用外层 this”。

## 参数默认值、解构、空值

`function add(left, right = 1)` 只在实参是 `undefined` 时使用默认值。传入 `null` 或 `0` 不会触发默认值。

对象解构 `const { name, ...rest } = user` 取出 `name`，其余可枚举自有属性进 `rest`。这是浅拷贝。

可选链 `user?.profile?.title` 在中间是 `null` 或 `undefined` 时短路为 `undefined`，不抛异常。

`??` 只在左侧是 `null` 或 `undefined` 时取右侧。`0 ?? 1` 的结果是 `0`。需要保留 0、空字符串这些合法值时用 `??`，不要用 `||`。

## 自测

1. 箭头函数的 `this` 在什么时候确定？在定义箭头函数时，沿用外层的 `this`，调用箭头函数的方式不会重新绑定。
2. 默认参数什么时候生效？实参为 `undefined` 时。
3. `||` 和 `??` 对 `0` 的差别？`0 || 'x'` 是 `'x'`，`0 ?? 'x'` 是 `0`。
