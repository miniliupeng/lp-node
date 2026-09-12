/**
 * 02-nestjs-ioc-and-aop
 * 演示 NestJS 核心思想：轻量依赖注入容器 (IoC / DI) 与面向切面拦截器 (AOP)
 */

// 1. 核心依赖注入 (IoC) 容器实现
class MiniContainer {
  private registry = new Map<string, unknown>();

  // 注册单例服务实例
  register<T>(token: string, instance: T): void {
    this.registry.set(token, instance);
  }

  // 解析并获取依赖
  resolve<T>(token: string): T {
    const service = this.registry.get(token);
    if (!service) throw new Error(`[IoC] 未找到注册的服务: ${token}`);
    return service as T;
  }
}

// 2. 业务服务定义 (解耦松散)
class DatabaseService {
  async insertRecord(table: string, data: Record<string, unknown>): Promise<string> {
    await new Promise((r) => setTimeout(r, 10)); // 模拟 I/O 耗时
    return `[DB] 成功插入 ${table}: ${JSON.stringify(data)}`;
  }
}

class UserService {
  // 通过构造函数依赖注入底层数据库服务 (面向抽象与接口，非 hardcode new)
  constructor(private db: DatabaseService) {}

  async createUser(name: string): Promise<string> {
    return await this.db.insertRecord('users', { name, createdAt: Date.now() });
  }
}

// 3. AOP 切面：方法执行耗时与日志拦截器包装函数 (Interceptor)
function withLoggingAspect<Args extends unknown[], ReturnType>(
  methodName: string,
  fn: (...args: Args) => Promise<ReturnType>
): (...args: Args) => Promise<ReturnType> {
  return async (...args: Args) => {
    console.log(`  [AOP 前置通知]: 即将调用方法 [${methodName}], 入参: ${JSON.stringify(args)}`);
    const start = performance.now();
    const result = await fn(...args);
    const duration = (performance.now() - start).toFixed(2);
    console.log(`  [AOP 后置通知]: 方法 [${methodName}] 执行完成, 耗时: ${duration}ms`);
    return result;
  };
}

async function run(): Promise<void> {
  console.log('=== NestJS 核心思想 IoC 与 AOP 实战 ===');

  // 1. IoC 容器自动化装配阶段
  const container = new MiniContainer();
  container.register('DatabaseService', new DatabaseService());

  // 构造器注入：从容器中取出 DatabaseService 传给 UserService
  const dbInstance = container.resolve<DatabaseService>('DatabaseService');
  const userService = new UserService(dbInstance);
  container.register('UserService', userService);
  console.log('1. IoC 容器完成服务注册与依赖装配 (Dependency Injection 成功)');

  // 2. AOP 切面拦截执行阶段
  console.log('2. 演示 AOP 横切拦截器 (零业务侵入记录耗时):');
  // 使用拦截器动态增强 UserService 的 createUser 方法
  const interceptedCreateUser = withLoggingAspect(
    'UserService.createUser',
    userService.createUser.bind(userService)
  );

  const result = await interceptedCreateUser('Alexander');
  console.log(`3. 业务最终返回: ${result}`);
  console.log('======================================');
}

await run();
