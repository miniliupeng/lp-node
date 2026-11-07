# C08 异步上下文

对应示例：[`examples/node-tutorial/C/08-als.mjs`](../../../examples/node-tutorial/C/08-als.mjs)、日志示例 [`D/07-logger-als.mjs`](../../../examples/node-tutorial/D/07-logger-als.mjs)

## 请求号要跟着 await 走

服务器同时处理很多请求。如果把“当前请求号”放在模块级变量里，请求 A 在 `await` 之后可能读到请求 B 刚写进去的值。

`AsyncLocalStorage` 按异步资源传递一份存储。`store.run(value, fn)` 在 `fn` 以及它 `await` 到的继续里都能 `getStore()`。示例同时跑：

- 存储 `{ id: 'a' }`，等待 15ms
- 存储 `{ id: 'b' }`，等待 1ms

返回值仍是 `['a', 'b']`。外面的 `getStore()` 是 `undefined`，因为不在任何 `run` 里。

日志示例用同一机制把 `requestId` 放进 JSON。两个重叠的 `run` 不会把 `req-a` 和 `req-b` 写串。

## 边界

存储跟着 Node 的异步钩子走。`await`、Promise、定时器、以及多数 Node 回调会保持上下文。

这些情况会断：

- 你自己用原生插件或某些跨线程投递，没有把上下文带上
- 在 `run` 之外登记、后来才执行的回调
- Worker 是另一个 isolate，存储不会自动过去。要传的话放进 `workerData` 或消息里

`async_hooks` 能看到更底层的异步资源创建和销毁。它的开销比 `AsyncLocalStorage` 更大。业务代码用 `AsyncLocalStorage` 就够了，不要为了传一个请求号去启用全部钩子。

## 在 HTTP 服务器上

在请求回调的最外层 `storage.run({ requestId }, () => handle(req, res))`。请求号用 `crypto.randomUUID()`。日志、数据库封装都从 `getStore()` 读取，函数签名就不用每层都加一个参数。

这不代替显式参数。跨进程、跨队列时，把请求号写进消息体或头里，在下一进程重新 `run`。

## 自测

1. 为什么模块级 `currentRequestId` 会串？`await` 期间另一个请求会改同一个变量。
2. `run` 外面 `getStore()` 得到什么？`undefined`。
3. Worker 里能直接读到主线程的存储吗？不能。
