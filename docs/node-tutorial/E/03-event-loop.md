# E03 异步与事件循环

这是最容易把口诀背错的一组。答案与这些文件一致：

- [`C/01-event-loop-cjs.cjs`](../../../examples/node-tutorial/C/01-event-loop-cjs.cjs)
- [`C/02-event-loop-mjs.mjs`](../../../examples/node-tutorial/C/02-event-loop-mjs.mjs)
- [`C/03-io-order.mjs`](../../../examples/node-tutorial/C/03-io-order.mjs)
- [`C/04-async-order.cjs`](../../../examples/node-tutorial/C/04-async-order.cjs)
- [`C/16-message-channel.cjs`](../../../examples/node-tutorial/C/16-message-channel.cjs)

### Q1. 说出事件循环的阶段。

- 难度：中级
- 考察点：libuv 阶段，而不是“一个宏任务队列”
- 参考答案：timers（`setTimeout` / `setInterval`）→ pending callbacks → idle/prepare（内部）→ poll（I/O）→ check（`setImmediate`）→ close callbacks。poll 在没有 I/O、没有到期定时器、也没有 `setImmediate` 时可以阻塞。
- 易错点：把 `process.nextTick` 说成六个阶段之一，或把它叫成微任务。
- 追问：阶段之间才会清空 nextTick 吗？不是。当前 JavaScript 操作结束就会处理 nextTick 队列和微任务队列，同一个阶段里的下一个回调之前也会处理。

### Q2. CJS 顶层里 nextTick 和 Promise 谁先？

- 难度：中级
- 考察点：两条队列的先后
- 参考答案：当前操作不是微任务时，先排空 nextTick（包括排空过程中新加的 nextTick），再排空微任务。微任务里新加的 nextTick 在这轮微任务之后。CJS 示例的顺序是：

```text
nt1 → nt2 → mt1 → p1 → mt-from-nt → mt2 → nt-from-mt
```

- 易错点：背成“Promise 永远在 nextTick 后面”，见下一题。
- 追问：`queueMicrotask` 和 `Promise.then` 是同一条队列吗？是，按登记顺序。

### Q3. 为什么 ESM 入口的顺序相反？

- 难度：高级
- 考察点：模块求值所在的检查点
- 参考答案：ESM 入口的求值发生在微任务检查点里。已经在微任务中时，新登记的微任务先跑完，nextTick 等这次微任务队列空了再跑。同一段登记在 `.mjs` 入口得到：

```text
mt1 → p1 → mt2 → nt1 → nt-from-mt → nt2 → mt-from-nt
```

在 Promise 回调里登记，同样是微任务先于 nextTick：`microtask → promise → nextTick`。`C/04-async-order.cjs` 断言了这一段。

- 易错点：说 Node 22 改了 nextTick 的定义。变的是入口代码自己坐在哪一个检查点里。
- 追问：面试题只给片段、不给扩展名时怎么答？先问这是 CJS 顶层、ESM 入口，还是已经在 Promise / I/O 回调里。

### Q4. `await` 之后的代码排到哪里？

- 难度：中级
- 考察点：async 脱糖后的队列
- 参考答案：`await` 把函数后半段排成微任务。CJS 顶层调用 async 函数，同步部分先跑，然后 nextTick，然后 `await` 的继续，然后更早登记的 Promise 和 `queueMicrotask`。示例顺序：

```text
async-start → nextTick → after-await → promise → microtask
```

每个 `await` 至少让出一次微任务。这不是“睡到下一个事件循环阶段”。

- 易错点：说 `await` 等价于 `setTimeout(fn, 0)`。
- 追问：`await 1` 也会让出吗？会。非 Promise 的值会被包成已完成的 Promise，继续仍是微任务。

### Q5. `setTimeout(fn, 0)` 和 `setImmediate` 谁先？

