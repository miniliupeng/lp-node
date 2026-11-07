# B07 用 fetch 调用别的服务

对应示例：[`examples/node-tutorial/B/07-fetch-retry.mjs`](../../../examples/node-tutorial/B/07-fetch-retry.mjs)

## 全局 fetch

Node 22 自带 `fetch`。响应上要读正文：`text()`、`json()` 或 `arrayBuffer()`。即使用不到正文，失败重试前也要把它读掉，示例在非 2xx 时 `await response.arrayBuffer()`，让连接可以被回收。

`response.ok` 表示状态码在 200 到 299。`fetch` 只在网络失败、URL 不合法或被中止时拒绝。HTTP 500 仍然是成功的 Promise，要自己看状态码。

## 哪些失败值得重试

示例起一个本机服务：第一次返回 500，第二次返回 200。客户端最多请求 2 次，断言最终正文是 `ready`，并且服务端计数为 2。

这个循环用来演示控制流。生产策略要收紧：

- 只重试你确认没有副作用的请求，或带幂等键的请求。`POST /payments` 无条件重试可能扣两次款。
- 对 500、502、503、504 和网络错误可以重试。对 400、401、404 重试不会变好。
- 限制次数，并加上退避和抖动，避免所有客户端在同一秒重试。手写退避见 [`E/03-retry.mjs`](../../../examples/node-tutorial/E/03-retry.mjs)。
- 传入 `AbortSignal`，总耗时有上限。

## 超时

`fetch(url, { signal: AbortSignal.timeout(1000) })` 在这个版本的 API 里可用。超时后 Promise 拒绝，`name` 为 `AbortError`。教程的文件读取和定时器示例已经断言了 `AbortError`。给每一次出站请求一个超时，不要让调用方无限等。

## 不要跟随用户提供的地址

服务端 `fetch(用户传入的 url)` 是服务端请求伪造的入口。先按 B04 做协议和主机允许列表。也不要默认跟随重定向到内网地址。

## 自测

1. HTTP 500 会让 `fetch` 的 Promise 拒绝吗？不会。看 `response.ok` 或 `status`。
2. 为什么重试前要读掉正文？释放套接字。
3. 为什么 POST 不能无条件重试？请求可能已经在服务端生效。
