# 学习与演进进度看板 (Learning Progress)

本看板用于跟踪 Node.js 现代工程实战各阶段专题的交付与掌握状态。

---

## 阶段规划概览

- [x] **阶段 00: 现代工程工具链与开发基石 (4/4)**
  - [x] `01-node-runtime-and-pnpm`: Node.js LTS 运行时特性与 pnpm 软硬链接依赖管理
  - [x] `02-modern-typescript-setup`: 现代 NodeNext 模块规范与轻量运行方案
  - [x] `03-native-test-runner`: 原生零依赖单元测试与断言机制 (`node:test`, `node:assert`)
  - [x] `04-env-and-configuration`: 现代环境变量治理与双轨读取 (`process.loadEnvFile` / `dotenv`)

- [x] **阶段 01: TypeScript 核心类型系统进阶 (4/4)**
  - [x] `01-primitive-and-reference`: 原始类型与对象引用模型
  - [x] `02-narrowing-and-type-guards`: 类型收窄与自定义类型守卫 (Type Guards)
  - [x] `03-utility-types-practical`: 高频实用工具类型实战 (`Partial`, `Pick`, `Omit`, `Record`)
  - [x] `04-satisfies-and-const`: `satisfies` 运算符与 `as const` 强类型推断

- [ ] **阶段 02: 异步基石、事件循环与异常治理 (4/4)**
  - [ ] `01-event-loop-and-timers`: Event Loop 宏任务与微任务执行顺序实战验证
  - [ ] `02-async-await-error-handling`: 优雅处理异步错误与 Promise 状态流转
  - [ ] `03-async-local-storage`: 全链路上下文追踪与请求生命周期治理 (`AsyncLocalStorage`)
  - [ ] `04-process-exit-and-uncaught`: 未捕获异常防御与进程优雅退出机制

- [ ] **阶段 03: 文件系统、Buffer 与流式数据处理 (4/4)**
  - [ ] `01-fs-and-path-basics`: 现代文件与路径操作最佳实践 (`node:fs/promises`, `node:path`)
  - [ ] `02-buffer-and-binary`: 二进制数据与 Buffer 内存切片原理
  - [ ] `03-streams-and-backpressure`: 可读流、可写流与背压机制深入剖析
  - [ ] `04-web-streams-interop`: 现代 Web Streams 与 Node.js 原生流互通

- [ ] **阶段 04: 网络编程与实时通信通信 (3/3)**
  - [ ] `01-native-http-server`: 零外部依赖原生 HTTP 服务与基础路由封装
  - [ ] `02-tcp-socket-basics`: TCP Socket 基础与粘包半包场景初探
  - [ ] `03-websocket-heartbeat`: WebSocket 长连接机制与心跳重连保活

- [ ] **阶段 05: 并发模型、多进程与工作线程 (3/3)**
  - [ ] `01-child-process-basics`: 子进程执行外部命令与跨进程通信 (`child_process`)
  - [ ] `02-cluster-multicore`: 多核 CPU 算力压榨与 Cluster 集群平滑重启
  - [ ] `03-worker-threads-cpu-bound`: 工作线程处理 CPU 密集型任务 (`worker_threads`)

- [ ] **阶段 06: 数据治理与安全身份认证 (3/3)**
  - [ ] `01-zod-runtime-validation`: Zod 运行时数据验证与 TS 类型双向同步
  - [ ] `02-sqlite-embedded-database`: 原生轻量嵌入式数据库操作 (`node:sqlite`)
  - [ ] `03-auth-cookie-session-jwt`: Cookie/Session 机制与轻量 JWT 无状态验签

- [ ] **阶段 07: 现代后端框架实战入门 (2/2)**
  - [ ] `01-fastify-core-and-plugins`: Fastify 极速入门与插件封装思想
  - [ ] `02-nestjs-ioc-and-aop`: NestJS 核心思想：依赖注入 (IoC) 与面向切面 (AOP)

- [ ] **阶段 08: AI 时代原语与收官实战 (3/3)**
  - [ ] `01-mcp-server-protocol`: 打造轻量 MCP (Model Context Protocol) 标准工具服务
  - [ ] `02-sse-ai-streaming`: Server-Sent Events (SSE) 大模型流式输出推送
  - [ ] `03-capstone-pipeline-orchestration`: 综合收官：高并发流式任务编排与治理引擎
