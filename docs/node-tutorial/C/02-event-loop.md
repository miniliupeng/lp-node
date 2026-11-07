# C02 事件循环的阶段

对应顺序断言：

- CJS：[`C/01-event-loop-cjs.cjs`](../../../examples/node-tutorial/C/01-event-loop-cjs.cjs)
- ESM 入口：[`C/02-event-loop-mjs.mjs`](../../../examples/node-tutorial/C/02-event-loop-mjs.mjs)
- I/O 回调内部：[`C/03-io-order.mjs`](../../../examples/node-tutorial/C/03-io-order.mjs)

## 阶段

libuv 的事件循环按这个顺序重复：

1. **timers**：到期的 `setTimeout`、`setInterval`
2. **pending callbacks**：上一轮推迟的部分系统回调（例如某些 TCP 错误）
3. **idle, prepare**：只给 libuv 内部用
4. **poll**：取出新的 I/O 事件并执行 I/O 回调。队列空时，如果没有到期定时器，也没有 `setImmediate`，这里可以阻塞着等 I/O
5. **check**：`setImmediate`
6. **close callbacks**：例如套接字的 `close` 事件

“宏任务”这个词来自浏览器。Node 文档按阶段和回调描述。面试里可以说：定时器、I/O、`setImmediate`、close 回调跑在这些阶段上。

## 两条不在阶段里的队列

`process.nextTick(cb)` 把 `cb` 放进 nextTick 队列。Node 文档说明它不属于事件循环的某个阶段：当前这段 JavaScript 操作结束后，先把这个队列排空。

Promise 回调、`queueMicrotask`、`async` 函数在 `await` 之后的继续，进入 V8 的微任务队列。

在**不是微任务**的上下文里（CJS 主模块、I/O 回调、定时器回调），当前操作结束后的顺序是：

1. 排空 nextTick 队列。排空过程中新加的 nextTick 仍在这一轮排完。
2. 再排空微任务队列。
3. 微任务里如果又登记了 nextTick，那些 nextTick 在这轮微任务结束之后再排空。

CJS 示例断言的顺序是：

```text
nt1 → nt2 → mt1 → p1 → mt-from-nt → mt2 → nt-from-mt
```

读法：

- 同步代码先登记了 `nt1`，以及微任务 `mt1` 和 `p1`
- 先跑 nextTick：`nt1` 又登记了 `nt2` 和一个微任务 `mt-from-nt`，接着跑 `nt2`
- 再跑当时的微任务：`mt1`、`p1`、`mt-from-nt`。`mt1` 里又登记了 `mt2`，所以 `mt2` 排在后面
- `mt1` 里登记的 nextTick `nt-from-mt` 要等这轮微任务结束

ESM 入口的顺序不同，因为模块求值本身发生在微任务检查点里。见下一章，不要把 CJS 的顺序背成“所有文件都这样”。

## 每个回调之后都会看这些队列

不是“一个阶段结束才处理一次”。一个 I/O 回调跑完，就会处理它登记的 nextTick 和微任务，然后才轮到同一阶段里的下一个回调，或下一个阶段。

I/O 示例在 `readFile` 的回调里登记四件事，断言：

```text
nextTick → microtask → immediate → timeout
```

`setImmediate` 在 check 阶段，这次的 `setTimeout(0)` 要等下一轮的 timers，所以 immediate 在前。这个顺序在 I/O 回调里是稳定的。

## 自测

1. `nextTick` 属于六个阶段中的哪一个？它不属于其中任何一个阶段。
2. CJS 主模块里，先登记的 nextTick 和先登记的 Promise，谁先执行？nextTick。
3. I/O 回调里 `setImmediate` 和 `setTimeout(0)` 谁先？`setImmediate`。
