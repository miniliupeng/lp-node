# C04 定时器与 I/O 谁先

对应示例：[`C/03-io-order.mjs`](../../../examples/node-tutorial/C/03-io-order.mjs)、[`B/08-timers.mjs`](../../../examples/node-tutorial/B/08-timers.mjs)

## 主模块里的竞赛

事件循环开始时，poll 阶段如果没有 I/O 要做，会看有没有 `setImmediate`。有的话，进入 check 阶段执行它。`setTimeout(fn, 0)` 实际上至少等 1ms。这 1ms 如果已经过去，timers 阶段会在下一轮先执行超时回调。

因此主模块里两者的顺序不稳定。本机连续 20 次：18 次 immediate 在前，2 次 timeout 在前。`B/08-timers.mjs` 只断言两者都出现。

## I/O 回调里是稳定的

在 `readFile` 的回调里登记 nextTick、微任务、`setImmediate`、`setTimeout(0)`。示例断言：

```text
nextTick → microtask → immediate → timeout
```

原因：回调属于 poll 阶段。回调一结束就处理 nextTick 和微任务，然后循环走到 check 阶段执行 `setImmediate`。这次的 `setTimeout(0)` 最早在下一轮的 timers 阶段。poll 回调里登记的 `setImmediate` 会在同一次循环的 check 阶段跑到，所以它稳定地排在这个 `setTimeout` 前面。

## poll 什么时候阻塞

没有到期的定时器、没有 `setImmediate`、也没有待处理的 I/O 回调时，poll 可以阻塞，直到有新的 I/O 或最近的定时器到期。进程看起来“闲着”，其实是停在 poll，而不是死循环。

有一个未 `unref` 的定时器或一个在听的服务器，进程就不会退出。这和“JavaScript 已经执行完了”不矛盾。

## MessagePort 的位置

[`C/16-message-channel.cjs`](../../../examples/node-tutorial/C/16-message-channel.cjs) 在 CJS 里断言：

```text
nextTick → microtask → message → immediate
```

`port.postMessage` 不会同步调用对方的监听器。在这次实测里，`message` 晚于 nextTick 和微任务，早于 `setImmediate`。把它当成“异步投递的事件”来讲。不要把它说成微任务，也不要背成官方六个阶段里的一个新阶段名；阶段表里没有单独的 message 阶段。

## 自测

1. 在 `fs.readFile` 回调里，`setImmediate` 和 `setTimeout(0)` 谁先？`setImmediate`。
2. 在主模块顶层呢？两种顺序都可能出现。
3. `postMessage` 是同步的吗？不是。监听器稍后才跑。
