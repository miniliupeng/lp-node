# 大厂高频面试题精讲 (01-fastify-core-and-plugins)

---

### Q1: 为什么 Fastify 在业界吞吐量基准测试中比传统的 Express 快 2~5 倍？底层做了哪些极致的性能优化？

#### 🎯 面试官考点
- 现代 Web 框架底层性能工程：路由查找算法、JIT 编译 JSON 序列化与对象内存分配。

#### 💡 满分回答模板
Fastify 的极速吞吐来自四大底层工程优化：
1. **高效的基数树路由匹配（Radix Tree / Prefix Tree via `find-my-way`）**：
   - Express 采用线性扫描和正则表达式（RegExp）对每条注册路由逐个比对，复杂度为 $O(N)$，路由越多越慢；
   - Fastify 采用前缀压缩基数树，查找路径复杂度仅与 URL 字符长度相关（$O(K)$），即使项目有上千条路由也能在纳秒级完成精准分发。
2. **JIT 编译极速 JSON 序列化（`fast-json-stringify`）**：
   - 传统 `JSON.stringify()` 需要在运行时动态探测对象的每个属性、类型和原型链，开销极大；
   - Fastify 强制推崇结合 JSON Schema。在服务启动时，它根据 Schema **预先动态生成一段纯粹的字符串拼接 JavaScript 代码并进行 V8 JIT 优化**，跳过所有类型探测，序列化速度提升 2~3 倍！
3. **极少中间件对象分配（Zero Garbage Collection Overhead）**：
   - Fastify 复用请求上下文句柄，避免像 Express 那样为每次请求动态 `new` 大量临时匿名闭包和上下文对象，大幅降低了 V8 垃圾回收（GC）暂停频率。

---

### Q2: 什么是 Fastify 的“插件作用域封装（Encapsulation）”机制？如果想让子插件注册的数据库连接被全局共享，应该怎么做？

#### 🎯 面试官考点
- 插件上下文树（Context Tree）、作用域继承与 `fastify-plugin` 打破封装机制。

#### 💡 满分回答模板
1. **默认的封装隔离机制（Encapsulation）**：
   - 在 Fastify 中，每次通过 `fastify.register()` 注册一个插件，框架就会自动派生出一个崭新的**子上下文（Child Context）**；
   - **单向继承**：子作用域可以访问父级的装饰器（`decorate`）和钩子（`addHook`）；但在子作用域内添加的装饰器、钩子和路由**绝不会反向污染外层父级或其他平行的兄弟插件**。这保证了不同团队开发的不同业务模块（如 `/users` 与 `/orders`）之间完全隔离、互不干扰。
2. **打破封装：使用 `fastify-plugin`（`fp`）**：
   - 如果你编写的是一个基础公共插件（例如：全局数据库连接池、Redis 客户端、全局认证中间件），希望它装饰的属性能够在全局整个应用中通用；
   - 解决方案：使用官方包 `fastify-plugin` 将插件函数包裹导出：
     ```typescript
     import fp from "fastify-plugin";

     export default fp(async (fastify) => {
       fastify.decorate("db", new DatabaseConnection());
     });
     ```
   - 框架检测到 `fp` 标记后，会**跳过创建子上下文**，直接将属性提升并挂载到调用它的父级乃至根作用域中。

---

### Q3: 请详述 Fastify 一次完整的 HTTP 请求生命周期钩子（Lifecycle Hooks）的执行顺序。

#### 🎯 面试官考点
- 请求生命周期管控、认证拦截切入点与容错拦截机制。

#### 💡 满分回答模板
按执行时序流转如下（标准链路）：
1. **`onRequest`**：请求到达的第一时间触发。此时尚未解析 HTTP Body，适合做全局 TraceId 注入、简单的 IP 黑名单封禁、跨域 CORS 处理；
2. **`preParsing`**：在开始解析 Request Body 数据流之前触发；
3. **`preValidation`**：在根据路由 JSON Schema 校验入参之前触发。适合在此对原始入参做预处理或数据格式修补；
4. **`preHandler`（最常用的业务中间件切入点！）**：数据校验已完全通过。此时执行具体的业务鉴权、用户登录态解析、权限 RBAC 校验；
5. **`preSerialization`**：Controller 业务处理完毕返回结果后、在被序列化为 JSON 字符串之前触发；
6. **`onError`**：在上述任何一个环节发生抛错时触发（用于统一收集错误并格式化返回）；
7. **`onResponse`**：响应已经完全发送给客户端后触发（用于记录请求耗时 Access Log、打点上报）。

---

### Q4: 请对比 Express 线性中间件模型与 Koa 洋葱模型的底层执行机制。为什么洋葱模型适合做耗时统计与异常兜底？如何手写一个简化版的 Koa `compose` 函数？

#### 🎯 面试官考点
- 考察对 Node.js 经典 Web 框架演进史与核心中间件调度算法的掌握。
- 对比 Express 单向调用与 Koa 双向环形洋葱调用（Onion Model）的执行时序。
- 考察手写递归与 Promise 链式包装的核心能力（`koa-compose` 原理）。

#### 💡 满分回答模板
1. **Express 线性模型 vs Koa 洋葱模型本质对比**：
   - **Express（单向瀑布流水线）**：中间件通过回调 `next()` 单向推进，控制权一旦移交下游，上游中间件无法在下游执行完毕后“原路折返”继续执行后置代码（除非在全局监听 `res.on("finish")`，但此时上下文栈已丢失）。异步代码中的未捕获异常很容易导致请求挂起或丢失上下文。
   - **Koa（双向嵌套洋葱模型）**：基于 `async/await`。每个中间件以 `await next()` 为分水岭，前半段为请求前置处理，进入下游中间件链；当下游所有中间件全部执行完毕后，执行权会**像剥洋葱一样原路折返回到当前中间件**，继续执行后置处理逻辑。
2. **为什么洋葱模型天生适合“耗时统计”与“全局异常兜底”？**：
   - **耗时统计**：在前置记录 `start = Date.now()`，接着 `await next()`，折返后直接计算 `Date.now() - start`，代码逻辑自然闭合；
   - **统一异常兜底**：最外层中间件只需一个简单的 `try { await next(); } catch (err) { ... }`，就能天然捕获下游整条中间件链及路由处理器中抛出的所有同步与异步异常，做到 100% 不漏错。
3. **极简且核心的 Koa `compose` 手写实现**：
   ```typescript
   type Middleware<T = unknown> = (
     context: T,
     next: () => Promise<void>
   ) => Promise<void>;

   export function compose<T>(middlewares: Middleware<T>[]) {
     return function (context: T): Promise<void> {
       let index = -1;

       function dispatch(i: number): Promise<void> {
         // 防止在同一个中间件中多次调用 next()
         if (i <= index) {
           return Promise.reject(new Error("next() called multiple times"));
         }
         index = i;

         const fn = middlewares[i];
         if (!fn) return Promise.resolve(); // 到底部自然 resolve

         try {
           // 递归构造下游 Promise 链
           return Promise.resolve(fn(context, () => dispatch(i + 1)));
         } catch (err) {
           return Promise.reject(err);
         }
       }

       return dispatch(0);
     };
   }
   ```
4. **Fastify 的差异化路线**：
   - Fastify 没有照搬洋葱模型，而是采用了更清晰的**细粒度生命周期钩子（Lifecycle Hooks）**配合**前缀树路由分发**，在保证可扩展性的同时彻底榨干了 V8 运行时的性能极限。
