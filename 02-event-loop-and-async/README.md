# 阶段 02: 异步基石、事件循环与异常治理

Node.js 最强大的武器是其**单线程异步非阻塞 I/O**，但这也是无数初学者甚至工作数年的工程师最容易踩坑的重灾区。本阶段我们将通过可运行的代码，把事件循环执行顺序、异步错误兜底、跨异步链路追踪和进程优雅停机全部吃透。

---

## ☕ 生活化心智：超级咖啡师与工单系统

1. **事件循环 (Event Loop)**：
   - 就像店里唯一的**特级咖啡师**（主线程）。他绝对不会站在热水壶前傻等 3 分钟（非阻塞）。
   - 他按下烧水开关后，立即接下一位客人的单。水烧开的提示音（I/O 完成通知）会排入待办工单板，等待咖啡师手头工作一停就立即处理。
   - **微任务 (`process.nextTick`, `Promise.then`)** 就像咖啡师脑中的“加急私信”，在去工单板拿下一个新大单前，必须先把加急私信全部清空！
2. **异步错误治理**：
   - 异步报错如果没用 `try/catch` 接住，就像一杯打翻在主控台的热咖啡，会导致整台机器直接短路断电（整个 Node.js 进程奔溃闪退）。
3. **AsyncLocalStorage (异步本地存储)**：
   - 就像给每位客人的咖啡杯贴上独一无二的**条形码 (Trace ID)**。无论这杯咖啡经过研磨、冲泡、拉花哪道异步工序，咖啡师只要扫一下杯子，就能知道它属于哪位客人，绝不会串单。
4. **优雅下线 (Graceful Shutdown)**：
   - 晚上打烊时（收到 `SIGTERM` 信号），不是直接拉闸关电，而是挂上“停止排队”招牌，把手头正在做的最后几杯咖啡做完，清洗完机器后再平稳关门。

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
