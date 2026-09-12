# 大厂高频面试题精讲 (01-mcp-server-protocol)

---

### Q1: 什么是 MCP（Model Context Protocol）？它与传统 RESTful API 或各厂商独占的 Function Calling SDK 有何本质区别？

#### 🎯 面试官考点
- AI Agent 与大模型基础设施标准化协议演进、厂商锁定解耦。

#### 💡 满分回答模板
1. **本质定位（大模型领域的“语言服务器协议 LSP”）**：
   - 就像微软当年提出 LSP（Language Server Protocol）让一个语言分析器可以同时插拔到 VSCode、Sublime、Vim 中一样，**MCP 是由 Anthropic 发起的大模型与上下文工具解耦的行业通用开放协议**。
2. **与传统方案的根本区别**：
   - **传统厂商 SDK（OpenAI / Gemini / Claude）**：各家参数格式不同、调用语法互不兼容，后端必须为不同模型写适配胶水层，一旦更换底层模型代码几乎要重写；
   - **传统 RESTful API**：面向人类前端或普通微服务设计，没有对大模型友好的语义元数据描述（Description）、输入参数 JSON Schema 校验规约与标准资源发现机制；
   - **MCP 的跨代优势**：标准化了 **Tools（工具）**、**Resources（上下文数据源）**、**Prompts（提示词）** 三大核心抽象，统一基于 JSON-RPC 2.0 交互。一个 MCP Server 编写完毕后，任何支持 MCP 标准的 AI 宿主（Claude Desktop, Cursor, Antigravity, 开源 Agent 框架）均可**即插即用、动态发现、自动调用**。

---

### Q2: MCP 协议为什么主要支持 `stdio` 与 `SSE/HTTP` 两种传输层（Transports）？各自的适用场景是什么？

#### 🎯 面试官考点
- IPC 进程间标准流 vs 远程网络流在 AI 客户端集成中的权衡。

#### 💡 满分回答模板
1. **`stdio` 传输层（标准输入输出流）**：
   - **原理**：AI 宿主客户端（如本地桌面端或 IDE）作为父进程，直接通过 `child_process.spawn()` 拉起 MCP Server 作为子进程。双方通过操作系统的 `stdin` 发送请求、`stdout` 接收响应（遵循 JSON-RPC 行分隔格式）。
   - **适用场景**：**本地开发与桌面 IDE 工具**（如让本地 AI 操作本地 Git、执行终端命令、读写当前磁盘文件）。零网络端口监听，安全性极高，生命周期与 IDE 窗口自动绑定。
2. **`SSE / HTTP` 传输层**：
   - **原理**：客户端通过 HTTP POST 发送 JSON-RPC 指令，服务端通过 Server-Sent Events (SSE) 单向流式长连接回传执行进度与响应。
   - **适用场景**：**企业级远程微服务与云端 Agent 集群**。AI 客户端在云端运行，需要跨机房调用企业内部的数据库 MCP 服务或 CRM 业务网关。

---

### Q3: 在企业级生产环境中对外暴露 MCP Server，必须考虑哪些安全红线（Security Best Practices）？

#### 🎯 面试官考点
- 提示词注入（Prompt Injection）、工具滥用越权（Tool Misuse）与 Agent 沙箱安全。

#### 💡 满分回答模板
1. **输入强 Schema 校验与防注入（Injection Defense）**：
   - 大模型生成的参数经常包含幻觉或隐蔽的攻击指令。在工具执行前，必须使用类似 Zod 的强类型模式在 MCP Server 入口进行二次严密校验；若工具涉及 Shell 执行或 SQL 查询，严禁拼接，必须参数化或沙箱化。
2. **人工介入确认机制（Human-in-the-loop）**：
   - 区分“只读工具”（如 `query_user_info`，可全自动放行）与“破坏性/高危工具”（如 `delete_order`, `transfer_funds`, `drop_table`）。高危工具在 MCP 层面必须返回确认标记，要求终端人类明确点击授权后方可真正执行。
3. **细粒度认证与权限最小化（Least Privilege）**：
   - 远程 MCP 必须结合基于 JWT / OAuth 2.0 的身份传递，将当前用户的真实权限透传给工具后端，杜绝 AI 客户端以“超级管理员”全局权限越权执行。
