# lp-node: 现代 Node.js (TypeScript) 全面广度入门与核心原理实战宝典

<div align="center">

[![Node Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![TypeScript Version](https://img.shields.io/badge/typescript-5.x-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Biome](https://img.shields.io/badge/linter-biome%202.x-orange.svg?style=flat-square)](https://biomejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE)

**一套兼具广度全面、入门友好、必要核心原理与大厂高频面试真题的现代 Node.js 体系化实战教程**

</div>

---

## 🎯 教程核心特色

1. **广度全面，面向日常工作**：涵盖日常开发所需的方方面面——现代工程工具链、TypeScript 实用进阶、异步与事件循环、文件与流式传输、网络与长连接、多进程/多线程、数据校验与持久化、现代 Web 框架、以及 2026 现代 AI 原语。
2. **入门友好，通俗易懂**：拒绝生僻晦涩的学术黑话。每个专题采用“生活化比喻 + 原理三段式（是什么、为什么、怎么用）”，代码控制在 50~80 行以内，配详尽中文注释。
3. **保留必要核心原理**：不流于表面八股，讲透事件循环、宏任务微任务、Buffer 堆外本质、流与背压、依赖注入等关键底层灵魂。
4. **大厂高频常考面试真题**：每个专题精选 3~4 道大厂真实面试中出现概率在 80% 以上的高频真题，提供条理清晰的“大厂高分答题模板”。

---

## 🗺️ 阶段专题导航目录

| 阶段 | 专题目录 | 核心内容 | 最小实证重点 | 交付状态 |
| :--- | :--- | :--- | :--- | :---: |
| **阶段零：工程工具链** | [01-node-runtime-and-pnpm](./00-toolchain-and-engineering-primer/01-node-runtime-and-pnpm/) | Node 运行时概览、Pure ESM 规范与 pnpm 包管理 | **环境自检与依赖拓扑打印** | [待攻坚] |
| | [02-modern-typescript-setup](./00-toolchain-and-engineering-primer/02-modern-typescript-setup/) | 现代 tsconfig.json、NodeNext 解析与 tsx 执行 | **TS 工程配置与模块导入验证** | [待攻坚] |
| | [03-native-test-runner](./00-toolchain-and-engineering-primer/03-native-test-runner/) | 原生测试运行器 `node:test` 与 `node:assert` 极速单测 | **零依赖原生单元测试实战** | [待攻坚] |
| | [04-env-and-configuration](./00-toolchain-and-engineering-primer/04-env-and-configuration/) | 环境变量治理、`.env` 配置与 Node 20.6+ `--env-file` | **多环境配置加载与安全隔离** | [待攻坚] |
| **阶段一：TS 实用核心进阶** | [01-primitive-and-reference](./01-typescript-essential-types/01-primitive-and-reference/) | 原始类型与对象引用模型、包装对象与 BigInt 精度 | **内存引用模型与大数防溢出** | [待攻坚] |
| | [02-type-narrowing-and-guards](./01-typescript-essential-types/02-type-narrowing-and-guards/) | 类型收窄、类型守卫（`typeof`, `instanceof`, `is` 谓词） | **模式匹配与安全类型收窄** | [待攻坚] |
| | [03-generics-and-utility-types](./01-typescript-essential-types/03-generics-and-utility-types/) | 泛型入门与内置实用工具类型（Partial, Pick, Record） | **类型安全数据字典与工具类型** | [待攻坚] |
| | [04-satisfies-and-const-contexts](./01-typescript-essential-types/04-satisfies-and-const-contexts/) | `satisfies` 操作符与 `as const`，消除类型宽化 | **精准类型推导与只读配置表** | [待攻坚] |
| **阶段二：异步与事件循环** | [01-event-loop-macrotask-microtask](./02-event-loop-and-async/01-event-loop-macrotask-microtask/) | 通俗图解事件循环、宏任务与微任务（Promise/nextTick）执行顺序 | **时序探针实测宏微任务先后** | [待攻坚] |
| | [02-async-await-and-error-handling](./02-event-loop-and-async/02-async-await-and-error-handling/) | async/await 异步控制、Promise.all 与全局异常捕获 | **并发控制与安全异常处理** | [待攻坚] |
| | [03-async-local-storage](./02-event-loop-and-async/03-async-local-storage/) | `AsyncLocalStorage` 跨异步调用链传递 TraceID | **无侵入链路追踪与上下文管理** | [待攻坚] |
| | [04-uncaught-exceptions-and-process-exit](./02-event-loop-and-async/04-uncaught-exceptions-and-process-exit/) | `uncaughtException`、`unhandledRejection` 与优雅退出 | **未捕获异常监控与平稳自杀** | [待攻坚] |
| **阶段三：文件、内存与流** | [01-fs-and-path-essentials](./03-fs-buffer-and-streams/01-fs-and-path-essentials/) | `node:fs/promises` 常用文件读写、目录遍历与路径安全拼接 | **日常文件读写与路径防穿越** | [待攻坚] |
| | [02-buffer-fundamentals](./03-fs-buffer-and-streams/02-buffer-fundamentals/) | Buffer 是什么、堆外内存概念、字符串转换与切片 | **二进制字节操作与零拷贝切片** | [待攻坚] |
| | [03-stream-and-backpressure](./03-fs-buffer-and-streams/03-stream-and-backpressure/) | 大文件流式处理、背压（Backpressure）机制与 pipeline | **大文件分块拷贝与背压限流** | [待攻坚] |
| | [04-web-streams-interop](./03-fs-buffer-and-streams/04-web-streams-interop/) | 现代 Web Streams 标准（ReadableStream）与 Node 流互通 | **现代 Web 流与 Node 流双向桥接** | [待攻坚] |
| **阶段四：网络与长连接基础** | [01-native-http-server](./04-network-and-realtime/01-native-http-server/) | 原生 `node:http` 构建 Web 服务、路由分发与状态码 | **轻量原生 HTTP 接口与响应封装** | [待攻坚] |
| | [02-tcp-socket-and-framing](./04-network-and-realtime/02-tcp-socket-and-framing/) | `node:net` 原生 TCP Socket 编程、连接生命周期与基础分包 | **TCP 客户端服务端通信与拆包** | [待攻坚] |
| | [03-websocket-and-heartbeat](./04-network-and-realtime/03-websocket-and-heartbeat/) | WebSocket 全双工通信、心跳保活机制与连接断开感知 | **原生协议升级与心跳检测机制** | [待攻坚] |
| **阶段五：并发与多任务处理** | [01-child-process-basics](./05-concurrency-and-processes/01-child-process-basics/) | `child_process`（exec, spawn, fork）与系统命令调用 | **外部命令调用与流式数据处理** | [待攻坚] |
| | [02-cluster-multicore](./05-concurrency-and-processes/02-cluster-multicore/) | Cluster 多进程集群入门、多核利用与 Round-Robin 调度 | **多进程监听与端口复用实操** | [待攻坚] |
| | [03-worker-threads-intro](./05-concurrency-and-processes/03-worker-threads-intro/) | `worker_threads` 多线程入门、CPU 密集任务隔离卸载 | **工作线程派发计算与消息通信** | [待攻坚] |
| **阶段六：数据校验与数据库** | [01-zod-schema-validation](./06-data-layer-and-auth/01-zod-schema-validation/) | Zod 入参模式校验、类型反向推导（`z.infer`）与错误格式化 | **请求入参防御与类型安全提取** | [待攻坚] |
| | [02-native-sqlite-crud](./06-data-layer-and-auth/02-native-sqlite-crud/) | Node 22+ 原生 `node:sqlite`（`DatabaseSync`）增删改查与参数化防注入 | **嵌入式数据库安全持久化** | [待攻坚] |
| | [03-auth-and-jwt-basics](./06-data-layer-and-auth/03-auth-and-jwt-basics/) | Cookie/Session 与 JWT 的区别、Token 签发与鉴权验证 | **双 Token 签发与鉴权守卫** | [待攻坚] |
| **阶段七：现代 Web 框架** | [01-fastify-core-and-plugins](./07-modern-web-frameworks/01-fastify-core-and-plugins/) | Fastify 极速架构、路由与插件封装（Encapsulation）机制 | **Fastify 高吞吐服务与插件开发** | [待攻坚] |
| | [02-nestjs-ioc-and-aop-concepts](./07-modern-web-frameworks/02-nestjs-ioc-and-aop-concepts/) | NestJS 企业级核心思想：依赖注入（IoC）与切面（AOP） | **轻量 IoC 容器与守卫切面实操** | [待攻坚] |
| **阶段八：现代 AI 与综合收官** | [01-mcp-tools-basics](./08-ai-primitives-and-capstone/01-mcp-tools-basics/) | Model Context Protocol (MCP) 标准工具服务入门与调用 | **标准 MCP 工具服务注册与暴露** | [待攻坚] |
| | [02-llm-streaming-sse](./08-ai-primitives-and-capstone/02-llm-streaming-sse/) | 大模型流式输出与 Server-Sent Events (SSE) 协议原理 | **SSE 打字机式流式数据推送** | [待攻坚] |
| | [03-capstone-mini-engine](./08-ai-primitives-and-capstone/03-capstone-mini-engine/) | 综合收官小实战：带上下文追踪与背压处理的文件流任务处理引擎 | **跨模块核心原语协同小引擎** | [待攻坚] |

---

## 🛠️ 常用效能与验证指令

```bash
# 安装依赖
pnpm install

# 静态类型检查
pnpm exec tsc --noEmit

# 快速代码格式化与质量检查
pnpm exec biome check --write .
```
