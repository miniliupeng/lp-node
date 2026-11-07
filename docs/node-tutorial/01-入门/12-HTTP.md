# 第一个 HTTP 服务

示例：`examples/A/12-http.mjs`

`http.createServer((req, res) => {})` 在每个请求到来时调用。`req` 是可读流，`res` 是可写流。这一章只处理不读正文的 GET。

示例：`GET /health` 返回 200 和 `{ ok: true }`，其他路径返回 404 和 `not found`。脚本自己 `fetch` 再关掉服务器。

`listen(0, '127.0.0.1')` 让系统分配空闲端口，并且只接受本机回环。实际端口从 `server.address()` 读取。对外服务才绑定 `0.0.0.0`。教程示例不这样做。

`writeHead` 之后必须 `end`。忘记 `end`，客户端会一直等到超时。`Content-Type` 要和正文一致。JSON 用 `application/json; charset=utf-8`。

Node 22 的全局 `fetch` 由 undici 提供。HTTP 500 不会让 Promise 拒绝，要看 `response.ok`。响应体要用 `text()`、`json()` 或 `arrayBuffer()` 读掉。

`server.close()` 停止接受新连接，等已有连接结束后调用回调。示例放在 `finally` 里。进程级退出见[优雅退出](../04-工程与系统设计/10-优雅退出.md)。


## 是什么

`http.createServer` 在每个请求到来时给你一个可读的 `req` 和一个可写的 `res`。这一章不读正文。`GET /health` 回 200 和 `{ ok: true }`，其他路径回 404。

## 请求和响应要配对

`writeHead` 之后必须 `end`。忘记 `end`，客户端一直等到自己的超时。`Content-Type` 要和正文一致。JSON 用 `application/json; charset=utf-8`。状态码表达结果：找不到是 404，不是 200 加一段 `{ ok: false }`。

`listen(0, '127.0.0.1')` 让系统分配端口，并且只接受本机回环。实际端口从 `server.address()` 读。教程示例不绑定 `0.0.0.0`。

Node 22 的全局 `fetch` 由 undici 提供。HTTP 500 不会让 Promise 拒绝，要看 `response.ok`。响应体要用 `text()`、`json()` 或 `arrayBuffer()` 读掉，否则连接可能留在池里。

`server.close()` 停止接受新连接，已有连接结束后调用回调。示例放在 `finally` 里。进程级退出见[优雅退出](../04-工程与系统设计/10-优雅退出.md)。

## 本章问答

### 1. fetch 遇到 404 会抛错吗？

**考点：** 传输失败和 HTTP 状态是两回事。

**回答：** 不会。连不上、DNS 失败、中止才会拒绝。4xx/5xx 仍然 resolve。先看 `response.ok` 或 `status`，再读正文。只写 `try/catch` 会把 500 当成成功。

### 2. 为什么示例监听 127.0.0.1 和端口 0？

**考点：** 绑定地址和测试隔离。

**回答：** `127.0.0.1` 不对外网开放。端口 0 向系统要一个空闲端口，避免和已经占用的 3000 冲突。断言里用 `server.address().port` 拼 URL，不把端口写死。

### 3. 不调用 res.end 会怎样？

**考点：** 响应是可写流。

**回答：** 头可能已经发出，正文没结束，客户端收不到完整响应。`end` 表示没有更多数据。有正文时先 `write` 再 `end`，或直接 `end(body)`。

## 事故复盘

处理函数写了 JSON 却忘了 `res.end()`。客户端一直转到自己的超时，服务端连接数上涨。有正文就 `end(body)`，没有正文也要 `end()`。

`fetch` 的 `catch` 被当成「下游失败」。下游返回 500 时 Promise 是成功的，`catch` 不跑，调用方把失败当成功写进缓存。先看 `response.ok`。

示例若写成 `listen(3000)`，本机已有进程时直接 `EADDRINUSE`，测试不可重复。`listen(0, '127.0.0.1')` 要一个空闲端口，并且不对外。
