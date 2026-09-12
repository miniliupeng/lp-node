# 大厂高频面试题精讲 (02-async-await-error-handling)

---

### Q1: 为什么在 setTimeout 等回调中抛出的错误，外部包了一层 `try/catch` 却根本抓不到？

#### 🎯 面试官考点
- 调用栈（Call Stack）与事件循环的时空割裂。

#### 💡 满分回答模板
1. **时空割裂原理**：
   - 同步 `try/catch` 只能捕获**当前同步调用栈正在执行期间**抛出的同步异常。
   - 当执行到 `setTimeout(fn, 100)` 时，Node.js 只是将定时器注册到底层系统，主线程的同步调用栈随后立即出栈并执行完毕，`try/catch` 块已经彻底退出历史舞台！
   - 100 毫秒后定时器到期，libuv 将回调推入新的事件循环并重新创建一个崭新的独立调用栈执行。此时原始的 `try/catch` 早已不复存在，因此该错误会直接上升为进程级的未捕获异常。
2. **正确解法**：
   - 必须在异步回调内部直接进行 `try/catch`，或者将其封装为 Promise 并通过 `reject(err)` 冒泡。

---

### Q2: 请横向对比 `Promise.all`、`Promise.allSettled`、`Promise.race` 与 `Promise.any` 的异同与业务选型。

#### 🎯 面试官考点
- Promise 4 大并发控制组合子的行为差异与高可用架构容灾策略。

#### 💡 满分回答模板
| 方法 | 成功条件 (Resolve) | 失败条件 (Reject) | 典型应用场景 |
| :--- | :--- | :--- | :--- |
| **`Promise.all`** | **全部成功**才成功（返回结果数组） | **只要有一个失败立即 Reject**（短路原则） | 强依赖事务：多个接口必须全部成功才能继续后续业务 |
| **`Promise.allSettled`** | **永远成功**（等待全部执行完毕，输出每个状态） | **永不 Reject** | 弱依赖聚合：批量拉取多个模块，允许个别失败并执行局部降级兜底 |
| **`Promise.race`** | **第一个敲定（无论成功还是失败）** | 同左（第一个敲定） | 请求超时熔断控制（业务请求与超时定时器赛跑） |
| **`Promise.any`** | **只要有一个成功立即 Resolve** | **全部失败才 Reject**（抛出 AggregateError） | 多机房/多 CDN 测速拉取：谁最快成功用谁 |

---

### Q3: 如果一个 Promise 发生了 reject 但代码中没有写 `.catch()`，现代 Node.js 会有什么表现？生产环境如何治理？

#### 🎯 面试官考点
- `unhandledRejection` 的历史演进与企业级生产稳定保障。

#### 💡 满分回答模板
1. **运行时的默认行为演进**：
   - **Node 14 之前**：只在控制台输出黄色警告 `UnhandledPromiseRejectionWarning`，进程继续运行（极度危险，可能导致状态不一致或静默吞错）；
   - **Node 15+ 至今**：默认行为改为 **`throw-mode`**，只要出现未处理的 Promise Rejection，Node.js 会直接抛出异常并**直接终止整个进程（退出码为 1）**！
2. **企业级生产治理铁律**：
   - **防御性监听**：在进程入口全局注册 `process.on('unhandledRejection', (reason, promise) => { ... })` 进行监控打点和日志上报；
   - **规范代码审查**：配置 ESLint 规则 `@typescript-eslint/no-floating-promises`，在静态代码检查期强制要求每个返回 Promise 的函数调用必须被 `await`、`.catch()` 或 `void` 显式标记。
