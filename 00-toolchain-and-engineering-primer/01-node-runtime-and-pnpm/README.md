# 01-node-runtime-and-pnpm: Node.js 运行时特性与 pnpm 依赖管理

在进入代码细节前，必须先建立对 Node.js 运行环境与依赖管理的宏观认知。

---

## 💡 核心原理三段式

### 1. 是什么？
- **Node.js 运行时**：基于 Google V8 引擎与 libuv 异步 I/O 库构建的 JavaScript 服务端运行环境。
- **pnpm (Performant npm)**：新一代快速、节省磁盘空间的包管理工具，基于内容寻址存储（CAS）与符号/硬链接机制工作。

### 2. 为什么需要它？
- **Node.js 解决的核心痛点**：传统多线程阻塞模型（如早期的 Apache+PHP）每来一个请求就开辟一个线程，高并发时内存爆炸、线程上下文切换开销巨大。Node.js 采用**单线程事件驱动 + 非阻塞 I/O**，以极低内存支撑海量并发连接。
- **pnpm 解决的核心痛点**：传统 npm 的 `node_modules` 存在两个严重问题：
  1. **磁盘黑洞**：10 个项目如果都用 React，磁盘上就存 10 份重复代码。
  2. **幽灵依赖 (Phantom Dependencies)**：npm 扁平化依赖结构导致你可以在代码中 `import` 未在 `package.json` 中声明的间接依赖，一旦子包升级，生产环境立即崩溃。pnpm 通过硬链接共享全局存储，并通过非扁平化符号链接杜绝幽灵依赖。

### 3. 日常工作中怎么用？
- 在生产运维中，使用 `process.memoryUsage()` 和 `process.cpuUsage()` 搭建健康检查探针；
- 在团队规范中，统一使用 `pnpm install --frozen-lockfile` 确保 CI/CD 构建依赖版本完全确定。

---

## 🔬 核心代码切片 (50 行直观体验)

```typescript
// 探查当前 Node.js 进程核心指标
const mem = process.memoryUsage();
console.log(`Node.js 版本: ${process.version}`);
console.log(`堆内存使用率: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB / ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`运行架构: ${process.arch}, 操作系统: ${process.platform}`);
```

---

## 🖥️ 控制台预期输出快照

```text
=== Node.js 运行时探针 ===
Node.js 版本: v22.x.x (或更高)
V8 引擎版本: 12.x.x
平台架构: darwin (arm64)
进程 ID (PID): 12345
内存分布:
  - 常驻内存 (RSS): ~45.20 MB
  - 堆内存总量 (heapTotal): ~6.80 MB
  - 堆内存已用 (heapUsed): ~4.90 MB
依赖模式: 纯粹现代 Pure ESM 模块规范
==========================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 00-toolchain-and-engineering-primer/01-node-runtime-and-pnpm/main.ts
```
