# 阶段 03: 文件系统、Buffer 与流式数据处理

在服务端高并发场景中，处理大文件、音视频转码或数据报表导出时，若缺乏严谨的内存与流控心智，极易引发 V8 堆内存溢出（OOM）或磁盘数据半写损坏。本阶段将全面攻克 Node.js 处理二进制与海量数据的三大杀手锏：**fs/promises、Buffer 与 Stream 背压**。

---

## 💡 核心工程心智与底层 I/O 模型

1. **现代异步文件系统与原子写入**：
   - 彻底摒弃同步阻塞 API（如 `fs.readFileSync`，会物理级挂起事件循环主线程），全面采用 `node:fs/promises`；
   - 采用 Write-Rename 模式实现文件系统级**原子写入（Atomic File Write）**，杜绝服务崩溃或断电导致的目标文件截断与半写损坏态。
2. **Buffer 二进制与堆外内存机制**：
   - Buffer 是 Node.js 直接向操作系统申请的**固定大小 C++ 堆外连续物理内存（Off-Heap）**，绕开 V8 GC 频繁回收暂停开销；
   - 掌握 `Buffer.alloc`（安全清零）与 `Buffer.allocUnsafe`（未清零脏内存风险）；
   - 深入理解 `Buffer.prototype.subarray()` 的共享内存视图特性，避免持有切片阻碍整个大 Buffer 回收造成的隐蔽内存泄漏。
3. **Stream 流式传输与背压调控 (Backpressure)**：
   - 当上游生产/读取速率远高于下游消费/写入速率时，通过 `highWaterMark` 阈值与 `write() === false` 信号触发背压，通知上游暂停生产；
   - 监听 `drain` 事件在下游缓冲区清空后恢复读取，将内存维持在恒定低水位；
   - 淘汰存在句柄泄漏隐患的旧版 `.pipe()`，全量采用自动化生命周期管理的 `stream.pipeline`。
4. **WHATWG Web Streams 标准互通**：
   - 现代云原生与边缘计算（Edge Runtime）通用标准；
   - 熟练运用 `ReadableStream`、`TransformStream` 以及官方互通桥梁（`Readable.fromWeb` / `Readable.toWeb`）实现与 fetch API 及大模型流式响应的无缝对接。

---

## 🗺️ 阶段专题导航

| 专题目录 | 核心原语 | 关键掌握目标 |
| :--- | :--- | :--- |
| **[01-fs-and-path-basics](./01-fs-and-path-basics)** | 现代文件与路径操作 | 掌握 `node:fs/promises`、跨平台 `path.join/resolve` 与原子写入/临时文件替换 |
| **[02-buffer-and-binary](./02-buffer-and-binary)** | 二进制数据与 Buffer 切片 | 掌握 `Buffer.alloc` vs `allocUnsafe`、内存切片共享陷阱与编码转换 |
| **[03-streams-and-backpressure](./03-streams-and-backpressure)** | 流式传输与背压控制 | 深入剖析 `pipeline`、`highWaterMark` 水位线与 `drain` 事件防止内存 OOM |
| **[04-web-streams-interop](./04-web-streams-interop)** | 现代 Web Streams 互通 | 掌握 Web 标准 `TransformStream` 与 Node 原生流无缝桥接 (`fromWeb`/`toWeb`) |

---

## 🚀 统一运行指令

```bash
make run-03
```
