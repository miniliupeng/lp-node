# 04-process-exit-and-uncaught: 未捕获异常防御与进程优雅退出机制

在生产环境中，没有永远不报错的程序。关键在于：**当致命错误发生时，应用能否安全自愈？当发布新版本需要重启时，能否不中断正在进行中的用户订单？**

---

## 💡 核心原理三段式

### 1. 是什么？
- **`uncaughtException`**：JavaScript 主线程发生未被任何 `try/catch` 捕获的同步异常时触发的终极兜底事件。
- **`unhandledRejection`**：Promise 被 reject 但没有挂载 `.catch()` 时的兜底事件。
- **优雅停机 (Graceful Shutdown)**：在收到退出信号（如 `SIGTERM`, `SIGINT`）时，**不立即粗暴杀死进程**，而是给系统一段缓冲时间，完成在途事务、释放句柄后再安全退出。

### 2. 为什么需要它？
- **为什么 uncaughtException 不能直接吞掉？** 当抛出全局未捕获异常时，整个 Node.js 内存堆的状态可能已经损坏（例如某个锁未释放、状态机处于中间不一致状态）。如果强行假装没事继续运行，后续的所有请求都可能产生脏数据！官方与业界标准要求：**打点告警后必须立即安全自杀退出（Process Exit）**，让外部进程守护工具（PM2 / K8s）重启新的干净实例。
- **避免订单中断**：发布版本时如果直接 `kill -9`，正在支付的用户网络瞬间断开，直接变成事故。优雅停机可以等待最后的 1~2 秒让在途业务完成。

### 3. 日常工作中怎么用？
- 监听 `SIGTERM`（K8s 容器缩容或滚动更新时发送）和 `SIGINT`（Ctrl+C）；
- 执行标准的 4 步优雅退出流程。

---

## 🔬 核心代码切片

```typescript
// 优雅退出处理器
async function gracefulShutdown(signal: string) {
  console.log(`收到 ${signal} 信号，启动优雅停机流程...`);
  server.close(); // 1. 停止接受新连接
  await closeDatabasePool(); // 2. 释放数据库连接池
  process.exit(0); // 3. 干净退出
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
```

---

## 🖥️ 控制台预期输出快照

```text
=== 未捕获异常防御与优雅停机实战 ===
1. 注册全局防御监听器: uncaughtException, unhandledRejection
2. 模拟服务器处理业务任务...
   - 收到业务订单处理中: [ord_88192]
3. 模拟接收到容器销毁信号: SIGTERM
   -> 步骤 1: 停止接纳新外部网络连接 (server.close)
   -> 步骤 2: 等待在途异步任务完成 (平稳处理完毕)
   -> 步骤 3: 关闭底层数据库连接池与资源句柄
   -> 步骤 4: 进程平稳安全退出 (ExitCode: 0)
====================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 02-event-loop-and-async/04-process-exit-and-uncaught/main.ts
```
