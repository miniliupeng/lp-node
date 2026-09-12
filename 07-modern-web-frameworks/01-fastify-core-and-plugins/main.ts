/**
 * 01-fastify-core-and-plugins
 * 演示 Fastify 核心设计哲学：插件注册 (register)、装饰器 (decorate) 与作用域封装隔离 (Encapsulation)
 */

type PluginFn = (scope: FastifyScope) => Promise<void> | void;

// 模拟 Fastify 核心作用域容器
class FastifyScope {
  public decorators: Map<string, unknown>;
  public hooks: string[];

  constructor(parent?: FastifyScope) {
    // 继承父级的 decorators 与 hooks (原型链/浅复制思想)
    this.decorators = new Map(parent?.decorators ?? []);
    this.hooks = [...(parent?.hooks ?? [])];
  }

  // 扩展作用域属性
  decorate(key: string, value: unknown): this {
    this.decorators.set(key, value);
    return this;
  }

  // 注册生命周期钩子
  addHook(hookName: string): this {
    this.hooks.push(hookName);
    return this;
  }

  // 注册插件并生成新的子作用域 (Encapsulation 核心)
  async register(plugin: PluginFn): Promise<void> {
    const childScope = new FastifyScope(this);
    await plugin(childScope);
  }
}

async function run(): Promise<void> {
  console.log('=== Fastify 核心思想与插件作用域实战 ===');

  const app = new FastifyScope();

  // 1. 全局根插件：挂载全局共享的数据库连接装饰器
  app.decorate('dbClient', 'PostgresConnectionPool');
  app.addHook('onRequest:GlobalLogger');
  console.log('1. 根作用域注册全局装饰与钩子: dbClient, onRequest:GlobalLogger');

  // 2. 注册业务子插件 (模拟 fastify.register)
  await app.register(async (authScope) => {
    console.log('2. 进入子插件 AuthScope (自动继承父级能力):');
    console.log(`   - 成功继承全局 dbClient: ${String(authScope.decorators.get('dbClient'))}`);

    // 子插件新增私有装饰器与局部中间件钩子
    authScope.decorate('jwtSecret', 'shhh_secret_key');
    authScope.addHook('preHandler:VerifyToken');

    console.log(`   - 子插件私有装饰器挂载成功: jwtSecret`);
    console.log(`   - 子插件当前累计生效钩子: [${authScope.hooks.join(', ')}]`);
  });

  // 3. 验证作用域隔离 (Encapsulation 隔离守卫)
  console.log('3. 验证 Fastify 核心作用域封装隔离性:');
  const hasJwtInRoot = app.decorators.has('jwtSecret');
  console.log(
    `   - 根作用域是否被子插件的 jwtSecret 污染: ${hasJwtInRoot ? '是' : '否 (完美隔离!)'}`
  );
  console.log(`   - 根作用域钩子保持独立: [${app.hooks.join(', ')}]`);

  console.log('=======================================');
}

await run();
