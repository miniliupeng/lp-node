# 大厂高频面试题精讲 (02-sse-ai-streaming)

---

### Q1: SSE（Server-Sent Events）与 WebSocket 的本质区别是什么？为什么在 AI 大模型打字机流式响应中，各大厂商（OpenAI、Anthropic、DeepSeek）普遍选择 SSE 而非 WebSocket？

#### 🎯 面试官考点
- 协议轻量化权衡、单向流 vs 全双工成本对比与企业级网络架构兼容性。

#### 💡 满分回答模板
| 维度 | SSE (Server-Sent Events) | WebSocket |
| :--- | :--- | :--- |
| **通信方向** | **单向**（仅服务端向客户端流式推送） | **全双工**（双向实时互发数据） |
| **底层协议** | 纯粹标准的 **HTTP/1.1 或 HTTP/2** | 独立的 **ws:// 协议**（需经历 101 协议切换握手） |
| **代理与网关** | **天然兼容**（Nginx、CDN、API 网关原生支持） | 较差（需要特意配置长连接 Upgrade 转发，很多企业防火墙默认阻断） |
| **自动重连机制**| **浏览器原生自带**（底层自动重连并带上次 ID） | 必须前端手动手写心跳探针与重连逻辑 |
| **认证与状态** | 原生支持 HTTP Cookie、自定义 Header、HTTP 状态码 | 握手后脱离 HTTP，状态码与 Header 机制无法直接复用 |

- **为什么 AI 场景首选 SSE**：
  - **单向性高度匹配**：用户向大模型发送提问只需 1 次普通的 HTTP POST，随后大模型需要持续单向吐字数十秒。这个单向特征与 SSE 完美契合，根本不需要维持双向全双工开销；
  - **开销极低**：纯文本流传输，无需在服务端维持沉重的 WebSocket 握手状态机。

---

### Q2: SSE 的标准消息帧格式包含哪些字段？末尾的双换行符 `\n\n` 在协议层起到了什么决定性作用？

#### 🎯 面试官考点
- W3C 标准 EventSource 文本流分帧规范与消息定界解析原理。

#### 💡 满分回答模板
1. **标准规范 4 大字段（纯文本 utf-8）**：
   - **`data: <content>`**：真正的数据载荷（Payload）。如果数据有多行，可以写多个连续的 `data:` 行，客户端接收时会自动用换行符拼接。
   - **`event: <custom_event>`**：自定义事件名称。如果不写，默认触发客户端的 `onmessage`；如果写了（如 `event: error`），前端可以通过 `addEventListener("error", ...)` 分类监听。
   - **`id: <msg_id>`**：事件唯一编号。客户端会默默记住该 ID，一旦网络临时中断重连，浏览器会自动在请求头中携带 `Last-Event-ID: <msg_id>`，供服务端进行消息增量补发。
   - **`retry: <milliseconds>`**：告诉客户端若断开连接，等待多少毫秒后再发起自动重连。
2. **双换行符 `\n\n` 的决定性作用**：
   - 与我们前面讲的“TCP 粘包与消息定界”直接挂钩！
   - 单换行 `\n` 只代表一条字段的结束；
   - **双换行 `\n\n`（一个空行）代表“当前这一条完整事件帧（Event Frame）结束，可以分发给前端业务了”**。客户端解析器只有读到 `\n\n` 时，才会触发一次事件回调，彻底解决了基于 HTTP 流式传输的数据分包定界问题。

---

### Q3: 在大模型长文本流式输出过程中，如果用户点击了界面的“停止生成”按钮，后端应该如何第一时间感知并中断底层推理？

#### 🎯 面试官考点
- 客户端中断检测（AbortController）、后端网络 Socket 监听与算力成本控制。

#### 💡 满分回答模板
1. **前端动作**：
   - 前端发起 fetch 请求时传入 `signal: abortController.signal`。当用户点击“停止生成”时，执行 `abortController.abort()`，浏览器底层会立即主动向服务端发送 TCP RST / FIN 包强行切断 HTTP 连接。
2. **后端网络感知与联动取消**：
   - 在 Node.js 原生 HTTP 服务中，监听请求流的关闭事件：
     ```typescript
     const abortController = new AbortController();

     // 监听客户端连接物理断开
     req.on("close", () => {
       // 立即触发向大模型 SDK 的中止信号
       abortController.abort();
     });

     // 将取消信号透传给 OpenAI / 内部 LLM SDK
     const stream = await openai.chat.completions.create({
       model: "gpt-4",
       messages: [...],
       stream: true,
     }, { signal: abortController.signal });
     ```
3. **企业级价值**：
   - 如果不监听客户端关闭，即使网页已经关掉，Node.js 依然会在后台傻傻地把剩下的上千个 Token 继续让大模型生成完并不断调用 `res.write()`，导致宝贵的 GPU 显存和昂贵的 Token 费用被毫无意义地消耗殆尽！
