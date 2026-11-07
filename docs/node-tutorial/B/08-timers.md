# B08 定时器

对应示例：[`examples/node-tutorial/B/08-timers.mjs`](../../../examples/node-tutorial/B/08-timers.mjs)

## 三个注册点

- `setTimeout(fn, delay)`：至少等待 `delay` 毫秒之后，在定时器阶段执行
- `setInterval(fn, delay)`：重复的超时
- `setImmediate(fn)`：在检查阶段执行

延迟是下限，不是精确闹钟。主线程如果正忙着算，回调会更晚。

Node 的定时器文档规定：`delay` 小于 1，或大于 `2147483647`，会被改成 1。因此 `setTimeout(fn, 0)` 不是“零延迟”。在 22.23.4 上观察内部字段 `_idleTimeout` 得到 1。那个字段不是稳定 API，业务代码不要读它。

## 和 setImmediate 的顺序

在主模块里，`setTimeout(fn, 0)` 和 `setImmediate(fn)` 的先后不稳定。事件循环启动时，1ms 的定时器可能还没到期，于是先进入检查阶段跑 `setImmediate`；机器忙一点时，定时器可能已经到期，于是先跑超时。本机 20 次抽样里两种顺序都出现过。

示例只断言两件事最终都发生了，不断言谁先谁后。I/O 回调内部的顺序是稳定的，见 [C04](../C/04-timers-io.md)。

## unref

`setTimeout` 默认保持进程不退出。`timer.unref()` 表示“只剩这个定时器时可以退出”。示例登记一个 60 秒的定时器然后 `unref`。如果删掉 `unref`，`run-all.mjs` 会在 15 秒后杀掉它并判失败。

服务器里的心跳定时器常常 `unref`，避免它单独把进程留住。

## 可中止的等待

`node:timers/promises` 的 `setTimeout` 返回 Promise，并接受 `signal`。示例用 `AbortController` 中止一个 60 秒的等待，断言拒绝对象的 `name` 是 `AbortError`。

优先用这个，而不是自己包一层再忘记 `clearTimeout`。

## 自测

1. `setTimeout(fn, 0)` 会在当前栈结束时立刻跑吗？不会。它最早也要等定时器阶段，并且延迟被钳制成至少 1ms。
2. 为什么主模块里不能依赖它和 `setImmediate` 的顺序？两种顺序都会发生。
3. `unref` 做什么？允许进程在只剩该定时器时退出。
