# 阶段 05: 并发模型、多进程与工作线程

“Node.js 只能用一个 CPU 核心，无法做 CPU 密集型任务？”——这是对现代 Node.js 最大的误解。Node.js 提供了完整的**多进程（child_process / cluster）**与**真正的多线程（worker_threads）**原语来榨干服务器的全部硬件性能。

---

## ☕ 生活化心智：总店与分工矩阵

1. **child_process (子进程)**：
   - 就像**外包协同公司**。Node.js 自己不擅长处理音视频压缩（如 ffmpeg）或调用系统 Git 命令，于是通过子进程唤起外部独立的 C/C++ 二进制程序，干完活把结果通过管道传回来。
2. **Cluster (多进程集群)**：
   - 就像**在全国开 8 家独立分店**（利用 8 核 CPU）。每个分店都是一个独立的 Node.js 进程，拥有自己独立的 V8 虚拟机和内存空间。
   - 主店（Master/Primary）负责接电话并把客人按轮询（Round-Robin）分流给各个分店。哪怕某一家分店突然停电倒闭，其余 7 家店依然正常营业，主店还能瞬间再开一家新店补上。
3. **worker_threads (工作线程)**：
   - 就像**同一家店里的多个专属工匠**。他们同属于一个进程，共享部分内存（SharedArrayBuffer），专门用来在后厨秘密研磨极耗费体力的咖啡配方（CPU 密集型复杂运算），绝不占用前台收银服务员（主线程事件循环）哪怕 1 毫秒的时间！

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
