# 大厂高频面试题精讲 (04-web-streams-interop)

---

### Q1: Node.js 历史悠久的原生流（Classic Streams）与现代 WHATWG Web Streams 标准有何本质区别？

#### 🎯 面试官考点
- API 规范设计哲学、事件驱动 vs Promise/异步迭代器演进。

#### 💡 满分回答模板
| 维度 | Node.js 原生流 (Classic Streams) | WHATWG Web Streams 标准 |
| :--- | :--- | :--- |
| **标准发起者** | Node.js 社区早期（约 2011 年）独立制定 | W3C / WHATWG 官方浏览器与 Web 标准组织 |
| **底层核心机制** | 深度依赖 **`EventEmitter` 事件模型**（监听 `data`, `end`, `error`） | 基于 **`Promise` 状态机与 Reader 锁机制**（`reader.read()` 返回 `{ value, done }`） |
| **跨环境通用性** | 仅限于 Node.js 运行时，无法在原生浏览器环境运行 | **跨平台通用**（现代浏览器、Node.js、Deno、Bun、Cloudflare Workers） |
| **独占性控制** | 多个监听器可以同时监听同一个流 | 采用**独占锁（Locking Mechanism）**：通过 `getReader()` 锁定流，同一时刻只能有一个 Reader 读取 |

---

### Q2: 为什么在现代全栈架构（Next.js SSR、Serverless/Edge、AI 大模型）中，Web Streams 正在迅速取代传统 Node 流？

#### 🎯 面试官考点
- 云原生边缘计算（Edge Computing）与跨平台同构技术演进。

#### 💡 满分回答模板
1. **边缘计算环境（Edge Runtime）不包含 Node.js 内置模块**：
   - 像 Vercel Edge Runtime、Cloudflare Workers 等轻量沙盒环境为了追求 0 毫秒冷启动和极低内存，底层并不运行完整的 Node.js，也没有 `node:stream` 模块。它们原生只实现 Web 标准 API（如 `fetch`、`Request`、`Response`、`ReadableStream`）。
2. **AI 大模型流式输出（LLM Streaming）的行业通用契约**：
   - OpenAI、Anthropic 等各大 AI 服务商的官方 SDK 和标准 Server-Sent Events (SSE) 协议均以 Web `ReadableStream` 为基础构建。使用 Web Streams 可以在前后端实现真正的“同构流式管道”，无需在各层编写繁琐的适配层。

---

### Q3: 如果在传统 Node.js 服务端（如 Express / Fastify）中接收到了一个 Web `ReadableStream`（例如调用外部 Fetch 获得），应该如何高效处理？

#### 🎯 面试官考点
- 掌握官方标准互通桥梁，避免手写事件监听导致背压丢失。

#### 💡 满分回答模板
1. **使用官方桥接 API `Readable.fromWeb()`**：
   - Node.js 官方在 `node:stream` 中内置了转换方法：
     ```typescript
     import { Readable } from "node:stream";

     const response = await fetch("https://api.openai.com/v1/chat/completions", { ... });
     // 将 Web ReadableStream 转换为 Node.js 原生 Readable 流
     const nodeStream = Readable.fromWeb(response.body);

     // 随后即可直接 pipe 给 Express/Fastify 的 res 响应流
     nodeStream.pipe(res);
     ```
2. **或者使用现代 `for await...of` 异步迭代器原生消费**：
   - 现代 Node.js 原生支持对 Web `ReadableStream` 直接进行 `for await (const chunk of webStream)` 遍历消费，完全不需要显式转换，语法最简洁优雅。
