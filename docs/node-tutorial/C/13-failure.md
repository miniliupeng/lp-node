# C13 失败与取消

对应示例：[`examples/node-tutorial/C/13-cancel-and-rejection.mjs`](../../../examples/node-tutorial/C/13-cancel-and-rejection.mjs)

## 未处理的拒绝

子进程执行 `Promise.reject(new Error('boom'))` 且没有接收者时，22.23.4 以非 0 退出，stderr 含 `boom`。这是 Node 15 之后的默认行为：未处理拒绝会使进程失败，而不是只打一行警告。

同一段代码如果先执行 `process.on('unhandledRejection', () => {})`，示例断言子进程退出码为 0。监听器存在时，默认的“因此退出”不再发生。

监听器的职责是记录日志并决定退出，不是把函数体留空。空监听器会把失败藏起来，进程继续带着未知状态服务请求。推荐的生产策略：记录错误和请求号，然后让进程退出，由进程管理器或编排器拉起新的。在监听器里继续接请求，等于假设堆和原生句柄都还完好。

`uncaughtException` 同理。同步抛出的异常若无人捕获，会走到这里。用了这个事件之后，官方说明认为进程处于未定义状态，应当退出。

## AbortSignal

示例把已经 `abort()` 的信号传给 `readFile`，错误码是 `ABORT_ERR`。定时器那一章用同一个名字 `AbortError` 中止 `timers/promises`。

在 HTTP 处理函数里，客户端断开时中止下游：数据库查询、文件读取、出站 `fetch` 都传入 `req` 关联的信号（需要你从 `close` 事件构造 `AbortController`，因为 `IncomingMessage` 本身不总是带一个已接好的信号）。工作会停在下一处检查信号的 API 上。已经写进数据库的那一步不会自动回滚，事务仍要你自己结束。

`AbortSignal.timeout(ms)` 和 `AbortSignal.any([...])` 在 22.23.4 上是函数。`timeout` 到点就中止。`any` 在任一输入中止时中止。示例为了把错误码写死，使用的是手动 `AbortController`。

## 自测

1. Node 22 对未处理拒绝的默认动作是什么？进程以非 0 退出。
2. 为什么不建议在 `uncaughtException` 里继续服务？进程状态未定义。
3. 中止信号会自动回滚数据库吗？不会。
