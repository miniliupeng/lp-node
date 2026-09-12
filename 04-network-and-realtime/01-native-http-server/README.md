# 01-native-http-server: 零外部依赖原生 HTTP 服务与基础路由封装

几乎所有 Node.js Web 框架（Express, Koa, Fastify）底层都直接或间接基于 Node.js 内置的 `node:http` 模块。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`node:http.createServer((req, res) => ...)`**：
  - `req`（`http.IncomingMessage`）：本质是一个**可读流（Readable Stream）**，客户端上传的 HTTP Body 是以数据块（Chunk）形式分批到达的。
  - `res`（`http.ServerResponse`）：本质是一个**可写流（Writable Stream）**，必须调用 `res.end()` 明确通知客户端“响应已完整发送，请关闭当前传输”。

### 2. 为什么需要搞透它？
- **告别黑盒盲区**：理解很多框架中 `express.json()` 中间件的实质只是对 `req` 可读流进行 `for await (const chunk of req)` 的字节累加与 `JSON.parse`。
- **排查网络连接悬挂 (Hanging)**：如果代码中有分支漏写了 `res.end()`，客户端浏览器或上游网关就会一直转圈圈，直到达到网关超时时间（如 60s）返回 504 Gateway Timeout。

### 3. 日常工作中怎么用？
- 在云原生探针、轻量 Healthcheck 探针或编写极简零依赖微服务时直接使用。

---

## 🔬 核心代码切片

```typescript
import { createServer } from "node:http";

const server = createServer(async (req, res) => {
  // 流式累加读取 Body
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString();

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ received: body }));
});
```

---

## 🖥️ 控制台预期输出快照

```text
=== 零外部依赖原生 HTTP 服务实战 ===
1. 原生 HTTP 服务器就绪，监听临时端口: 127.0.0.1:xxxxx
2. 自动化发起端对端网络请求测试:
   ✔ GET /api/health -> 状态码 200, 响应: {"status":"UP"}
   ✔ POST /api/echo (流式读取 Body) -> 状态码 200, 响应: {"echo":"Hello Native Node"}
   ✔ GET /404 -> 状态码 404, 路由兜底拦截正常
3. 测试完成，原生服务实例已安全关闭释放端口
====================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 04-network-and-realtime/01-native-http-server/main.ts
```
