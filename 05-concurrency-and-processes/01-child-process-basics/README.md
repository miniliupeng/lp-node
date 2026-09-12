# 01-child-process-basics: 子进程执行与跨进程 IPC 通信

当 Node.js 需要执行操作系统脚本（如 Shell、Python 工具）或将外部重型 CLI 集成到系统流中时，`node:child_process` 提供了底层的系统调用封装。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`spawn(command, [args])`**：基础原语。异步衍生新进程，返回一个带有 `stdout` 和 `stderr` 流式句柄的子进程对象，**没有输出缓冲大小限制**。
- **`exec(command)`**：在系统 Shell（如 `/bin/sh`）中执行命令，将所有输出缓存在内存中（默认限制 1MB，超限立即抛出 `ERR_CHILD_PROCESS_STDIO_MAXBUFFER`），且存在严重的 Shell 命令注入漏洞风险。
- **`fork(modulePath)`**：专门用于衍生新的 Node.js 进程，并自动建立一条**双向 IPC（Inter-Process Communication）管道**，允许父子进程之间通过 `process.send()` 互相传递 JSON 消息。

### 2. 为什么需要搞透它？
- **安全红线 (Command Injection)**：若在 `exec("cat " + userInput)` 中未做转义，恶意用户传入 `; rm -rf /` 会直接在宿主机执行！`spawn` 和 `execFile` 不经过 Shell，参数以数组形式严格传递，天然免疫注入。
- **大输出防爆**：调用外部命令输出大量日志时，`exec` 会直接把内存撑爆；而 `spawn` 允许用流式 `pipe` 边读边写。

### 3. 日常工作中怎么用？
- 调用外部二进制（如 ffmpeg、docker CLI）优先使用 `spawn`；
- 拆分独立 Node.js 后台微工作进程使用 `fork`。

---

## 🔬 核心代码切片

```typescript
import { spawn } from "node:child_process";

// 安全非阻塞流式调用系统命令
const child = spawn("node", ["-v"]);
child.stdout.on("data", (chunk) => {
  console.log(`子进程标准输出: ${chunk.toString().trim()}`);
});
```

---

## 🖥️ 控制台预期输出快照

```text
=== child_process 子进程通信实战 ===
1. 安全流式衍生子进程 (spawn 避免 maxBuffer 溢出):
   ✔ 成功执行 [node -v]，捕获输出: "v22.x.x" (退出码: 0)
2. 进程衍生方式横向心智总结:
   - spawn: 适合处理持续性大量日志/大文件流
   - execFile: 适合快速获取短小命令返回值，免疫 Shell 注入
   - fork: 专供 Node 进程间建立 IPC 双向管道
====================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 05-concurrency-and-processes/01-child-process-basics/main.ts
```
