# 大厂高频面试题精讲 (01-native-http-server)

---

### Q1: 在 Node.js 原生 HTTP 模块中，`req`（`IncomingMessage`）和 `res`（`ServerResponse`）的底层本质是什么？为什么获取请求 Body 必须通过监听流？

#### 🎯 面试官考点
- HTTP 协议在操作系统套接字层面的流式解包与网络分包机制。

#### 💡 满分回答模板
1. **底层本质**：
   - **`req` 是一个继承自 `stream.Readable` 的可读流**：客户端发送的 HTTP 报文主体（Body）是拆分成一个个 TCP 数据包通过网络传输的。Node.js 不可能在请求一到达就假设已经收齐了全部数据，因此以可读流的方式暴露出 `data` 事件供开发者按需累加。
   - **`res` 是一个继承自 `stream.Writable` 的可写流**：向客户端写回状态行、响应头和响应体时，数据通过 Socket 管道分批推向下游。
2. **为什么必须监听流**：
   - 保证**极低的内存开销**：如果用户上传一个 2GB 的大视频，Node.js 不需要先在内存中把 2GB 全存下来再交给 Controller，而是可以直接 `req.pipe(fs.createWriteStream('upload.mp4'))`，以仅占用几十 KB 的恒定内存完成海量数据转存。

---

### Q2: 什么是 HTTP 的 `Keep-Alive`？在 Node.js 中是如何管理的？如何防止客户端恶意空连接占满句柄？

#### 🎯 面试官考点
- TCP 三次握手复用与服务端超时防御策略（Slowloris 慢速拒绝服务攻击防护）。

#### 💡 满分回答模板
1. **Keep-Alive 核心价值**：
   - 在 HTTP/1.1 中默认开启。允许客户端和服务器在完成一次请求响应后，**不关闭底层的 TCP 连接通道**，后续该客户端的多次请求可以直接复用同一个已建立的 TCP 链接，省去昂贵的三次握手与 TLS 密钥协商耗时。
2. **防范空连接占满句柄（Slowloris 攻击）**：
   - 如果恶意客户端建立了 TCP 连接但迟迟不发数据，或者以极慢的速度（每 10 秒发 1 个字节）发送，服务器的并发 Socket 句柄会被快速耗尽。
   - **Node.js 的防御参数**：
     - `server.keepAliveTimeout`（默认 5 秒）：在发送完响应后，等待客户端发送下一个请求的空闲超时时间；
     - `server.requestTimeout`（默认 5 分钟 / Node 18+ 推荐调低）：从接收到请求头开始，整个请求必须在规定时间内完成接收，否则直接断开连接；
     - `server.headersTimeout`（默认 60 秒）：解析 HTTP 请求头的最长允许耗时。

---

### Q3: 如果在代码中执行了多次 `res.end()`，或者在 `res.end()` 之后又调用了 `res.setHeader()`，会发生什么？为什么？

#### 🎯 面试官考点
- HTTP 报文状态机与 `ERR_HTTP_HEADERS_SENT` 经典线上报错定位。

#### 💡 满分回答模板
1. **经典报错：`ERR_HTTP_HEADERS_SENT`**：
   - 报错信息通常为：`Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`。
2. **底层原因剖析**：
   - 根据 HTTP 协议规范，数据在网络上是按序发送的：**第一行是状态行（HTTP/1.1 200 OK） -> 接着是响应头（Headers） -> 空行 -> 最后是响应体（Body）**。
   - 当第一次调用 `res.writeHead()` 或 `res.write()` / `res.end()` 时，响应头已经被序列化并作为首个 TCP 数据包**物理发送到了网络线路上**。
   - 如果后续代码又尝试 `res.setHeader('X-Custom', 'val')`，或者在异步回调中二次调用 `res.json()`，Node.js 已经不可能穿越时空把已经飞到客户端电脑上的响应头追回并修改了！因此只能抛出 `ERR_HTTP_HEADERS_SENT` 异常。
3. **防御规范**：
   - 在所有的响应调用前加上 `return`，例如：`return res.end(...)`，确保提前退出控制流，防止代码继续往下走导致二次响应。
