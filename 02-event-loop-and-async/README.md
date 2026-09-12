# 阶段 02: 异步基石、事件循环与异常治理

Node.js 的核心优势在于其**单线程异步非阻塞 I/O** 架构，但这也是日常开发中最容易踩坑的领域。本阶段将系统剖析事件循环调度机制、异步异常防御、跨异步调用链上下文追踪以及系统级优雅停机。

---

## 💡 核心工程心智与异步原语

1. **libuv 事件循环与任务分级调度**：
   - 事件循环包含 Timers、Pending Callbacks、Idle/Prepare、Poll、Check、Close Callbacks 六大宏任务阶段；
   - 掌握微任务的特权执行时序：`process.nextTick` 队列优先级高于 V8 原生 `Promise.then` 微任务；
   - 在进入下一宏任务阶段或两个宏任务切换之间，Node.js 必须全量清空微任务队列。
2. **异步异常治理与并发容灾**：
   - 掌握同步 `try/catch` 无法捕获异步回调错误的根本原因（调用栈时空割裂）；
   - 实践 Go 语言风格的安全元组包装模式（Safe Await Pattern），消除深层嵌套；
   - 区分 `Promise.all`（全量成功/短路失败）与 `Promise.allSettled`（并发状态聚合与弱依赖局部降级）。
3. **AsyncLocalStorage (全链路异步上下文追踪)**：
   - 在单线程并发交错执行模型下，全局变量必发数据串单与状态污染；
   - 基于 Node.js 底层 `async_hooks` 机制，`AsyncLocalStorage` 在异步资源生命周期中自动传播上下文，实现跨深层调用栈隐式共享 `traceId` 与鉴权元信息。
4. **进程异常防御与优雅停机 (Graceful Shutdown)**：
   - `uncaughtException` 发生后表明 V8 堆状态已不可信，必须记录现场后主动自杀退出，严禁静默吞错；
   - 标准 4 步优雅停机编排：下线就绪探针 -> 等待在途请求收尾 -> 释放数据库/Redis 连接句柄 -> 安全平稳退出。

---

## 🗺️ 阶段专题导航

| 专题目录 | 核心原语 | 关键掌握目标 |
| :--- | :--- | :--- |
| **[01-event-loop-and-timers](./01-event-loop-and-timers)** | 事件循环与宏微任务顺序 | 实测 `nextTick`、`Promise`、`setTimeout`、`setImmediate` 的精准优先级 |
| **[02-async-await-error-handling](./02-async-await-error-handling)** | 异步异常与状态流转 | 掌握 `try/catch` 陷阱、Go 风格安全包装与 `Promise.allSettled` 容灾模式 |
| **[03-async-local-storage](./03-async-local-storage)** | 异步上下文全链路追踪 | 掌握 Node.js 原生 `AsyncLocalStorage` 实现分布式 TraceId 自动透传 |
| **[04-process-exit-and-uncaught](./04-process-exit-and-uncaught)** | 未捕获异常与优雅停机 | 掌握 `uncaughtException`、`unhandledRejection` 防御与 `SIGTERM` 资源清理 |

---

## 🚀 统一运行指令

```bash
make run-02
```
