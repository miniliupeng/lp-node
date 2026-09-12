# 04-web-streams-interop: 现代 Web Streams 与 Node.js 原生流互通

随着全栈同构（SSR）、Edge 边缘计算（Cloudflare Workers / Vercel Edge）以及大模型流式响应（LLM Streaming）的普及，遵循 **WHATWG Web Streams 标准** 已经成为现代 JavaScript 生态的通行语言。

---

## 💡 核心原理三段式

### 1. 是什么？
- **Node.js Classic Streams**：Node.js 自 2010 年代发展出的原生流（`node:stream`），基于 EventEmitter 事件发布订阅机制工作。
- **WHATWG Web Streams**：现代 Web 浏览器与跨平台运行时的全球标准流，包含 `ReadableStream`、`WritableStream`、`TransformStream`，深度基于 Promise 与异步迭代器规范。
- **桥接互通 API**：
  - `Readable.toWeb(nodeReadable)`：将 Node.js 原生流转换为 Web `ReadableStream`；
  - `Readable.fromWeb(webStream)`：将 Web `ReadableStream` 转换为 Node.js 原生流。

### 2. 为什么需要它？
- **跨平台同构**：你在 Node.js 中写的一段流式转换逻辑，可以原封不动地跑在浏览器、Deno、Bun 或 Cloudflare Workers 上，不用安装任何兼容垫片。
- **大模型 AI 流式对接**：像 OpenAI SDK 或 LangChain 返回的流式响应基本全都是标准的 Web `ReadableStream`，通过官方互通桥梁，可以零阻力与现有的 Express/Fastify/原生 HTTP 响应打通。

### 3. 日常工作中怎么用？
- 在处理原生 Fetch 响应体 `response.body` 时，使用 Web Streams 原语进行消费或利用 `fromWeb` 转为 Node 流管道。

---

## 🔬 核心代码切片

```typescript
import { Readable } from "node:stream";

// 1. 创建现代 Web ReadableStream
const webStream = new ReadableStream({
  start(controller) {
    controller.enqueue("chunk-1");
    controller.close();
  },
});

// 2. 无缝转换为 Node 原生流
const nodeReadable = Readable.fromWeb(webStream);
```

---

## 🖥️ 控制台预期输出快照

```text
=== Web Streams 与 Node.js 原生流互通实战 ===
1. 原生 Web Streams (TransformStream) 转换流实测:
   - 原始输入 -> Web Transform 流大写转换 -> 最终输出:
   ✔ 收到转换块: "HELLO"
   ✔ 收到转换块: "WORLD"
2. 双向互通桥梁 (fromWeb / toWeb) 验证:
   - Web ReadableStream 成功转换为 Node.js 原生流
   - 通过 Node 异步迭代器读取到: "Node Web Stream Interop"
============================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 03-fs-buffer-and-streams/04-web-streams-interop/main.ts
```
