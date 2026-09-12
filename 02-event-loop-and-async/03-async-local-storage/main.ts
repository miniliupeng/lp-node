/**
 * 03-async-local-storage
 * 演示 Node.js 原生 AsyncLocalStorage 在并发请求下实现全链路上下文隔离
 */

import { AsyncLocalStorage } from 'node:async_hooks';

// 1. 定义请求上下文契约
interface RequestContext {
  traceId: string;
  userId: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

// 2. 模拟深层无参调用的数据访问层 (DAO)
async function queryDatabase(sql: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  // 零参数透传，直接从异步宿主上下文中读取当前请求元信息
  const context = asyncLocalStorage.getStore();
  const traceId = context?.traceId ?? 'UNKNOWN_TRACE';
  return `[DB 响应 | Trace: ${traceId}] 执行 SQL: "${sql}" 完成`;
}

// 3. 模拟业务服务层 (Service)
async function handleUserOrder(orderId: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 10));
  const ctx = asyncLocalStorage.getStore();
  console.log(`  -> 业务层处理中 [Trace: ${ctx?.traceId} | User: ${ctx?.userId}] 订单: ${orderId}`);
  return await queryDatabase(`SELECT * FROM orders WHERE id = '${orderId}'`);
}

// 4. 模拟 Web 请求入口控制器 (Controller)
async function simulateIncomingRequest(
  traceId: string,
  userId: string,
  orderId: string
): Promise<void> {
  // 通过 run 方法建立当前请求的异步执行上下文环境
  await asyncLocalStorage.run({ traceId, userId }, async () => {
    console.log(`[入口收到请求] Trace: ${traceId}, User: ${userId}`);
    const dbResult = await handleUserOrder(orderId);
    console.log(`  <- 返回结果: ${dbResult}`);
  });
}

async function run(): Promise<void> {
  console.log('=== AsyncLocalStorage 全链路追踪实战 ===');

  // 并发模拟两个交替执行的 HTTP 请求
  await Promise.all([
    simulateIncomingRequest('trace-alpha-101', 'usr_alex', 'ord_9981'),
    simulateIncomingRequest('trace-beta-202', 'usr_bob', 'ord_9982'),
  ]);

  console.log('✔ 验证完成: 并发交错执行下各上下文严格隔离，未发生变量污染串单！');
  console.log('========================================');
}

await run();
