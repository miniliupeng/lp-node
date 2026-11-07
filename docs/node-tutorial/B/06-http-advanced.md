# B06 HTTP 进阶：路由、JSON、体积

对应示例：[`examples/node-tutorial/B/06-http-router.mjs`](../../../examples/node-tutorial/B/06-http-router.mjs)

## 一个最小路由表

示例用 `Map`，键是 `` `${method} ${url}` ``：

- `GET /health` → `{ ok: true }`
- `POST /echo` → 解析 JSON，原样放进 `{ echo: ... }`
- 其他键 → 404，正文 `{ error: 'not found' }`

这只适合没有路径参数的演示。有 `/users/:id` 这类模式时，把匹配从 `Map.get` 换成一段明确的解析，并单独取出参数。22.23.4 没有全局 `URLPattern`。

查询字符串不算路径的一部分。需要查询时用 `new URL(req.url, 'http://127.0.0.1')`，因为 `req.url` 通常是路径加查询，不含协议和主机。

## 读请求体

`req` 是流。示例按块累计，超过 32 字节就拒绝，状态码 413，并 `pause()` 停止继续堆积。响应写上 `connection: close`。

测试用 64 个 `x` 打到 `/echo`，断言状态码 413。正常的 `{"name":"ada"}` 低于上限，返回 `{ echo: { name: 'ada' } }`。

上限要按路由分别设定。上传接口和登录接口不该共用一个很大的全局限制，否则登录接口会接受巨大正文，解析 JSON 时占用内存。

收到的字节用 `JSON.parse` 之前要确认 `Content-Type` 是你期望的。示例为了短，没有强制头；生产路由应该拒绝非 `application/json` 的正文。

`JSON.parse` 抛错时，示例把状态码当成 400，正文 `{ error: message }`。不要把 Node 的堆栈放进这个 JSON。

## 背压与响应

`res.end(string)` 对小 JSON 足够。大文件用 `pipeline` 把文件流接到 `res`，这样才有背压。不要先把大文件 `readFile` 成一个字符串再 `end`。

## 自测

1. 为什么必须消费 `req`？不读正文，客户端和代理可能一直等待，连接不会回到空闲池。
2. 413 在保护什么？保护进程不被巨大的请求体撑满内存。
3. `req.url` 为什么不能直接交给 `new URL` 当唯一参数？它常常是相对路径，缺少基址。
