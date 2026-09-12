/**
 * 03-worker-threads-cpu-bound
 * 演示 worker_threads 多线程并行计算 CPU 密集任务，同时保证主线程事件循环 0 阻塞
 */

import { isMainThread, parentPort, Worker, workerData } from 'node:worker_threads';

// CPU 密集型计算函数 (模拟高负荷数学运算)
function calculateCpuIntensiveTask(iterations: number): number {
  let sum = 0;
  for (let i = 0; i < iterations; i++) {
    sum += Math.sqrt(i % 1000);
  }
  return Math.floor(sum);
}

if (isMainThread) {
  console.log('=== worker_threads 多线程 CPU 密集计算实战 ===');
  console.log('1. 主线程启动，将重型 CPU 计算任务派发给独立工作线程...');

  // 衍生工作线程，执行当前文件的子线程分支
  const worker = new Worker(import.meta.filename, {
    workerData: { iterations: 10_000_000 },
  });

  // 主线程同时启动一个高频心跳定时器，检验主线程是否保持响应
  let heartbeatCount = 0;
  const heartbeatTimer = setInterval(() => {
    heartbeatCount += 1;
    console.log(`   -> [主线程心跳 ${heartbeatCount}] 事件循环丝滑运转，毫无卡顿`);
  }, 10);

  // 接收工作线程返回的计算结果
  worker.on('message', (result: number) => {
    clearInterval(heartbeatTimer);
    console.log(`2. 收到工作线程计算回执: 计算结果 = ${result}`);
    console.log('   ✔ 核心结论: 密集计算在工作线程执行，主线程维持毫秒级非阻塞响应');
    console.log('==============================================');
  });

  worker.on('error', (err) => console.error('工作线程异常:', err));
} else {
  // Worker 工作线程分支 (拥有独立的 V8 Isolate)
  const { iterations } = workerData as { iterations: number };
  const computationResult = calculateCpuIntensiveTask(iterations);
  // 通过 postMessage 将结果序列化传递回主线程
  parentPort?.postMessage(computationResult);
}
