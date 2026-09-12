# 03-streams-and-backpressure: 流式传输与背压控制深入剖析

在处理 GB 级别的超大文件传输时，如果使用 `fs.readFile()` 一次性读入内存，Node.js 进程会瞬间因为内存耗尽而崩溃。**Stream（流）**让我们可以像流水一样“按需分块（Chunk）”处理数据。

---

## 💡 核心原理三段式

### 1. 是什么？
- **Stream（流）**：Node.js 处理流式数据的抽象接口，分为 Readable（可读）、Writable（可写）、Duplex（双工）、Transform（转换）四种。
- **背压 (Backpressure)**：当数据**读取速度远远大于写入/消费速度**时，用来阻止中间内存缓冲区被撑爆的流量调控反馈机制。
- **关键信号**：
  - 当可写流的内部缓冲队列达到 `highWaterMark` 水位线时，`writer.write(chunk)` 会返回 **`false`**（通知上游暂停供水）；
  - 当下游把缓冲区的数据全部消化排空后，会触发 **`drain`** 事件（通知上游可以恢复读取）。

### 2. 为什么需要搞透它？
- **告别内存 OOM 崩溃**：想象一个千兆网卡不断收到网络数据包，而下游写入慢速机械硬盘。如果没有背压，未写入的数据只能无限堆积在 Node.js 内存堆中，几秒钟就能吞掉 4GB 内存导致进程崩溃。
- **为什么旧版 `.pipe()` 被淘汰**：旧版 `readable.pipe(writable)` **不会自动转发和处理错误**。如果下游写入流抛出错误，上游可读流不会被销毁，导致底层文件句柄（File Descriptor）永久泄漏！现代最佳实践必须全量使用 **`pipeline`**。

### 3. 日常工作中怎么用？
- 大文件上传下载、日志压缩、ETL 数据同步使用 `pipeline` 组合流管道。

---

## 🔬 核心代码切片

```typescript
import { pipeline } from "node:stream/promises";
import { createReadStream, createWriteStream } from "node:fs";

// 生产级管道：全生命周期托管与自动安全销毁
await pipeline(
  createReadStream("source.mp4"),
  createWriteStream("destination.mp4")
);
```

---

## 🖥️ 控制台预期输出快照

```text
=== Stream 背压 (Backpressure) 原理实战 ===
1. 观察底层背压信号机制 (highWaterMark = 16 字节):
   -> 写入 Chunk 1 (10 字节) -> 缓冲区尚宽裕 (write 返回: true)
   -> 写入 Chunk 2 (10 字节) -> 超过 16 字节水位线！(write 返回: false, 触发背压!)
   -> 上游暂停生产，等待下游消费排空...
   ✔ 下游缓冲区消化完毕，触发 'drain' 事件！通知上游恢复供水
2. 现代 stream/promises 的 pipeline 管道传输验证:
   ✔ 管道自动处理流动、背压与异常关闭，总共流转 100 块数据
===========================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 03-fs-buffer-and-streams/03-streams-and-backpressure/main.ts
```
