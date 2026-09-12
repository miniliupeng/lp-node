# 02-cluster-multicore: 多核 CPU 算力压榨与 Cluster 集群平滑重启

默认情况下，一个 Node.js 进程只能运行在单核 CPU 上。对于 32 核或 64 核的高配服务器，单进程模式会导致巨大的算力浪费。**Cluster 模块**让我们可以一键根据 CPU 核心数启动多个工作进程。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`node:cluster`**：Node.js 原生集群模块。采用 **Master-Worker (Primary-Worker) 主从多进程架构**。
- **端口句柄复用**：多个 Worker 进程可以在代码里同时写 `server.listen(8080)`，而**不会发生 `EADDRINUSE` 端口占用冲突**！
- **故障自愈 (Auto-Healing)**：Primary 主进程不处理具体业务，专职作为“工头”监视 Worker 状态。一旦某个 Worker 因为致命错误奔溃退出，主进程立刻 `cluster.fork()` 拉起一个全新实例。

### 2. 为什么多进程监听同端口不冲突？
- 真正向操作系统调用 `bind()` 和 `listen()` 占用 8080 端口的**只有 Primary 主进程一个人**！
- 当网络请求到来时，主进程根据 **Round-Robin（轮询分发）**策略选出一个空闲的 Worker，然后把该网络连接的底层的 Socket 文件描述符（FD 句柄）通过内部 IPC 传递给选中的 Worker 去处理。

### 3. 日常工作中怎么用？
- 理解生产环境进程管理守护工具 **PM2 (`pm2 start app.js -i max`)** 的底层底层实现机制。

---

## 🔬 核心代码切片

```typescript
import cluster from "node:cluster";
import { availableParallelism } from "node:os";

if (cluster.isPrimary) {
  const cpus = availableParallelism();
  console.log(`主进程 [PID ${process.pid}] 启动，即将衍生 ${cpus} 个工作进程`);
  for (let i = 0; i < cpus; i++) cluster.fork();

  cluster.on("exit", (worker) => {
    console.log(`工作进程 [${worker.process.pid}] 异常退出，立即复活自愈...`);
    cluster.fork();
  });
} else {
  // 工作进程共享端口
  server.listen(3000);
}
```

---

## 🖥️ 控制台预期输出快照

```text
=== Cluster 多进程集群与故障自愈实战 ===
1. Primary 主进程 [PID: xxxxx] 启动，检测到多核 CPU 环境
   -> 成功衍生工作进程 Worker 1 [PID: xxxxx]
   -> 成功衍生工作进程 Worker 2 [PID: xxxxx]
2. 模拟 Worker 1 发生未捕获异常退出 (自愈测试)...
   ⚠️ 监听到 Worker 1 [PID: xxxxx] 退出 (退出码: 1)
   ✔ Primary 主进程触发自愈逻辑，重新衍生新 Worker 3 [PID: xxxxx]
3. 集群健康恢复，测试完毕平稳退出主从进程
========================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 05-concurrency-and-processes/02-cluster-multicore/main.ts
```
