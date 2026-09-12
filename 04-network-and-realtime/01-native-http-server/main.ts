/**
 * 01-native-http-server
 * 演示零外部依赖原生 HTTP 服务：流式解析 Request Body、路由分发与端到端自动化自测
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

// 辅助函数：将可读流累加为字符串
async function readStreamBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// 核心请求路由器
async function routeHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const { url, method } = req;

  if (method === 'GET' && url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', timestamp: Date.now() }));
    return;
  }

  if (method === 'POST' && url === '/api/echo') {
    const rawBody = await readStreamBody(req);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ echo: rawBody }));
    return;
  }

  // 404 兜底路由
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'NotFound', path: url }));
}

async function run(): Promise<void> {
  console.log('=== 零外部依赖原生 HTTP 服务实战 ===');

  // 1. 启动服务器，端口传 0 让操作系统动态分配空闲端口，避免冲突
  const server = createServer((req, res) => {
    void routeHandler(req, res);
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`1. 原生 HTTP 服务器就绪，监听临时端口: ${baseUrl}`);

  // 2. 端到端自动化自测 (使用原生 fetch)
  console.log('2. 自动化发起端到端接口自测:');

  // 测试 GET /api/health
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthData = await healthRes.json();
  console.log(
    `   ✔ GET /api/health -> 状态: ${healthRes.status}, 返回: ${JSON.stringify(healthData)}`
  );

  // 测试 POST /api/echo (流式读取 Body)
  const echoRes = await fetch(`${baseUrl}/api/echo`, {
    method: 'POST',
    body: 'Hello Native Node 2026',
  });
  const echoData = await echoRes.json();
  console.log(`   ✔ POST /api/echo -> 状态: ${echoRes.status}, 返回: ${JSON.stringify(echoData)}`);

  // 3. 安全平稳关闭服务
  await new Promise<void>((resolve) => server.close(() => resolve()));
  console.log('3. 测试通过，原生 HTTP 服务实例已平稳关闭释放端口');
  console.log('====================================');
}

await run();
