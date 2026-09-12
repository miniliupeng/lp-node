/**
 * 04-env-and-configuration
 * 演示现代环境变量读取 (process.loadEnvFile) 与 Zod 安全类型校验
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

// 1. 定义应用配置的严格契约模型
const AppConfigSchema = z.object({
  PORT: z.coerce.number().int().min(1024).max(65535).default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url().default('postgres://postgres:root@localhost:5432/app_db'),
  ENABLE_METRICS: z.coerce.boolean().default(false),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

function loadAndValidateConfig(): AppConfig {
  const envPath = resolve(import.meta.dirname, '.env.example');

  // Node.js 20.6+ 原生支持加载 .env 文件，如果存在则加载
  if (typeof process.loadEnvFile === 'function' && existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }

  // 使用 Zod 安全解析 process.env（自动完成字符串到数字、布尔值的强转）
  const parseResult = AppConfigSchema.safeParse(process.env);
  if (!parseResult.success) {
    console.error('❌ 环境变量校验失败，服务拒绝启动:');
    console.error(parseResult.error.format());
    process.exit(1);
  }
  return parseResult.data;
}

function run(): void {
  console.log('=== 现代环境变量治理与类型安全演示 ===');

  // 1. 正向验证与类型打印
  const cfg = loadAndValidateConfig();
  console.log('1. 校验成功的配置对象 (只读且具备精确类型):');
  console.log(`   - 监听端口 (PORT): ${cfg.PORT} (类型: ${typeof cfg.PORT})`);
  console.log(`   - 环境模式 (NODE_ENV): ${cfg.NODE_ENV}`);
  console.log(`   - 数据库连接串 (DATABASE_URL): ${cfg.DATABASE_URL}`);
  console.log(
    `   - 指标采集开关 (ENABLE_METRICS): ${cfg.ENABLE_METRICS} (类型: ${typeof cfg.ENABLE_METRICS})`
  );

  // 2. 逆向防御测试：检验非法数据输入时的拦截能力
  console.log("2. 边界逆向测试 (故意传入非法端口 'not_a_port'):");
  const testInvalid = AppConfigSchema.safeParse({ PORT: 'not_a_port' });
  if (!testInvalid.success) {
    console.log('   ✔ 成功拦截非法配置: 端口必须为有效数值');
  }

  console.log('======================================');
}

run();
