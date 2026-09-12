# 阶段 07: 现代后端框架实战入门

从早期简陋的 Express / Koa，到现代以极致性能著称的 **Fastify**，再到以企业级架构和设计模式为核心的 **NestJS**，Node.js 框架生态已经全面走向工业化与规范化。本阶段我们将剖析这两大现代主流框架的核心底层架构。

---

## 💡 核心工程心智与框架设计哲学

1. **Fastify 性能架构与插件上下文封装 (Encapsulation)**：
   - 掌握 Fastify 极速吞吐的基石：基于前缀压缩基数树的 `find-my-way` 路由查找，以及基于 JSON Schema 预编译纯字符串拼接的 `fast-json-stringify` 序列化；
   - 深入掌握 Fastify 插件上下文树（Context Tree）模型：单向继承父级能力，默认隔离子级属性，杜绝全局状态污染；
   - 掌握使用 `fastify-plugin`（`fp`）跳过子作用域创建以实现公共基础设施全局提升。
2. **NestJS 架构模式：控制反转 (IoC) 与面向切面 (AOP)**：
   - 掌握控制反转容器（IoC Container）与构造器依赖注入（DI），实现业务类与底层实现的彻底解耦与单元测试极速 Mock；
   - 掌握 TypeScript 装饰器元数据（`reflect-metadata`）在 `@Injectable()` 中的编译期类型提取机制；
   - 深入理解 NestJS 七层请求管道流转：Middleware -> Guard -> Interceptor (Pre) -> Pipe -> Controller -> Interceptor (Post) -> Exception Filter。

---

## 🗺️ 阶段专题导航

| 专题目录 | 核心原语 | 关键掌握目标 |
| :--- | :--- | :--- |
| **[01-fastify-core-and-plugins](./01-fastify-core-and-plugins)** | Fastify 核心与插件封装思想 | 掌握 Fastify 插件上下文作用域隔离（Encapsulation）与生命周期钩子体系 |
| **[02-nestjs-ioc-and-aop](./02-nestjs-ioc-and-aop)** | 依赖注入 (IoC) 与面向切面 (AOP) | 掌握控制反转容器、构造器注入与切面拦截器（Interceptor）底层心智 |

---

## 🚀 统一运行指令

```bash
make run-07
```
