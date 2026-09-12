/**
 * 01-mcp-server-protocol
 * 演示现代 Model Context Protocol (MCP) 核心协议规范与基于 JSON-RPC 2.0 的工具调用
 */

// 1. 定义标准 JSON-RPC 2.0 报文契约
interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

// 2. 模拟轻量 MCP 工具服务处理器
class MiniMcpServer {
  private tools = [
    {
      name: 'query_user_info',
      description: '根据用户 ID 查询员工档案与角色权限',
      inputSchema: {
        type: 'object',
        properties: { userId: { type: 'string' } },
        required: ['userId'],
      },
    },
  ];

  async handleMessage(rawMessage: JsonRpcRequest): Promise<JsonRpcResponse> {
    const { id, method, params } = rawMessage;

    // MCP 核心协议方法 1: 工具列表发现 (tools/list)
    if (method === 'tools/list') {
      return { jsonrpc: '2.0', id, result: { tools: this.tools } };
    }

    // MCP 核心协议方法 2: 工具具体执行 (tools/call)
    if (method === 'tools/call') {
      const toolName = params?.name as string;
      const toolArgs = (params?.arguments as Record<string, unknown>) ?? {};

      if (toolName === 'query_user_info') {
        const userId = String(toolArgs.userId ?? 'unknown');
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `档案查询成功: [ID: ${userId}] Alex (职位: 架构师, 状态: 在线)`,
              },
            ],
          },
        };
      }
      return { jsonrpc: '2.0', id, error: { code: -32601, message: `未知工具: ${toolName}` } };
    }

    return { jsonrpc: '2.0', id, error: { code: -32600, message: '无效的 MCP 请求方法' } };
  }
}

async function run(): Promise<void> {
  console.log('=== 轻量 MCP (Model Context Protocol) 服务实战 ===');
  const server = new MiniMcpServer();

  // 1. 模拟 AI 客户端查询可用工具 (tools/list)
  console.log('1. 模拟 AI 客户端发起 [tools/list] 工具嗅探发现:');
  const listReq: JsonRpcRequest = { jsonrpc: '2.0', id: 101, method: 'tools/list' };
  const listRes = await server.handleMessage(listReq);
  console.log(`   ✔ 成功发现工具列表: ${JSON.stringify(listRes.result)}`);

  // 2. 模拟 AI 客户端调用具体工具 (tools/call)
  console.log('2. 模拟 AI 客户端触发 [tools/call] 执行 (入参 userId=usr_998):');
  const callReq: JsonRpcRequest = {
    jsonrpc: '2.0',
    id: 102,
    method: 'tools/call',
    params: { name: 'query_user_info', arguments: { userId: 'usr_998' } },
  };
  const callRes = await server.handleMessage(callReq);
  console.log(`   ✔ 获得标准 MCP 执行结果: ${JSON.stringify(callRes.result)}`);

  console.log('==================================================');
}

await run();
