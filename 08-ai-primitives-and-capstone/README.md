# 阶段 08: AI 时代原语与收官实战

随着生成式 AI 与大语言模型（LLM）的全面爆发，后端开发正在经历一场前所未有的重构。现代 Node.js 工程师不仅要精通传统并发与流式处理，更要掌握 AI 时代的两大核心标准原语：**MCP (Model Context Protocol)** 与 **SSE (Server-Sent Events) 流式推送**，并在最终的综合收官实战中完成所有核心技能的集大成演练。

---

## ☕ 生活化心智：智能管家与打字机

1. **MCP (Model Context Protocol, 模型上下文协议)**：
   - 就像**给 AI 大脑安装标准通用的 USB 接口**。以前每个大模型接入外部数据库、搜索工具都需要各自适配一套私有 SDK；Anthropic 发起的 MCP 标准基于 JSON-RPC 2.0，让任何 AI 客户端（Claude, Cursor, Antigravity）都能以完全统一的规范即插即用调用后端工具。
2. **SSE (Server-Sent Events) AI 流式输出**：
   - 就像**老式电报机或打字机**。大模型生成回答是一个字一个字（Token）蹦出来的。如果等它生成 2000 字再全部返回，用户需要在屏幕前傻等 30 秒；通过基于单向 HTTP 长连接的 SSE，大模型每生成一个 Token，后端立即以 `data: ...\n\n` 格式推送给前端，实现极度丝滑的打字机特效。
3. **综合收官引擎 (Capstone Pipeline)**：
   - 这是整套教程的**毕业典礼**。我们将把 TypeScript 强类型契约、AsyncLocalStorage 全链路追踪、Stream 背压流控与异步异常防御融汇于一个高并发流式任务治理小引擎中。

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
