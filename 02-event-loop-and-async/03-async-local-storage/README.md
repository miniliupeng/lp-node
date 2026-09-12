# 03-async-local-storage: 异步上下文全链路追踪 (AsyncLocalStorage)

在分布式微服务架构中，当排查线上 Bug 时，我们最需要的是通过一个唯一的 `traceId` 串联起一次请求经历的所有数据库查询、RPC 调用和日志输出。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`AsyncLocalStorage` (ALS)**：Node.js 原生内置在 `node:async_hooks` 中的类。它允许你在跨越多个异步操作、Promise、回调函数的完整生命周期中，存储并共享同一份上下文数据，**完全不需要在每个函数中层层传递 `traceId` 或 `ctx` 参数**。

### 2. 为什么需要它？
- **痛点：参数透传地狱 (Prop Drilling)**：如果没有 ALS，要想在最深层的数据库持久化函数里打印请求的 `userId`，你必须在 Controller -> Service -> Model -> Repository 的每一个函数参数里都加上 `(..., traceId: string)`。一旦调用栈有几十层，代码极度臃肿恶心。
- **痛点：全局变量并发污染**：因为 Node.js 是单线程处理所有并发请求的，如果你用一个全局变量 `global.currentTraceId`，当请求 A 和请求 B 交替触发异步 I/O 时，变量会被瞬间覆盖，导致日志串单！ALS 基于执行上下文资源生命周期，确保**并发请求之间相互完全隔离**。

### 3. 日常工作中怎么用？
- 在 Web 中间件最外层通过 `storage.run({ traceId, user }, next)` 包裹整个请求链路；
- 统一日志类（Logger）内部直接调用 `storage.getStore()` 自动附带 `traceId`。

---

## 🔬 核心代码切片

```typescript
import { AsyncLocalStorage } from "node:async_hooks";

const als = new AsyncLocalStorage<{ traceId: string }>();

// 在中间件入口绑定上下文
als.run({ traceId: "req-12345" }, async () => {
  await doDeepDatabaseWork();
});

// 在深层任意函数中无参直接读取
async function doDeepDatabaseWork() {
  const store = als.getStore();
  console.log(`[${store?.traceId}] 正在执行数据库操作...`);
}
```

---

## 🖥️ 控制台预期输出快照

```text
=== AsyncLocalStorage 全链路追踪实战 ===
[请求 A: req-alpha] 进入控制器，开始处理
[请求 B: req-beta]  进入控制器，开始处理
[请求 A: req-alpha] -> 深入 Service 业务层执行 (自动获取 traceId)
[请求 B: req-beta]  -> 深入 Service 业务层执行 (自动获取 traceId)
[请求 A: req-alpha] -> 深入 DAO 持久层操作
[请求 B: req-beta]  -> 深入 DAO 持久层操作
✔ 验证通过: 两个并发异步请求的数据完全隔离，未发生任何全局串单污染！
========================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 02-event-loop-and-async/03-async-local-storage/main.ts
```
