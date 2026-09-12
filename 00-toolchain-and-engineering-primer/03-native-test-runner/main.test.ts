/**
 * 03-native-test-runner / main.test.ts
 * 原生 node:test 与 node:assert/strict 现代单测规范
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { delayedSum, divide } from './math.ts';

describe('核心计算模块测试套件 (Native Test)', () => {
  it('正向用例: 正常两数相除应该返回正确商', () => {
    const result = divide(10, 2);
    assert.equal(result, 5);
  });

  it('边界逆向: 当除数为 0 时必须抛出明确错误', () => {
    assert.throws(() => divide(10, 0), /DivisionByZero/, '除以零应当被断言拦截');
  });

  it('异步用例: 模拟延迟累加应返回正确结果', async () => {
    const sum = await delayedSum(20, 30, 5);
    assert.equal(sum, 50);
  });

  it('对象断言: 深度相等比较演示', () => {
    const userA = { id: 1, roles: ['admin', 'editor'] };
    const userB = { id: 1, roles: ['admin', 'editor'] };
    // 使用 strict 模式下的 deepEqual 对比对象内容
    assert.deepEqual(userA, userB);
  });
});
