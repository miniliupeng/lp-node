/**
 * 03-native-test-runner / math.ts
 * 包含同步与异步计算的典型业务函数
 */

export function divide(numerator: number, denominator: number): number {
  if (denominator === 0) {
    throw new Error('DivisionByZero: 除数不能为零');
  }
  return numerator / denominator;
}

export async function delayedSum(a: number, b: number, delayMs = 10): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return a + b;
}
