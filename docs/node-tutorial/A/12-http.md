# A12 第一个 HTTP 服务

对应示例：[`examples/node-tutorial/A/12-http.mjs`](../../../examples/node-tutorial/A/12-http.mjs)

## 服务器是一个函数

`http.createServer((req, res) => { ... })` 在每个请求到来时调用。`req` 是可读流，`res` 是可写流。这一章先处理不读请求体的 GET。

示例只做两件事：

- `GET /health` 返回 200 和 JSON `{ ok: true }`
- 其他 URL 返回 404 和纯文本 `not found`

```bash
node examples/node-tutorial/A/12-http.mjs
```

脚本自己用 `fetch` 打到自己，然后关掉服务器。你不需要另开终端。

## 绑定地址

`server.listen(0, '127.0.0.1')`：端口 `0` 表示由操作系统分配空闲端口，只接受本机回环上的连接。示例从 `server.address()` 读出实际端口。`address()` 有时会是字符串（管道）或 `null`，示例在那种情况下抛错，因为我们要的是 TCP 端口。

对外服务才绑定 `0.0.0.0` 或 `::`。教程示例不这样做。

## 响应要写完

`res.writeHead(status, headers)` 再 `res.end(body)`。忘记 `end` 时，客户端会一直等到超时。`end` 可以带上最后一块数据。

`Content-Type` 要和正文一致。JSON 用 `application/json; charset=utf-8`。示例用 `JSON.stringify` 生成正文，客户端用 `response.json()` 解析。

状态码表达结果：200 成功，404 没有这个路径。更完整的用法在 [D04](../D/04-api.md)。

## 用全局 fetch 当客户端

Node 22 的全局 `fetch` 由 undici 提供（本构建是 6.29.1）。它返回 Promise，响应体要读掉（`text()`、`json()`、`arrayBuffer()`），否则连接可能一直占着。

示例先请求 `/health`，再请求 `/missing`，分别断言状态码和正文。

## 关掉服务器

`server.close(callback)` 停止接受新连接，等已有连接结束后调用回调。示例在 `finally` 里关闭，避免断言失败后端口仍被占用。进程级的优雅退出见 [D10](../D/10-shutdown.md)。

## 自测

1. 端口写 0 是什么意思？让操作系统选一个空闲端口。
2. 为什么要设置 `Content-Type`？客户端和中间层靠它决定怎么解析正文。
3. `req` 和 `res` 是什么？分别是可读流和可写流。
