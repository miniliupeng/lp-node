/**
 * 01-zod-runtime-validation
 * 演示 Zod 运行时 Schema 校验、safeParse 错误格式化与 z.infer 类型反向推导
 */

import { z } from 'zod';

// 1. 定义用户注册 DTO 契约 Schema
export const UserRegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email('邮箱格式不正确'),
  // coerce 自动将前端可能传来的字符串 "25" 转成数字 25
  age: z.coerce.number().int().min(18, '必须年满 18 岁'),
  role: z.enum(['developer', 'manager']).default('developer'),
});

// 2. 利用 z.infer 从 Schema 自动推导出 TypeScript 静态类型 (单一片真源)
export type UserRegisterDto = z.infer<typeof UserRegisterSchema>;

// 模拟 API 控制器处理函数
function handleRegisterRequest(rawInput: unknown): { ok: boolean; message: string } {
  // safeParse 杜绝异常崩溃，返回安全的结果对象
  const parseResult = UserRegisterSchema.safeParse(rawInput);

  if (!parseResult.success) {
    // 使用 format() 或 flatten() 提取扁平化的字段错误
    const errors = parseResult.error.flatten().fieldErrors;
    return { ok: false, message: `输入参数校验失败: ${JSON.stringify(errors)}` };
  }

  const validData: UserRegisterDto = parseResult.data;
  return {
    ok: true,
    message: `注册成功! 账号: ${validData.username}, 邮箱: ${validData.email}, 年龄: ${validData.age}`,
  };
}

function run(): void {
  console.log('=== Zod 运行时数据验证实战 ===');

  // 1. 正向合法数据测试
  console.log('1. 正向用例测试 (数据合法且 age 传入了字符串数字):');
  const validPayload = {
    username: 'alex_dev',
    email: 'alex@tech.internal',
    age: '24', // 验证 coerce.number 强转能力
  };
  const successRes = handleRegisterRequest(validPayload);
  console.log(`   ✔ ${successRes.message}`);

  // 2. 逆向非法数据测试 (格式错误、未满18岁)
  console.log('2. 逆向边界测试 (故意传入非法邮箱与未满18岁年龄):');
  const invalidPayload = {
    username: 'al', // 过短 (< 3)
    email: 'not-an-email', // 非法邮箱
    age: 16, // 未成年 (< 18)
  };
  const failRes = handleRegisterRequest(invalidPayload);
  console.log(`   ✔ 成功被防御闸口拦截:`);
  console.log(`     ${failRes.message}`);

  console.log('==============================');
}

run();
