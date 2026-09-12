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
