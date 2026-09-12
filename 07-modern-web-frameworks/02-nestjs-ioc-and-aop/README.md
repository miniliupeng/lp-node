# 02-nestjs-ioc-and-aop: NestJS 核心思想：依赖注入 (IoC) 与面向切面 (AOP)

**NestJS** 之所以能在企业级复杂大单体和中大型微服务架构中大获成功，核心在于它将传统服务端（如 Java Spring）成熟的 **IoC（控制反转）/ DI（依赖注入）** 与 **AOP（面向切面编程）** 思想完美带入了 TypeScript 世界。

---

## 💡 核心原理三段式

### 1. 是什么？
- **IoC (Inversion of Control, 控制反转)**：把对象的创建、组装和生命周期管理从业务类自身手中剥离，转交给统一的**中央 IoC 容器**托管。
- **DI (Dependency Injection, 依赖注入)**：业务类只需在构造函数中声明“我需要什么接口”，IoC 容器在实例化该类时会自动将其实例化并“注入”给它。
- **AOP (Aspect-Oriented Programming, 面向切面编程)**：把跨越多个业务模块的横切关注点（如日志耗时统计、权限守卫 Guard、异常过滤 Filter、入参管道 Pipe）抽离为独立切面，在不侵入业务方法源码的前提下动态织入执行。

### 2. 为什么需要它？
- **告别紧耦合与巨型工厂**：如果不用 IoC，类 A 内部 `new B()`，类 B 内部 `new C()`。当要给 C 加一个参数时，从底到顶所有代码全得改，单测 Mock 也寸步难行；有了 IoC，解耦为面向接口编程，随时可以替换实现（如本地 MockDB 替换生产 RealDB）。

### 3. 日常工作中怎么用？
- 理解 NestJS 中 `@Injectable()`、`@Module()`、`Guards` 与 `Interceptors` 的底层心智。

---

## 🔬 核心代码切片 (极简 30 行自研 IoC 容器)

```typescript
class SimpleContainer {
  private services = new Map<string, any>();

  register(token: string, instance: any) {
    this.services.set(token, instance);
  }

  resolve<T>(token: string): T {
    const inst = this.services.get(token);
    if (!inst) throw new Error(`未找到服务: ${token}`);
    return inst;
  }
}
```

---

## 🖥️ 控制台预期输出快照

```text
=== NestJS 核心思想 IoC 与 AOP 实战 ===
1. IoC 容器实例化与依赖装配 (Dependency Injection):
   ✔ 容器注册服务: DatabaseService
   ✔ 容器解析并实例化 UserService (自动注入 DatabaseService)
2. 面向切面 AOP (横向方法拦截器 Interceptor):
   [AOP 前置拦截]: 开始执行目标方法 UserService.createUser
   -> 执行核心数据库操作: 写入用户 "Alex"
   [AOP 后置拦截]: 目标方法执行完毕，总耗时: 12 ms
3. 业务调用成功兑现: {"id":"usr_1","name":"Alex"}
======================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 07-modern-web-frameworks/02-nestjs-ioc-and-aop/main.ts
```
