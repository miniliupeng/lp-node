# 阶段 05: 并发模型、多进程与工作线程

Node.js 主执行线程为单线程，但并不意味着它无法压榨多核算力或无法胜任 CPU 密集型任务。Node.js 提供了完备的**多进程（child_process / cluster）**与**真正的多线程（worker_threads）**原语体系。

---

## 💡 核心工程心智与并发架构

1. **子进程衍生与跨进程 IPC 管道**：
   - 区分四大 API：`spawn`（基础流式处理，防 `maxBuffer` 溢出）、`exec`（Shell 字符串执行，具注入与缓冲上限风险）、`execFile`（直接执行二进制，安全高效）、`fork`（专属 Node.js 实例，自带全双工 IPC 通道）；
   - 掌握 Unix Domain Socket 与 Windows Named Pipe 在跨进程通信中的底层映射，明确进程间内存物理隔离本质。
2. **Cluster 多进程集群与高可用架构**：
   - Master-Worker (Primary-Worker) 拓扑结构，Primary 统一监听外部端口，通过操作系统文件描述符传递（File Descriptor Passing）将网络 Socket 分发给各 Worker 进程；
   - 掌握默认的 Round-Robin（轮询调度）算法优势，避免操作系统抢占引发的惊群效应；
   - 监听 Worker `exit` 事件实现故障快速自愈拉起，实践零停机滚动更新（Zero-Downtime Reload）。
3. **worker_threads 真正的多线程并行计算**：
   - 同一进程内的独立 OS 线程，各自拥有独立的 V8 Isolate 与事件循环；
   - 专用于处理图像处理、密码学哈希、音视频压缩等 CPU 密集任务，保持主线程事件循环 0 毫秒卡顿；
   - 掌握结构化克隆传参、`Transferable Objects` 纳秒级所有权转移，以及 `SharedArrayBuffer` 配合 `Atomics` 原子操作的底层机制。

---

## 🗺️ 阶段专题导航

| 专题目录 | 核心原语 | 关键掌握目标 |
| :--- | :--- | :--- |
| **[01-child-process-basics](./01-child-process-basics)** | 子进程执行与 IPC 管道 | 掌握 `spawn` 流式传输防 `maxBuffer` 溢出与 `fork` 专用跨进程通信 |
| **[02-cluster-multicore](./02-cluster-multicore)** | 多核 CPU 集群与平滑重启 | 掌握 `node:cluster` 多进程负载均衡与子进程异常退出自愈监控 |
| **[03-worker-threads-cpu-bound](./03-worker-threads-cpu-bound)** | 多线程并行与 CPU 计算 | 掌握 `node:worker_threads` 剥离耗时计算，保障主线程事件循环 0 卡顿 |

---

## 🚀 统一运行指令

```bash
make run-05
```
