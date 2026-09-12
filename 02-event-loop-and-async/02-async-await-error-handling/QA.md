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

---

### Q4: 生产环境中如果有 10,000 个异步任务需要执行，直接使用 `Promise.all()` 会导致系统崩溃（连接池耗尽/OOM），如何手写一个支持最大并发度限制的异步调度器（Promise Concurrency Pool / p-limit）？

#### 🎯 面试官考点
- 考察大厂高频手写场景题：高并发任务池、资源背压控制与连接池保护。
- 考察对异步队列（Queue）、并发计数器（Active Count）与 Promise 闭包链式决议的精细把控。
- 能够手写出工业级、无第三方依赖、具备通用泛型约束的并发限制函数。

#### 💡 满分回答模板
1. **直接使用 `Promise.all` 的致命缺陷**：
   - `Promise.all(tasks.map(t => t()))` 会在**瞬间同时发起全部 10,000 个异步请求**。这会导致操作系统的文件描述符（FD）或网络套接字句柄瞬间耗尽（报 `EMFILE` / `ECONNRESET`），甚至让数据库连接池被直接打满瘫痪，或者因创建过多中间 Promise 对象引发 V8 堆内存溢出（OOM）。
2. **手写核心设计思想（滑动窗口 / 任务队列模型）**：
   - 维护一个内部等待队列 `queue` 和当前正在执行的任务计数器 `activeCount`；
   - 每次提交任务时返回一个新的 Promise。当 `activeCount < limit` 时立即出队执行；否则挂起该任务等待空闲；
   - 每个任务执行完毕（无论成功 Resolve 还是失败 Reject），`activeCount--` 并立即唤醒队列中的下一个任务执行（通过调用闭包保存的 `resolve` 触发下游运行）。
3. **极简且健壮的手写实现（精简企业级版本）**：
   ```typescript
   export function pLimit(concurrency: number) {
     if (concurrency < 1) throw new TypeError("并发度必须大于等于 1");
     const queue: Array<() => void> = [];
     let activeCount = 0;

     const next = () => {
       activeCount--;
       if (queue.length > 0) {
         const runNext = queue.shift();
         runNext?.();
       }
     };

     const run = async <T>(
       fn: () => Promise<T>,
       resolve: (val: T) => void,
       reject: (err: unknown) => void
     ) => {
       activeCount++;
       try {
         const result = await fn();
         resolve(result);
       } catch (err) {
         reject(err);
       } finally {
         next();
       }
     };

     return <T>(fn: () => Promise<T>): Promise<T> => {
       return new Promise<T>((resolve, reject) => {
         if (activeCount < concurrency) {
           void run(fn, resolve, reject);
         } else {
           queue.push(() => void run(fn, resolve, reject));
         }
       });
     };
   }
   ```
4. **工业生产选型与防坑指南**：
   - 生产环境中建议直接使用经过社区上亿次下载验证的开源库 `p-limit` 或 `p-queue`；
   - 必须在 `finally` 块中调用 `next()`，确保即便任务抛出异常，并发槽位也能被立即释放，防止队列死锁；
   - 对于超长生命周期或海量任务队列，需注意队列本身的内存占用，必要时应结合“背压（Backpressure）”阻止上游继续无休止地向内存队列塞入新任务。
