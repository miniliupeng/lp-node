# C03 nextTick、微任务、async 函数

示例：

- [`C/01-event-loop-cjs.cjs`](../../../examples/node-tutorial/C/01-event-loop-cjs.cjs)
- [`C/02-event-loop-mjs.mjs`](../../../examples/node-tutorial/C/02-event-loop-mjs.mjs)
- [`C/04-async-order.cjs`](../../../examples/node-tutorial/C/04-async-order.cjs)

## 已经在微任务里时

如果当前这段 JavaScript 本身就是微任务（Promise 回调，或 ESM 模块求值），新登记的微任务会在离开这次检查点之前跑完。这期间登记的 nextTick 要等微任务队列先空下来。

CJS 示例在一个 Promise 回调里登记 `queueMicrotask`、另一个 `then` 和 `nextTick`，断言：

```text
microtask → promise → nextTick
```

ESM 入口文件的求值就在微任务检查点中。同一段顶层代码如果按 CJS 的登记方式写，顺序变成：

```text
mt1 → p1 → mt2 → nt1 → nt-from-mt → nt2 → mt-from-nt
```

`C/02-event-loop-mjs.mjs` 断言的就是这一串。和 CJS 文件的差别来自入口上下文，不是 `queueMicrotask` 的定义变了。

面试时先说明白入口是 CJS 还是 ESM，再报顺序。只背“nextTick 永远在 Promise 前面”会在 ESM 入口和 Promise 回调里说错。

## async 函数怎么排

`C/04-async-order.cjs` 在 CJS 里做了这些事：

```text
调用 async 函数，函数同步执行到 await null 之前
登记 Promise.then
登记 nextTick
登记 queueMicrotask
```

断言：

```text
async-start → nextTick → after-await → promise → microtask
```

`await null` 会把函数的后半段排成微任务。在 CJS 顶层，nextTick 先于这些微任务。微任务之间按登记顺序：先是 `await` 的继续，然后是更早登记的 `then`，再然后是 `queueMicrotask`。

同一个文件还断言了“在 Promise 里再登记”的顺序是微任务先于 nextTick。两段断言放在同一个 `setTimeout` 里，避免两个测试互相抢队列。

## await 链

在 CJS 顶层，下面的逻辑（本环境单独跑过，顺序用来理解，不单独占一个文件）：

```text
同步打印
async 函数同步部分
nextTick
第一个 await 之后的继续
更早登记的 queueMicrotask
第二个 await 之后的继续
```

每个 `await` 至少让出一次微任务。`await 1` 和 `await Promise.resolve(1)` 都会把继续排进微任务队列。不要用“多写一个 await 就多睡一帧事件循环”来估算时间，微任务清空之后才会回到阶段。

## 使用上的建议

- 需要在当前操作之后、微任务之前插入工作：这是 `nextTick` 的位置，只在你明确要插队时使用。递归 `nextTick` 会让 I/O 阶段饿死，因为每一轮都会把队列再填满。
- 普通的“稍后继续”用 Promise。
- 不要用 `setTimeout(fn, 0)` 表示“马上”。它至少要等定时器阶段，延迟还被钳制成 1ms，而且和 `setImmediate` 的顺序在主模块里不稳定。

## 自测

1. 为什么同一个片段在 `.cjs` 和 `.mjs` 入口顺序不同？ESM 入口的求值跑在微任务检查点里。
2. `await` 之后的代码排进哪条队列？微任务队列。
3. 递归 `nextTick` 有什么风险？I/O 回调迟迟轮不到。
