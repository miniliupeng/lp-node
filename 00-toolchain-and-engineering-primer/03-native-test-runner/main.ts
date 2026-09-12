/**
 * 03-native-test-runner
 * 演示程序化执行与验证 node:test 原生测试模块
 */

import assert from 'node:assert/strict';
import { delayedSum, divide } from './math.ts';

async function runSelfVerification(): Promise<void> {
  console.log('=== Node.js 原生测试与严格断言演示 ===');

  // 1. 同步测试断言验证
  console.log('1. 验证同步除法函数 divide(100, 4)...');
  const divRes = divide(100, 4);
  assert.equal(divRes, 25, '100 / 4 必须等于 25');
  console.log('   ✔ 同步断言通过: 返回 25');

  // 2. 异常捕获断言验证
  console.log('2. 验证边界除以零断言 assert.throws...');
  assert.throws(
    () => divide(100, 0),
    (err: unknown) => err instanceof Error && err.message.includes('DivisionByZero'),
    '必须抛出包含 DivisionByZero 的异常'
  );
  console.log('   ✔ 异常断言通过: 成功捕获除以零错误');

  // 3. 异步 Promise 断言验证
  console.log('3. 验证异步计算函数 delayedSum(15, 25)...');
  const asyncRes = await delayedSum(15, 25, 5);
  assert.equal(asyncRes, 40, '异步求和必须等于 40');
  console.log('   ✔ 异步断言通过: 返回 40');

  console.log('---------------------------------------');
  console.log('💡 提示: 你也可以直接使用原生 CLI 命令运行测试文件:');
  console.log(
    '   node --test 00-toolchain-and-engineering-primer/03-native-test-runner/main.test.ts'
  );
  console.log('=======================================');
}

await runSelfVerification();
