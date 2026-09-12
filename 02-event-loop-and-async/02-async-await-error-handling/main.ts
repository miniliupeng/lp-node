/**
 * 02-async-await-error-handling
 * 演示 Go 风格 Safe Await 元组捕获与 Promise.allSettled 并发容灾降级
 */

// 1. 泛型安全包装函数：消除 try/catch 地狱，返回 [Error, null] | [null, T]
export async function toSafe<T>(promise: Promise<T>): Promise<[Error, null] | [null, T]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), null];
  }
}

// 模拟异步外部 RPC 调用
async function fetchService(serviceName: string, shouldFail = false): Promise<string> {
  await new Promise((r) => setTimeout(r, 10));
  if (shouldFail) {
    throw new Error(`服务 [${serviceName}] 响应异常: 503 Service Unavailable`);
  }
  return `${serviceName} 数据载荷`;
}

async function run(): Promise<void> {
  console.log('=== 异步异常治理与并发容灾实战 ===');

  // 1. 验证 Go 风格 safe await
  console.log('1. Go 风格 Safe Await 异常处理:');
  const [successErr, successData] = await toSafe(fetchService('用户服务', false));
  if (!successErr) {
    console.log(`   ✔ 成功分支: 收到 ${successData}`);
  }

  const [failErr, _failData] = await toSafe(fetchService('积分服务', true));
  if (failErr) {
    console.log(`   ✔ 失败拦截: 优雅捕获预期异常 -> "${failErr.message}"`);
  }

  // 2. 验证 Promise.allSettled 并发容灾能力
  console.log('2. 并发调用容灾降级 (Promise.allSettled):');
  const taskGroup = [
    fetchService('订单中心', false),
    fetchService('风控服务', false),
    fetchService('推荐引擎', true), // 该服务故意模拟失败
  ];

  const settledResults = await Promise.allSettled(taskGroup);
  const successList: string[] = [];
  const degradedList: string[] = [];

  for (const res of settledResults) {
    if (res.status === 'fulfilled') {
      successList.push(res.value);
    } else {
      degradedList.push((res.reason as Error).message);
    }
  }

  console.log(`   - 正常响应服务数: ${successList.length} (${successList.join(', ')})`);
  console.log(`   - 自动容灾降级数: ${degradedList.length} (触发本地兜底规则)`);
  console.log('=================================');
}

await run();
