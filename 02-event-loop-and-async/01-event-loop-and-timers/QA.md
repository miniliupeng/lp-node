# 大厂高频面试题精讲 (01-event-loop-and-timers)

---

### Q1: 请详述 Node.js 中由 libuv 驱动的事件循环（Event Loop）包含哪些主要阶段？

#### 🎯 面试官考点
- 对 Node.js 事件循环底层 6 大阶段的清晰脉络认知。

#### 💡 满分回答模板
事件循环按顺序循环进入以下 6 个阶段（宏任务阶段），每个阶段维护一个 FIFO 先入先出回调队列：
1. **Timers（定时器阶段）**：执行已经到期的 `setTimeout()` 和 `setInterval()` 的回调；
2. **Pending Callbacks（待定回调阶段）**：执行某些系统操作的回调（例如特定 TCP 错误报告，如 ECONNREFUSED）；
3. **Idle, Prepare（空闲与准备阶段）**：系统内部使用，开发者无需关心；
4. **Poll（轮询阶段）**：核心阶段！检索新的 I/O 事件；执行几乎所有的 I/O 相关回调（网络请求、文件读写等）；在此处阻塞等待连接；
5. **Check（检查阶段）**：专门供 `setImmediate()` 的回调在此阶段被触发；
6. **Close Callbacks（关闭回调阶段）**：执行 socket 或句柄的关闭回调（例如 `socket.on('close', ...)`）。

- **关键核心准则**：在**切换到下一个宏任务阶段前**，或者在**两个宏任务执行之间**，Node.js 都会强行插入并**彻底清空微任务队列（Microtask Queue）**。

---

### Q2: `process.nextTick()` 与 `Promise.then()` 谁先执行？为什么？如果递归调用 `process.nextTick()` 会造成什么后果？

#### 🎯 面试官考点
- 微任务内部优先级差异与 I/O 饥饿（Starvation）问题。

#### 💡 满分回答模板
1. **执行顺序**：`process.nextTick()` **绝对先于** `Promise.then()`。
2. **底层原理**：
   - 虽然两者都属于微任务，但在 Node.js 架构中，`process.nextTick()` 拥有自己独立的 `nextTickQueue`，是由 Node.js 宿主层独立维护的特权队列；
   - 而 `Promise.then()` 属于 V8 引擎原生的 `microtaskQueue`；
   - Node.js 规定：在当前同步调用栈清空后，**必须先清空整个 `nextTickQueue`，之后才会清空 `microtaskQueue`**。
3. **递归调用的危害（I/O 饥饿）**：
   - 如果无限递归调用 `process.nextTick()`，事件循环的主线程将永远被困在 `nextTickQueue` 中无法自拔，无法进入任何宏任务阶段，**导致后续所有的文件读写、网络连接、定时器彻底被饿死（Starved）**，整个服务器假死！

---

### Q3: 为什么在全局模块中运行 `setTimeout(fn, 0)` 和 `setImmediate(fn)`，它们的先后顺序是不确定的？如果放在 I/O 回调中又会怎样？

#### 🎯 面试官考点
- 操作系统的时钟精度（Clock Precision）与阶段流转的因果确定性。

#### 💡 满分回答模板
1. **全局环境下顺序不确定的原因**：
   - `setTimeout(fn, 0)` 在 Node.js 规范底层会被强制矫正为 `setTimeout(fn, 1)`（至少 1 毫秒延时）；
   - 当启动进程并初始化 libuv 事件循环时，准备耗时受机器当前 CPU 负载和操作系统时钟分辨率影响：
     - 如果事件循环启动耗时 **< 1ms**：进入 Timers 阶段时定时器还没到期，于是跳过 Timers，来到 Check 阶段先执行了 `setImmediate`；
     - 如果事件循环启动耗时 **>= 1ms**：进入 Timers 阶段时定时器已经到期，于是先执行了 `setTimeout`。
2. **在 I/O 回调中的绝对确定性**：
   - 如果把两者写在诸如 `fs.readFile` 的 I/O 回调内部：
   - 此时代码运行在 **Poll（轮询）阶段**。根据事件循环阶段流转顺序，Poll 阶段结束后**紧接着就是 Check 阶段**，而 Timers 阶段必须等到下一次大循环！
   - 因此在任何 I/O 回调中，**`setImmediate` 永远 100% 先于 `setTimeout` 执行**。
