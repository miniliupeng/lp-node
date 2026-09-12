# 02-sse-ai-streaming: Server-Sent Events (SSE) 大模型流式输出与取消控制

在 ChatGPT、Claude 以及各大 AI 问答产品中，“**打字机式流式输出**”已经成为行业标准体验。实现这一特效的底层支柱不是笨重的 WebSocket，而是轻巧优雅的 **Server-Sent Events (SSE)**。

---

## 💡 核心原理三段式

### 1. 是什么？
- **Server-Sent Events (SSE)**：基于标准 HTTP 协议的**服务端单向流式推送**规范。
- **核心报文头**：
  - `Content-Type: text/event-stream`
  - `Cache-Control: no-cache`
  - `Connection: keep-alive`
- **协议帧格式**：以纯文本传输，每个事件以双换行 `\n\n` 结尾：
  ```text
  event: message
  data: {"token": "你好"}

  ```

### 2. 为什么 AI 场景首选 SSE 而非 WebSocket？
- **单向性天然契合**：AI 对话是“用户提问 1 次，模型源源不断单向吐字 30 秒”。完全不需要 WebSocket 双向全双工开销。
- **协议兼容性好**：SSE 是纯粹的标准 HTTP/1.1 或 HTTP/2 请求，能够完美穿越所有公司防火墙、网关、代理服务器（Nginx），且天然支持 HTTP 的 Cookie 认证和状态码。
- **前端原生支持**：浏览器自带原生的 `EventSource` 接口，断线后浏览器底层会自动尝试重连并发送 `Last-Event-ID`。

### 3. 日常工作中怎么用？
- 监听客户端连接断开事件（`req.on("close")`），当用户点击“停止生成”或关闭网页时，立即中止底层调用，**防止昂贵的大模型 GPU 算力白白浪费**。

---

## 🔬 核心代码切片

```typescript
res.writeHead(200, {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
});

// 逐个 Token 推送
for (const token of tokens) {
  res.write(`data: ${JSON.stringify({ token })}\n\n`);
  await sleep(50);
}
res.write("data: [DONE]\n\n");
res.end();
```

---

## 🖥️ 控制台预期输出快照

```text
=== SSE 大模型流式输出与取消控制实战 ===
1. 原生 SSE 服务启动，监听端点: http://127.0.0.1:xxxxx/v1/chat/stream
2. 模拟客户端发起流式请求，逐 Token 接收打字机输出:
   ✔ 收到 Token: "你"
   ✔ 收到 Token: "好"
   ✔ 收到 Token: "！"
   ✔ 收到 Token: "我是"
   ✔ 收到 Token: " AI"
   ✔ 收到 Token: " 助手"
   ✔ 收到结束标志: "[DONE]"
3. 模拟客户端发起 AbortController 主动取消:
   ✔ 服务端监听到客户端断开 (req.on('close'))，立即停止后续算力消耗
========================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 08-ai-primitives-and-capstone/02-sse-ai-streaming/main.ts
```
