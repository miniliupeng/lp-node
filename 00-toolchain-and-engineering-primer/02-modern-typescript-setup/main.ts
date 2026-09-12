/**
 * 02-modern-typescript-setup
 * 演示 NodeNext 模块规范：显式导入 .ts 扩展名、顶级 await 与纯 ESM 执行
 */

import { calculate } from './calc.ts';

async function simulateAsyncStep(stepName: string, delayMs: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  console.log(`  [执行步骤完成]: ${stepName}`);
}

async function run(): Promise<void> {
  console.log('=== Modern TypeScript NodeNext 演示 ===');

  // 1. 验证 NodeNext 规范模块调用
  const addResult = calculate('add', 12, 28);
  const mulResult = calculate('multiply', 7, 8);

  console.log('1. 模块计算与强类型输出:');
  console.log(
    `   - 加法: ${addResult.operands[0]} + ${addResult.operands[1]} = ${addResult.result}`
  );
  console.log(
    `   - 乘法: ${mulResult.operands[0]} * ${mulResult.operands[1]} = ${mulResult.result}`
  );

  // 2. 验证原生 Top-Level Await 异步流转
  console.log('2. 异步流水线测试 (Top-Level Await):');
  await simulateAsyncStep('加载配置文件', 10);
  await simulateAsyncStep('建立资源连接', 10);

  // 3. 打印当前模块元信息
  console.log('3. 模块元信息:');
  console.log(`   - 模块 URL: ${import.meta.url}`);
  console.log('=======================================');
}

await run();
