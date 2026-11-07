# A13 断言与调试

对应示例：[`examples/node-tutorial/A/13-assert.mjs`](../../../examples/node-tutorial/A/13-assert.mjs)、测试文件 [`B/11-sample.test.mjs`](../../../examples/node-tutorial/B/11-sample.test.mjs)

## 用断言代替肉眼看日志

`node:assert/strict` 在条件不成立时抛 `AssertionError`，进程以非 0 结束。教程的每个示例都这样结束：要么打印 `PASS`，要么抛错。

```javascript
import assert from 'node:assert/strict';

assert.equal(1, 1);
assert.deepEqual({ a: 1, b: [2] }, { a: 1, b: [2] });
assert.notEqual({ a: 1 }, { a: 1 });
assert.throws(() => {
  throw new Error('bad');
}, /bad/);
```

`equal` 使用 `Object.is` 做比较，所以它能区分 `NaN` 与 `NaN` 的“相同”，也能区分 `+0` 与 `-0`。这和 `===` 不同。

`deepEqual` 比较对象的结构。`notEqual` 比较引用，两个分别写成的 `{ a: 1 }` 不是同一个对象。

`assert.throws(fn, /bad/)` 要求函数同步抛出，且错误信息匹配正则。异步失败用 `await assert.rejects(promise, ...)`。

严格入口 `node:assert/strict` 和宽松入口的差别在于深度比较是否把 `1` 和 `'1'` 当成相等。教程统一用 strict，避免宽松比较把类型错误放过去。

## 读栈

断言失败时，终端里的堆栈第一行通常就是 `assert.equal` 那一行，下面跟着你的文件。从你的文件那一帧读起，而不是从 `node:internal` 读起。

在 `catch` 里记录错误时，把整个 `error` 交给日志库，或者至少打印 `error.stack`。只打印 `error.message` 会丢掉位置。

## 调试器

```bash
node --inspect-brk examples/node-tutorial/A/12-http.mjs
```

`--inspect-brk` 在第一行暂停，等待检查器。Chrome 打开 `chrome://inspect`，或用编辑器的 Node 调试器连上默认端口 9229。这是本机调试。不要在生产进程上对公网开放检查器端口。

`console.log` 适合确认一个值。它会打乱对象的阅读，也会在生产日志里泄露令牌。确认完就删掉，或改成带级别的日志，见 [D03](../D/03-logging.md)。

## 测试运行器

`node:test` 在 Node 22 是正式能力。示例：

```bash
node --test examples/node-tutorial/B/11-sample.test.mjs
```

`test('name', fn)` 登记用例，`mock.fn` 记录调用次数和参数。`mock.timers` 在 22.23.4 上仍会打印实验警告，教程正文的例子不用它，防抖示例改用注入的假定时器。

覆盖率开关是 `--experimental-test-coverage`，名字里带 experimental，开启前先看你要测的版本。

## 自测

1. `assert.equal` 和 `===` 有什么差别？`assert.equal` 走 `Object.is`。
2. 两个内容相同的对象，`assert.equal` 会怎样？失败。结构比较用 `deepEqual`。
3. 怎样在启动时暂停等待调试器？`node --inspect-brk 文件`。
