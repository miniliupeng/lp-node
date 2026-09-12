# 03-worker-threads-cpu-bound: 工作线程并行计算与主线程防卡顿

Node.js 处理 I/O 密集任务如鱼得水，但如果需要在代码里对一张图片做滤镜处理、或者对几十万条数据做加密哈希，主线程的事件循环就会瞬间被卡死。**`worker_threads`** 让 Node.js 拥有了真正的 OS 级多线程能力。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`node:worker_threads`**：Node.js 原生多线程模块。
- **真·多线程架构**：每一个 Worker 线程运行在**同一个进程**中，但拥有自己**独立的 V8 隔离区（Isolate）、独立的上下文与事件循环**。
- **线程通信通信原语**：
  - `parentPort.postMessage()`：通过深拷贝克隆（结构化克隆算法）传递消息；
  - `SharedArrayBuffer`：多个线程直接共享同一块堆外连续内存，配合 `Atomics` 原子锁实现纳秒级零拷贝同步。

### 2. 为什么需要它？
- **解救主线程**：如果一个复杂的密码哈希计算耗时 2 秒，如果写在主线程，这 2 秒内整个服务器的所有其他 HTTP 请求都得原地排队等待；将计算任务扔到 Worker 线程，主线程事件循环依旧**丝滑运行，延迟为 0 毫秒**。

### 3. 日常工作中怎么用？
- 音视频/图片压缩、Excel 大报表复杂解析、PDF 渲染、密码学加密计算。

---

## 🔬 核心代码切片

```typescript
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";

if (isMainThread) {
  // 主线程派发重型任务给工作线程
  const worker = new Worker(import.meta.filename, { workerData: { n: 40 } });
  worker.on("message", (result) => console.log(`运算结果: ${result}`));
} else {
  // 工作线程独立运行，不占用主线程哪怕 1 毫秒
  const res = heavyCalculation(workerData.n);
  parentPort?.postMessage(res);
}
```

---

## 🖥️ 控制台预期输出快照

```text
=== worker_threads 多线程 CPU 密集计算实战 ===
1. 主线程 [TID: 主] 派发密集型 CPU 任务 (耗时运算) 给 Worker 线程...
2. 主线程同时执行非阻塞事件循环心跳:
   -> [主线程心跳 1] 事件循环完全未被阻塞，响应极速 (延迟 0ms)
   -> [主线程心跳 2] 事件循环完全未被阻塞，响应极速 (延迟 0ms)
3. Worker 线程计算完毕，通过 postMessage 回传结果:
   ✔ 收到密集计算结果: 832040 (主线程未发生任何卡顿)
==============================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 05-concurrency-and-processes/03-worker-threads-cpu-bound/main.ts
```
