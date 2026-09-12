# 大厂高频面试题精讲 (02-nestjs-ioc-and-aop)

---

### Q1: 什么是控制反转（IoC）与依赖注入（DI）？它们为什么能让大型项目的单元测试效率提升数倍？

#### 🎯 面试官考点
- 面向对象设计原则（SOLID 之 DIP 依赖倒置原则）与单元测试 Mock 解耦。

#### 💡 满分回答模板
1. **控制反转（IoC, Inversion of Control）**：
   - 传统编程中，由对象自己主动通过 `new DatabaseService()` 来创建自己需要的底层依赖；
   - 控制反转是指：**把创建和管理对象的“控制权”反转交给外部容器（IoC Container）**。对象只需声明“我需要什么”，至于这个对象何时被实例化、是单例还是多例，完全由容器说了算。
2. **依赖注入（DI, Dependency Injection）**：
   - IoC 的具体实现方式。通常通过**构造函数（Constructor Injection）**将依赖实例传递给目标对象。
3. **极大提升单元测试能力**：
   - 如果类内部写死了 `this.db = new MySQLDatabase()`，写单测时就必须连真实的 MySQL 数据库，网络超时或脏数据会导致单测极不稳定且运行缓慢；
   - 依赖注入模式下，类只依赖抽象接口。在单元测试中，我们可以直接 `new UserService(new MockInMemoryDB())`，把数据库操作全变成内存 Mock，不仅不需要外部数据库环境，而且单测执行速度高达数百微秒！

---

### Q2: NestJS 中的 `@Injectable()` 装饰器底层原理是什么？它是如何自动知道构造函数需要注入哪个类的？

#### 🎯 面试官考点
- TypeScript 的装饰器元数据（`reflect-metadata`）与设计模式在编译期的映射。

#### 💡 满分回答模板
1. **`reflect-metadata` 反射元数据标准**：
   - 当在 `tsconfig.json` 中开启 `"emitDecoratorMetadata": true` 和 `"experimentalDecorators": true` 时，TypeScript 编译器在转译被装饰器修饰的 Class 时，会悄悄向该 Class 注入编译期元数据。
2. **构造函数参数类型提取**：
   - 编译器会通过 `Reflect.defineMetadata("design:paramtypes", [DatabaseService], UserService)` 将构造函数入参的**真实类构造函数引用**挂载在类的元数据上。
3. **`@Injectable()` 的作用**：
   - 它本身是一个空标记函数，核心目的是**触发 TypeScript 编译器为该类生成上述的 `design:paramtypes` 元数据**。
   - 当 NestJS 启动时，IoC 容器通过 `Reflect.getMetadata("design:paramtypes", UserService)` 读取出它需要 `DatabaseService`，随后递归检查容器内是否已有 `DatabaseService` 实例，若有则直接传入并完成自动实例化。

---

### Q3: 请详述 NestJS 一次请求完整经过的 5 大切面组件流转顺序（Request Lifecycle Pipeline）。

#### 🎯 面试官考点
- NestJS 核心架构生命周期（Middleware -> Guard -> Interceptor -> Pipe -> Controller -> Interceptor -> Filter）。

#### 💡 满分回答模板
一次 HTTP 请求按顺序流经以下 7 个阶段：
1. **Middlewares（中间件）**：最外层（等同于 Express/Fastify 中间件），适合做基础访问日志打点、CORS、Body 解析；
2. **Guards（守卫）**：单一职责！只做**权限与鉴权判断**（如 JWT 验证、角色 RBAC 校验），返回 `true` 放行，返回 `false` 直接抛出 403 Forbidden；
3. **Interceptors (Pre)（拦截器前置）**：在业务执行前绑定额外逻辑（如启动方法计时器、变更请求上下文）；
4. **Pipes（管道）**：单一职责！只做**入参数据校验与类型转换**（如使用 ZodValidationPipe 校验 DTO 合法性、将字符串 ID 转为整型数字）；
5. **Controller & Service（控制器与业务方法）**：真正执行业务逻辑并返回结果；
6. **Interceptors (Post)（拦截器后置，RxJS 流）**：接收到 Controller 返回的响应数据，在此处进行数据格式包装（如统一封装为 `{ code: 200, data, message: 'ok' }`）、或者完成耗时统计日志；
7. **Exception Filters（异常过滤器）**：全局异常最终安全网！如果在上述任何环节发生抛错，未处理异常都会掉入 Filter，由其格式化为规范的错误响应返回给前端。
