# 阶段 08: AI 时代原语与收官实战

随着大语言模型（LLM）与智能体（Agent）架构的全面普及，现代 Node.js 工程师不仅需要掌握传统网络与并发流控，更要熟练运用 AI 时代的两大核心标准原语：**MCP (Model Context Protocol)** 与 **SSE (Server-Sent Events) 流式推送**，并在最终的综合收官实战中完成全课程技能的工程化集成。

---

## 💡 核心工程心智与前沿原语

1. **Model Context Protocol (MCP, 模型上下文协议)**：
   - Anthropic 发起的大模型与上下文工具解耦的行业开放协议，相当于大模型领域的“语言服务器协议 LSP”；
   - 统一基于 **JSON-RPC 2.0** 报文规范，标准化 Tools（工具执行）、Resources（只读上下文）与 Prompts（提示模板）；
   - 支持 `stdio`（本地 IDE/桌面端集成，零网络端口暴露）与 `SSE/HTTP`（云端分布式微服务调用）。
2. **Server-Sent Events (SSE) 流式打字机推送**：
   - 基于标准 HTTP 的单向流式推送协议（`text/event-stream`），比全双工 WebSocket 更轻量、代理穿透性更好；
   - 掌握双换行 `\n\n` 作为应用层事件帧定界符的协议本质；
   - 掌握客户端 `AbortController` 取消请求与服务端 `req.on('close')` 监听联动，避免客户端退出后大模型推理 GPU 算力与 Token 浪费。
3. **综合收官：高并发流式任务编排流水线**：
   - 融合 TypeScript 严格契约类型；
   - 结合 `AsyncLocalStorage` 贯穿跨流全链路上下文与 `traceId` 追踪；
   - 采用 `stream.pipeline` 实现自适应背压控制与物理零资源泄漏；
   - 践行 Go 风格 Safe 元组容灾，构建高可用、高性能的现代任务治理引擎。

---

## 🗺️ 阶段专题导航

| 专题目录 | 核心原语 | 关键掌握目标 |
| :--- | :--- | :--- |
| **[01-mcp-server-protocol](./01-mcp-server-protocol)** | MCP 标准服务与 JSON-RPC 2.0 | 掌握 Model Context Protocol 工具注册、Schema 暴露与标准 stdio 管道处理 |
| **[02-sse-ai-streaming](./02-sse-ai-streaming)** | SSE 大模型流式输出与取消控制 | 掌握 `text/event-stream` 格式规范、心跳保持与客户端中断（AbortController） |
| **[03-capstone-pipeline-orchestration](./03-capstone-pipeline-orchestration)** | 综合收官：并发流式任务治理引擎 | 综合融汇 TS 类型、ALS 追踪、流背压、优雅下线与容灾，构建小而美的生产级引擎 |

---

## 🚀 统一运行指令

```bash
make run-08
```
