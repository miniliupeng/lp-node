/**
 * 04-satisfies-and-const
 * 演示 as const 常量断言与 satisfies 运算符的精确类型保留机制
 */

// 1. as const 常量断言：收窄为只读字面量元组
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number]; // 派生联合类型 "GET" | "POST" | "PUT" | "DELETE"

// 2. satisfies 运算符：既要校验结构契约，又要保留精确类型
type RouteConfig = {
  path: string;
  methods: HttpMethod[];
  timeoutMs?: number;
};

type AppRoutes = Record<string, RouteConfig>;

// 使用 satisfies：如果不符合 AppRoutes 会报错；但具体字段类型不会被抹平变宽
const routes = {
  health: {
    path: '/health',
    methods: ['GET'],
  },
  login: {
    path: '/api/auth/login',
    methods: ['POST'],
    timeoutMs: 5000,
  },
} satisfies AppRoutes;

function run(): void {
  console.log('=== satisfies 与 as const 实战演示 ===');

  // 1. 验证 as const 字面量推导
  console.log('1. as const 常量断言与字面量联合类型:');
  console.log(`   - 支持的方法总数: ${HTTP_METHODS.length}`);
  console.log(`   - 示例有效方法: ${HTTP_METHODS.join(', ')}`);

  // 2. 验证 satisfies 既做安全契约检查，又保留精准字段推断
  console.log('2. satisfies 契约校验与精准推断保留:');
  // routes.health 的 methods 精准保留为 ["GET"]，可以直接访问精确属性
  console.log(`   - 健康检查端点: ${routes.health.path} (允许: ${routes.health.methods[0]})`);
  // routes.login.timeoutMs 精准识别为 number 而非 number | undefined
  console.log(`   - 登录接口超时限制: ${routes.login.timeoutMs.toFixed(0)} ms`);

  // 3. 对比传统类型注解痛点说明
  console.log('3. 核心心智总结:');
  console.log('   - 传统类型注解 (const x: T = ...) 会导致类型变宽 (Type Widening)');
  console.log('   - 类型断言 (x as T) 会直接关闭类型检查 (危险，可能掩盖错误)');
  console.log('   - satisfies 运算符做到校验与精确推断兼得 (Best Practice)');
  console.log('======================================');
}

run();
