/**
 * 02-sse-ai-streaming
 * 演示 Server-Sent Events (text/event-stream) 规范、大模型流式逐 Token 推送与连接断开中止控制
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

// 模拟大模型逐步流式输出 Token
async function handleSseStream(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  let isAborted = false;
  // 核心考点：监听客户端是否中途挂断/取消请求 (点击“停止生成”)
  req.on('close', () => {
    isAborted = true;
  });

  const sampleTokens = ['Node.js ', '2026 ', 'LLM ', 'Streaming ', 'Complete!'];

  for (const token of sampleTokens) {
    if (isAborted) {
      console.log('   ⚠️ 客户端已提前中断连接，立即停止大模型后续算力消耗');
      return;
    }
    // 标准 SSE 协议行：必须以 "data: ...\n\n" 结尾
    res.write(`data: ${JSON.stringify({ token })}\n\n`);
    await new Promise((r) => setTimeout(r, 15)); // 模拟模型生成耗时
  }

  res.write('data: [DONE]\n\n');
  res.end();
}

async function run(): Promise<void> {
  console.log('=== SSE 大模型流式输出与取消控制实战 ===');

  const server = createServer((req, res) => {
    void handleSseStream(req, res);
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  const sseUrl = `http://127.0.0.1:${port}/api/chat/completions`;
  console.log(`1. 原生 SSE 服务端已启动: ${sseUrl}`);

  // 2. 客户端使用原生 fetch 消费 SSE 流式响应
  console.log('2. 客户端发起流式调用并实时解码 Token:');
  const response = await fetch(sseUrl);
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (reader) {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const rawChunk = decoder.decode(value);
      for (const line of rawChunk.split('\n')) {
        if (line.startsWith('data: ')) {
          const payload = line.replace('data: ', '').trim();
          console.log(`   ✔ 收到流式事件帧: ${payload}`);
        }
      }
    }
  }

  await new Promise<void>((resolve) => server.close(() => resolve()));
  console.log('3. SSE 流式传输结束，服务已平稳关闭');
  console.log('========================================');
}

await run();