- 难度：中级
- 考察点：稳定与不稳定的边界
- 参考答案：主模块里不稳定。定时器延迟小于 1 会被改成 1，循环开始时这 1ms 可能还没到，于是 check 阶段的 `setImmediate` 先跑；也可能定时器已经到期，timeout 先跑。本机 20 次里 18 次 immediate 在前，2 次 timeout 在前。I/O 回调里稳定：nextTick → 微任务 → `setImmediate` → `setTimeout`，因为回调在 poll，接着是 check，timeout 要等下一轮 timers。
- 易错点：背“谁先谁后”而不说上下文。
- 追问：`_idleTimeout` 能不能当 API？不能。它只是 22.23.4 上观察到的内部字段，用来印证延迟被钳成 1。

### Q6. `MessagePort.postMessage` 是微任务吗？

- 难度：高级
- 考察点：不要把所有异步都叫微任务
- 参考答案：不是同步，也不是微任务。CJS 实测顺序是 `nextTick → microtask → message → immediate`。监听器在稍后的事件里执行。官方阶段表里没有单独的 message 阶段，回答时说“异步投递，位于微任务之后、这次的 setImmediate 之前”，并注明这是 22.23.4 的实测。
- 易错点：把它等同于 `queueMicrotask`。
- 追问：Worker 的 `postMessage` 会复制什么？结构化克隆。`SharedArrayBuffer` 共享，转移列表里的 `ArrayBuffer` 移交所有权。

### Q7. 未处理的 Promise 拒绝会怎样？

- 难度：中级
- 考察点：Node 15 之后的默认值
- 参考答案：22.23.4 上进程以非 0 退出，stderr 有错误。注册 `unhandledRejection` 监听器之后，这次默认退出不再发生。空监听器会把故障藏起来。应当记录日志并让进程退出，由外部拉起。`uncaughtException` 同理，进程状态被视为未定义。
- 易错点：说“现在只是警告，进程继续跑”。那是更老的默认行为。
- 追问：`all` 和 `allSettled` 怎么选？缺一不可用 `all`。需要每项结果用 `allSettled`。

### Q8. 递归 `process.nextTick` 有什么问题？

- 难度：高级
- 考察点：饥饿
- 参考答案：nextTick 队列在回到 poll 之前会被排空。回调里如果总是再登记 nextTick，I/O 回调得不到执行。普通延后用 Promise。只有确实需要插在微任务之前才用 nextTick。
- 易错点：用 nextTick 写重试循环。
- 追问：`setImmediate` 递归呢？每轮 check 跑一次，之后循环还能去 poll 和 timers，不会像递归 nextTick 那样饿死 I/O。

### Q9. `await` 期间别的请求能跑吗？

- 难度：初级
- 考察点：主线程让出
- 参考答案：能。`await` 让出调用栈，事件循环可以执行其他已就绪的回调。占住主线程的是同步循环、`readFileSync`、同步加密。同一进程里的其他 JavaScript 要等这段同步代码结束。
- 易错点：说 Node 用多线程并发执行各个请求的 JavaScript。
- 追问：那线程池在做什么？做 fs、`dns.lookup`、慢哈希等阻塞工作，不执行你的 JavaScript。

### Q10. 怎样取消一次异步操作？

- 难度：中级
- 考察点：`AbortSignal`
- 参考答案：把 `AbortSignal` 传给支持它的 API。已中止的信号传给 `readFile`，错误码是 `ABORT_ERR`。`timers/promises` 的超时被中止时，`name` 是 `AbortError`。`AbortSignal.timeout` 和 `AbortSignal.any` 在本版本是函数。中止不会自动回滚已经提交的数据库事务。
- 易错点：`clearTimeout` 能取消已经发出的 HTTP 请求。不能。请求要靠信号告诉 `fetch` 或套接字。
- 追问：客户端断开后服务器还在算，怎么停？在 `req` 的 `close` 上 `abort()`，并把信号传给下游。
