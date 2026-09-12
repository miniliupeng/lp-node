# 01-event-loop-and-timers: 事件循环宏微任务执行顺序实战验证

Node.js 的事件循环是由 **libuv** 驱动的循环机制。它是所有异步定时器、I/O 回调和微任务的调度中心。

---

## 💡 核心原理三段式

### 1. 是什么？
- **微任务队列 (Microtasks Queue)**：
  - `process.nextTick()`：优先级最高，在当前同步任务执行完毕后、任何其他微任务之前立即清空。
  - `Promise.then()` / `queueMicrotask()`：在 `nextTick` 队列清空后紧接着执行。
- **宏任务阶段 (Macrotasks Phases in libuv)**：
  - **Timers 阶段**：处理 `setTimeout()` 与 `setInterval()` 回调。
  - **Poll / I/O 阶段**：处理大部分系统 I/O、网络请求回调。
  - **Check 阶段**：专供 `setImmediate()` 执行。

### 2. 为什么需要搞透它？
- 避免写出**饥饿现象（Starvation）**：如果在 `process.nextTick` 中递归调用自身，事件循环会陷入微任务死循环，导致网络请求和定时器永远无法被调度！
- 彻底搞懂面试必考的“代码执行输出顺序”，建立确定性心智。

### 3. 日常工作中怎么用？
- 需要在当前调用栈结束后、I/O 发生前做清理或发布事件时用 `process.nextTick`；
- 希望让出主线程给 I/O 处理、在下一次轮询阶段再执行计算时用 `setImmediate`。

---

## 🔬 核心代码切片

```typescript
console.log("1. 同步开始");
setTimeout(() => console.log("4. 宏任务: setTimeout"), 0);
setImmediate(() => console.log("5. 宏任务: setImmediate"));
Promise.resolve().then(() => console.log("3. 微任务: Promise.then"));
process.nextTick(() => console.log("2. 特权微任务: process.nextTick"));
```

---

## 🖥️ 控制台预期输出快照

```text
=== Node.js 事件循环时序实测 ===
[1] 同步代码最先执行
[2] process.nextTick 抢占首发微任务
[3] Promise.then 紧随其后微任务
[4] setTimeout(0) 宏任务定时器阶段
[5] setImmediate 宏任务 Check 阶段
================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 02-event-loop-and-async/01-event-loop-and-timers/main.ts
```
