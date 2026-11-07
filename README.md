# lp-node: 现代 Node.js (TypeScript) 全面广度入门与核心原理实战宝典

<div align="center">

[![Node Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![TypeScript Version](https://img.shields.io/badge/typescript-5.x-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Biome](https://img.shields.io/badge/linter-biome%202.x-orange.svg?style=flat-square)](https://biomejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE)

**一套兼具广度全面、入门友好、保留必要核心原理与直击大厂高频面试真题的现代 Node.js 体系化实战教程**

</div>

---

## 🎯 教程核心特色

1. **广度全面，面向工程基石**：系统涵盖服务端开发所需的方方面面——现代工程工具链、TypeScript 核心类型系统、异步非阻塞与事件循环、文件与流式传输、网络与长连接、并发多进程/多线程、数据校验与持久化、现代 Web 框架底层机制、以及现代 AI 时代标准原语。
2. **结构精炼，聚焦技术本质**：拒绝生僻晦涩的学术黑话与冗余堆砌。每个专题遵循严谨清晰的“核心原理三段式（是什么、为什么需要、生产怎么用）”，示例代码严格控制在 50~80 行，兼具极简与自洽运行。
3. **保留必要核心原理**：不流于表面八股，深度讲透 libuv 事件循环宏微任务机制、Buffer 堆外连续内存模型、Stream 背压与流量调控、Cluster 句柄传递多进程分发、AsyncLocalStorage 全链路追踪等核心基石。
4. **大厂高频常考面试真题**：每个专题精选 3~4 道大厂（字节、阿里、腾讯、美团）真实面试中高频出现的经典考题，提供直击评分要点的黄金作答模板。

---

## 🗺️ 阶段专题导航目录

| 阶段 | 专题目录 | 核心内容 | 最小实证重点 | 交付状态 |
| :--- | :--- | :--- | :--- | :---: |
| **阶段 00：工程工具链与开发基石** | [01-node-runtime-and-pnpm](./00-toolchain-and-engineering-primer/01-node-runtime-and-pnpm/) | Node 运行时概览、Pure ESM 规范与 pnpm 硬链接依赖管理 | **环境自检探针与内存分布打印** | ✅ 已交付 |
| | [02-modern-typescript-setup](./00-toolchain-and-engineering-primer/02-modern-typescript-setup/) | NodeNext 模块规范、显式扩展名与 tsx 零构建极速运行 | **TS NodeNext 规范模块导入** | ✅ 已交付 |
| | [03-native-test-runner](./00-toolchain-and-engineering-primer/03-native-test-runner/) | 原生测试运行器 `node:test` 与严格断言 `node:assert/strict` | **零依赖原生单元测试与断言** | ✅ 已交付 |
| | [04-env-and-configuration](./00-toolchain-and-engineering-primer/04-env-and-configuration/) | 环境变量治理、`process.loadEnvFile` 与 Zod 安全解析 | **配置安全类型强校验与异常拦截** | ✅ 已交付 |
| **阶段 01：TypeScript 核心类型系统** | [01-primitive-and-reference](./01-typescript-essential-types/01-primitive-and-reference/) | 原始类型栈分配、对象堆引用模型与 `structuredClone` 隔离 | **按值传递与深拷贝隔离实证** | ✅ 已交付 |
| | [02-narrowing-and-type-guards](./01-typescript-essential-types/02-narrowing-and-type-guards/) | 类型收窄、自定义类型谓词 `is` 与可辨识联合穷尽性检查 | **类型安全收窄与 never 穷举检查** | ✅ 已交付 |
| | [03-utility-types-practical](./01-typescript-essential-types/03-utility-types-practical/) | 高频工具类型组合实战（Partial, Pick, Omit, Record） | **企业级 DTO 数据视图派生** | ✅ 已交付 |
| | [04-satisfies-and-const](./01-typescript-essential-types/04-satisfies-and-const/) | `satisfies` 操作符契约校验与 `as const` 字面量推断保留 | **消除类型变宽与精准类型推断** | ✅ 已交付 |
| **阶段 02：异步基石与事件循环** | [01-event-loop-and-timers](./02-event-loop-and-async/01-event-loop-and-timers/) | libuv 事件循环各阶段、宏任务与微任务执行时序实测 | **时序探针实测宏微任务先后** | ✅ 已交付 |
| | [02-async-await-error-handling](./02-event-loop-and-async/02-async-await-error-handling/) | async/await 异常控制、Go 风格 Safe Await 与 allSettled 容灾 | **并发容灾降级与安全异常捕获** | ✅ 已交付 |
| | [03-async-local-storage](./02-event-loop-and-async/03-async-local-storage/) | `AsyncLocalStorage` 跨异步调用链隐式传递 TraceID | **并发请求上下文强隔离追踪** | ✅ 已交付 |
| | [04-process-exit-and-uncaught](./02-event-loop-and-async/04-process-exit-and-uncaught/) | `uncaughtException`、`unhandledRejection` 与优雅停机 | **未捕获异常防御与标准停机编排** | ✅ 已交付 |
| **阶段 03：文件、Buffer 与流式数据** | [01-fs-and-path-basics](./03-fs-buffer-and-streams/01-fs-and-path-basics/) | `node:fs/promises` 异步读写、跨平台路径与文件原子写入 | **跨平台路径与安全原子替换** | ✅ 已交付 |
| | [02-buffer-and-binary](./03-fs-buffer-and-streams/02-buffer-and-binary/) | Buffer 堆外连续内存模型、allocUnsafe 与切片共享陷阱 | **二进制编码转换与切片内存隔离** | ✅ 已交付 |
| | [03-streams-and-backpressure](./03-fs-buffer-and-streams/03-streams-and-backpressure/) | 可读流、可写流、`highWaterMark` 水位线与 `drain` 背压流控 | **背压信号触发与 pipeline 管道** | ✅ 已交付 |
| | [04-web-streams-interop](./03-fs-buffer-and-streams/04-web-streams-interop/) | WHATWG Web Streams 标准与 Node 原生流无缝桥接 | **TransformStream 与流双向互通** | ✅ 已交付 |
| **阶段 04：网络编程与实时通信** | [01-native-http-server](./04-network-and-realtime/01-native-http-server/) | 零依赖原生 HTTP 服务、流式 Body 解析与极简路由封装 | **原生 HTTP 路由与端对端自测** | ✅ 已交付 |
| | [02-tcp-socket-basics](./04-network-and-realtime/02-tcp-socket-basics/) | TCP 套接字通信、面向字节流特征与换行定界解决粘包 | **TCP 粘包现象与应用层定界解包** | ✅ 已交付 |
| | [03-websocket-heartbeat](./04-network-and-realtime/03-websocket-heartbeat/) | WebSocket 协议升级握手、Ping/Pong 心跳探针与指数退避重连 | **长连接保活状态机与重连退避** | ✅ 已交付 |
| **阶段 05：并发模型与多进程/线程** | [01-child-process-basics](./05-concurrency-and-processes/01-child-process-basics/) | 子进程衍生原语（spawn/execFile/fork）与防 maxBuffer 溢出 | **安全流式执行系统命令与防注入** | ✅ 已交付 |
| | [02-cluster-multicore](./05-concurrency-and-processes/02-cluster-multicore/) | `node:cluster` 主从多进程集群、端口句柄分发与异常自愈 | **多核进程衍生与平稳下线自愈** | ✅ 已交付 |
| | [03-worker-threads-cpu-bound](./05-concurrency-and-processes/03-worker-threads-cpu-bound/) | `node:worker_threads` 多线程并行计算 CPU 密集任务 | **密集运算并行执行且主线程 0 阻塞** | ✅ 已交付 |
| **阶段 06：数据治理与安全认证** | [01-zod-runtime-validation](./06-data-layer-and-auth/01-zod-runtime-validation/) | Zod 模式校验、safeParse 结构化错误与静态类型双向绑定 | **外部入参净化与类型反向推导** | ✅ 已交付 |
| | [02-sqlite-embedded-database](./06-data-layer-and-auth/02-sqlite-embedded-database/) | 原生 `node:sqlite` 内存数据库、预编译语句与防注入查询 | **嵌入式 SQLite 内存建表与预编译** | ✅ 已交付 |
| | [03-auth-cookie-session-jwt](./06-data-layer-and-auth/03-auth-cookie-session-jwt/) | Cookie 安全属性（HttpOnly/SameSite）与原生轻量 JWT 验签 | **HMAC-SHA256 签名与防篡改验证** | ✅ 已交付 |
| **阶段 07：现代后端框架底层机制** | [01-fastify-core-and-plugins](./07-modern-web-frameworks/01-fastify-core-and-plugins/) | Fastify 插件上下文作用域隔离（Encapsulation）与装饰器继承 | **插件作用域树与全局防污染验证** | ✅ 已交付 |
| | [02-nestjs-ioc-and-aop](./07-modern-web-frameworks/02-nestjs-ioc-and-aop/) | 依赖注入容器（IoC/DI）、构造器装配与面向切面拦截器（AOP） | **轻量 IoC 容器与无侵入耗时拦截器** | ✅ 已交付 |
| **阶段 08：AI 时代原语与收官实战** | [01-mcp-server-protocol](./08-ai-primitives-and-capstone/01-mcp-server-protocol/) | Model Context Protocol (MCP) 标准协议与 JSON-RPC 2.0 工具服务 | **标准 MCP tools/list 与 tools/call** | ✅ 已交付 |
| | [02-sse-ai-streaming](./08-ai-primitives-and-capstone/02-sse-ai-streaming/) | Server-Sent Events (SSE) 协议、流式 Token 推送与断开取消 | **打字机流式输出与客户端中断联动** | ✅ 已交付 |
| | [03-capstone-pipeline-orchestration](./08-ai-primitives-and-capstone/03-capstone-pipeline-orchestration/) | 综合收官：融合 TS 契约、ALS 追踪、Stream 背压与容灾治理引擎 | **高并发流式任务流水线全链路自闭环** | ✅ 已交付 |

---

## 🛠️ 快速开始

### 1. 环境准备
```bash
# 确保安装 Node.js LTS (>= 22.0.0) 与 pnpm (>= 9.0.0)
node -v
pnpm -v
pnpm install
```

### 2. 代码自检
```bash
make check   # 执行 TypeScript 静态类型检查 (tsc --noEmit)
make lint    # 执行代码格式化与规范校验 (biome check)
make test    # 运行原生单元测试套件 (node --test)
```

### 3. 一键按序运行所有专题
```bash
make run-all # 自动化连续运行全部 9 大阶段 30 个专题示例
```

## 并行教程：从零到 2026 面试

上面的专题实验保持原样。另一条中文主线在独立目录里，从语言和运行时讲到工程与面试题，示例只用 Node 内置模块：

- 正文：[docs/node-tutorial/README.md](docs/node-tutorial/README.md)
- 示例：[examples/node-tutorial](examples/node-tutorial)

```bash
node examples/node-tutorial/run-all.mjs
```
