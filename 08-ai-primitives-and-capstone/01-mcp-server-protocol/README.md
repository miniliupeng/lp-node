# 01-mcp-server-protocol: 打造轻量 MCP (Model Context Protocol) 标准工具服务

随着 AI Agent 架构的普及，由 Anthropic 提出的开源行业开放标准 **MCP (Model Context Protocol)** 正在迅速成为连接大模型与本地/云端后端服务的标准通用协议。

---

## 💡 核心原理三段式

### 1. 是什么？
- **MCP (模型上下文协议)**：一种基于 **JSON-RPC 2.0** 格式的标准化双向通信协议，专为 LLM 应用连接外部数据源、运行环境和外部工具设计。
- **三大核心能力**：
  - **Tools（工具）**：大模型可以调用的函数（如查询数据库、执行代码、发送消息）；
  - **Resources（资源）**：向大模型提供只读的上下文数据（如日志文件、配置）；
  - **Prompts（提示词模板）**：预设的交互模板。
- **常见传输协议 (Transports)**：
  - **stdio (标准输入输出)**：适用于本地开发与 IDE 插件集成（子进程通过 stdin/stdout 通信）；
  - **SSE / HTTP**：适用于远程微服务网络调用。

### 2. 为什么需要搞透它？
- **告别专有 SDK 锁定**：以前给 OpenAI 写一套 Function Calling，给 Claude 又得写一套 Tools，换个开源模型还得重写；MCP 让后端开发者只需编写一次 MCP Server，就能被全球所有的主流 AI 客户端（Claude Desktop, Cursor, Antigravity）直接发现和安全调用。

### 3. 日常工作中怎么用？
- 编写企业内部的私有 MCP 服务，将现有的业务 API（用户查询、订单操作、运维脚本）标准化暴露给企业 AI 助手。

---

## 🔬 核心代码切片 (JSON-RPC 2.0 协议骨架)

```typescript
// MCP tools/call 请求处理
if (method === "tools/call") {
  const { name, arguments: args } = params;
  const result = await executeTool(name, args);
  return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: result }] } };
}
```

---

## 🖥️ 控制台预期输出快照

```text
=== 轻量 MCP (Model Context Protocol) 服务实战 ===
1. 初始化轻量 MCP 服务 (基于 JSON-RPC 2.0 协议规范)
2. 模拟 AI 客户端发起 [tools/list] 获取可用工具列表:
   ✔ 发现工具: "query_user_info" (获取用户核心档案)
3. 模拟 AI 客户端发起 [tools/call] 执行具体工具 (入参: userId=usr_1001):
   ✔ 工具执行成功，返回标准化 MCP 响应:
     {"content":[{"type":"text","text":"用户档案: [usr_1001] Alex (级别: 资深工程师)"}]}
==================================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 08-ai-primitives-and-capstone/01-mcp-server-protocol/main.ts
```
