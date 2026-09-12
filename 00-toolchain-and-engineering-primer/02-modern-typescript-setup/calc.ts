/**
 * 02-modern-typescript-setup / calc.ts
 * 纯净数学计算模块，供 main.ts 演示 NodeNext 规范显式导入
 */

export interface CalculationResult {
  operation: string;
  operands: [number, number];
  result: number;
}

export function calculate(op: 'add' | 'multiply', a: number, b: number): CalculationResult {
  const result = op === 'add' ? a + b : a * b;
  return {
    operation: op,
    operands: [a, b],
    result,
  };
}
