# HTTP 路由与正文

示例：`examples/B/06-http-router.mjs`

示例服务只做三件事：

- `GET /health` → 200，`{ ok: true }`
- `POST /echo` → 读正文，最多 32 字节，原样返回
- 其他 → 404

读正文时累加 `chunk.length`。超过上限就 `req.pause()`，回 413，并设置 `Connection: close`。不要在写出响应之前 `req.destroy()`。先销毁会让客户端的 `fetch` 得到 `UND_ERR_SOCKET`，看不到 413。

`JSON.parse` 包在 `try/catch` 里。坏 JSON 回 400，不把堆栈写进响应。

`req.url` 含查询字符串。路由前先 `new URL(req.url, 'http://127.0.0.1')` 取 `pathname`。

只监听 `127.0.0.1`。端口用 `listen(0)`。

HTTP 头可以伪造 `X-Forwarded-For`。只有你信任的那一层反向代理写的值才能拿来当客户端地址。


## 是什么

示例服务只做三件事：`GET /health` 回 200，`POST /echo` 最多读 32 字节并原样返回，其他路径回 404。超过上限回 413，并带 `Connection: close`。

## 413 的顺序

累加 `chunk.length`，不要只信 `Content-Length`。分块传输可以不带这个头。超限后 `req.pause()`，写完 413 再结束。在写出响应之前 `req.destroy()`，客户端的 `fetch` 得到 `UND_ERR_SOCKET`，看不到 413。

坏 JSON 回 400。堆栈不进响应。路由比较 `pathname`。

`X-Forwarded-For` 可以由客户端随便写。只有你自己的反向代理追加的那一跳才能当客户端地址。代理之前的值都不可信。

## 本章问答

### 1. 为什么不能先 destroy 再写 413？

**考点：** 响应还没写出去，套接字已经没了。

**回答：** 对端看到的是连接重置，不是 HTTP 状态码。先暂停读取，把 413 写完，用 `Connection: close` 表示这条连接不要复用。

### 2. 只检查 Content-Length 够不够？

**考点：** 分块和实际字节。

**回答：** 不够。可以不声明长度，或者声明一个很小的长度再继续发。按收到的 `chunk.length` 累加，超过上限就停。

### 3. 路径匹配为什么不用 includes？

**考点：** 前缀误伤。

**回答：** `'/health-check'.includes('/health')` 为真。用 `pathname === '/health'`，或事先登记的路由表。查询字符串在 `req.url` 里，比较前先剥掉。

## 事故复盘

正文超过 32 字节时先 `req.destroy()`。客户端 `fetch` 得到套接字错误，监控把它记成 500，看不到 413。先 `pause`，写完 413，带 `Connection: close`。

只看 `Content-Length`。分块请求不带这个头，仍能把内存打满。按 `chunk.length` 累加。

把 `X-Forwarded-For` 的第一个值当客户端 IP 做限流。调用方把自己的地址写在最前面，限流被绕过。只信任自己的代理追加的那一跳。
