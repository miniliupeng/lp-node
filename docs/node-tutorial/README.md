# Node.js 教程：零基础到 2026 面试

这是一套**并行**的中文系统教程。仓库根目录里原有的专题实验（`00-toolchain-and-engineering-primer` 到 `08-ai-primitives-and-capstone`）继续保留，本目录不替换、不删除它们。

可运行示例在 [`examples/node-tutorial`](../../examples/node-tutorial)。正文里的顺序结论，都有对应脚本用 `node:assert/strict` 固定下来。

## 版本假设

- 示例与表述以 **Node.js 22.23.4** 实测为准（V8 `12.4.254.21-node.57`，libuv `1.51.0`，OpenSSL `3.5.9`，undici `6.29.1`）。
- 语言层面按这枚 V8 实际能跑的语法来写。`using` 在这个版本上是语法错误。
- 2026-11-07 的发布线状态、以及哪些 API 仍带实验警告，写在 [00-versions-and-how-to-run.md](./00-versions-and-how-to-run.md)。
- 本环境没有跑 Node 24 / 26。生产选型可以选更新的 Active LTS，但要把示例再跑一遍，不要把 22.23 的结论直接挪过去。

## 怎么读

```text
Part A 入门
  能独立写出一个读文件、发请求、起 HTTP 服务的小程序
Part B 进阶
  Buffer、流、TCP 定界、HTTP、加密、测试、SQLite、SSE、WebSocket
Part C 运行时
  事件循环、线程池、内存、Worker、cluster、取消、类型剥离
Part D 工程与系统设计
  校验、鉴权、限流、队列、优雅退出、短链，以及系统设计的取舍
Part E 面试题库
  按主题给出参考答案、易错点和追问
```

建议每读完一章就运行对应示例。不要只看输出，打开脚本看断言。

```bash
node examples/node-tutorial/A/01-hello.mjs
node examples/node-tutorial/run-all.mjs
```

`run-all.mjs` 在本环境一次跑完 57 个程序。`node:sqlite` 会在 stderr 打印实验性警告，退出码仍为 0。

## Part A 入门

| 章 | 内容 | 示例 |
| --- | --- | --- |
| [A01 什么是 Node](./A/01-what-is-node.md) | 运行时、REPL、第一个程序 | `A/01-hello.mjs` |
| [A02 值与相等](./A/02-values.md) | 类型、`===`、引用、拷贝 | `A/02-values.mjs` |
| [A03 函数与对象](./A/03-functions.md) | 闭包、`this`、解构 | `A/03-functions.mjs` |
| [A04 集合与 JSON](./A/04-collections-json.md) | 数组、Map、JSON 边界 | `A/04-json.mjs` |
| [A05 错误](./A/05-errors.md) | `Error`、`cause`、自定义错误 | `A/05-errors.mjs` |
| [A06 模块](./A/06-modules.md) | ESM、CJS、`require(esm)` | `A/06-modules.mjs` |
| [A07 包与版本](./A/07-packages.md) | `package.json`、semver、锁文件 | `A/07-semver.mjs` |
| [A08 进程、路径、系统](./A/08-process-path.md) | `process`、`path`、路径逃逸 | `A/08-path-process.mjs` |
| [A09 文件](./A/09-filesystem.md) | `fs/promises`、中止读文件 | `A/09-fs.mjs` |
| [A10 异步](./A/10-async.md) | Promise、`async/await`、`allSettled` | `A/10-async.mjs` |
| [A11 事件](./A/11-events.md) | `EventEmitter`、`error` 事件 | `A/11-events.mjs` |
| [A12 HTTP 入门](./A/12-http.md) | 本机服务与 `fetch` | `A/12-http.mjs` |
| [A13 断言与调试](./A/13-debug.md) | `node:assert`、栈、检查器 | `A/13-assert.mjs` |

## Part B 进阶

| 章 | 内容 | 示例 |
| --- | --- | --- |
| [B01 Buffer](./B/01-buffer.md) | 编码、池、共享内存 | `B/01-buffer.mjs` |
| [B02 流与背压](./B/02-streams.md) | `write` 返回值、`pipeline` | `B/02-backpressure.mjs` |
| [B03 文件进阶](./B/03-fs-advanced.md) | 同目录原子替换 | `B/03-atomic-write.mjs` |
| [B04 URL](./B/04-url.md) | WHATWG URL | `B/04-url.mjs` |
| [B05 TCP 定界](./B/05-tcp.md) | 长度前缀帧 | `B/05-tcp-frame.mjs` |
| [B06 HTTP 进阶](./B/06-http-advanced.md) | 路由、JSON、体积上限 | `B/06-http-router.mjs` |
| [B07 HTTP 客户端](./B/07-fetch.md) | 失败重试 | `B/07-fetch-retry.mjs` |
| [B08 定时器](./B/08-timers.md) | 钳制、`unref`、中止 | `B/08-timers.mjs` |
| [B09 子进程](./B/09-child-process.md) | 参数数组与 shell | `B/09-child-process.mjs` |
| [B10 密码学原语](./B/10-crypto.md) | 哈希、HMAC、scrypt | `B/10-crypto.mjs` |
| [B11 测试](./B/11-testing.md) | `node:test` | `B/11-sample.test.mjs` |
| [B12 配置](./B/12-config.md) | `process.loadEnvFile` | `B/12-env.mjs` |
| [B13 SQLite](./B/13-sqlite.md) | 预编译语句 | `B/13-sqlite.mjs` |
| [B14 SSE](./B/14-sse.md) | `text/event-stream` | `B/14-sse.mjs` |
| [B15 WebSocket](./B/15-websocket.md) | 最小握手与文本帧 | `B/15-websocket.mjs` |

## Part C 运行时

| 章 | 内容 | 示例 |
| --- | --- | --- |
| [C01 进程里有什么](./C/01-architecture.md) | V8、libuv、绑定层 | — |
| [C02 事件循环](./C/02-event-loop.md) | phase、两条队列 | `C/01` `C/02` |
| [C03 nextTick 与微任务](./C/03-queues.md) | CJS、ESM、async 的实测顺序 | `C/01` `C/02` `C/04` |
| [C04 定时器与 I/O 顺序](./C/04-timers-io.md) | 主模块不确定，I/O 回调里确定 | `C/03-io-order.mjs` |
| [C05 线程池与 DNS](./C/05-threadpool.md) | `UV_THREADPOOL_SIZE` | `C/05-threadpool.mjs` |
| [C06 内存与 GC](./C/06-memory.md) | `memoryUsage`、外部内存 | `C/06-memory.mjs` |
| [C07 流的另一面](./C/07-streams-deep.md) | Web Streams 互操作 | `C/07-pipeline.mjs` |
| [C08 异步上下文](./C/08-async-context.md) | `AsyncLocalStorage` | `C/08-als.mjs` |
| [C09 Worker](./C/09-workers.md) | 独立堆与共享内存 | `C/09-worker.mjs` |
| [C10 cluster](./C/10-cluster.md) | 多进程与句柄 | `C/10-cluster.mjs` |
| [C11 性能测量](./C/11-performance.md) | 事件循环延迟、mark | `C/11-perf.mjs` |
| [C12 模块图](./C/12-module-graph.md) | 循环依赖、TDZ | `C/12-*` |
| [C13 失败与取消](./C/13-failure.md) | 未处理拒绝、`AbortSignal` | `C/13-cancel-and-rejection.mjs` |
| [C14 能力边界](./C/14-boundaries.md) | 权限模型、类型剥离、扩展手段 | `C/14` `C/15` `C/16` |

## Part D 工程与系统设计

| 章 | 内容 | 示例 |
| --- | --- | --- |
| [D01 目录与边界](./D/01-structure.md) | 分层、依赖方向 | — |
| [D02 配置与十二要素](./D/02-twelve-factor.md) | 环境、密钥、覆盖规则 | `B/12-env.mjs` |
| [D03 日志](./D/03-logging.md) | 结构化日志与请求号 | `D/07-logger-als.mjs` |
| [D04 HTTP API](./D/04-api.md) | 状态码、幂等、错误体 | `B/06-http-router.mjs` |
| [D05 校验](./D/05-validation.md) | 运行时收紧输入 | `D/06-validation.mjs` |
| [D06 会话与 JWT](./D/06-auth.md) | HMAC 令牌，签名不是加密 | `D/02-jwt.mjs` |
| [D07 数据访问](./D/07-data.md) | 预编译、事务 | `B/13-sqlite.mjs` |
| [D08 限流](./D/08-ratelimit.md) | 令牌桶 | `D/01-token-bucket.mjs` |
| [D09 队列](./D/09-queues.md) | 可见性超时 | `D/03-queue.mjs` |
| [D10 优雅退出](./D/10-shutdown.md) | 停听、放完在途请求 | `D/04-graceful.mjs` |
| [D11 安全清单](./D/11-security.md) | 路径、命令、SQL、时序 | `D/08` `B/09` `B/10` |
| [D12 可观测性](./D/12-observability.md) | 日志、指标、追踪各自回答的问题 | `C/11-perf.mjs` |
| [D13 部署](./D/13-deployment.md) | 进程模型、反向代理、容器注意点 | `C/10-cluster.mjs` |
| [D14 系统设计题](./D/14-system-design.md) | 短链、上传、聊天、任务 | `D/05-short-url.mjs` |
| [D15 2026 选型](./D/15-choices.md) | 版本线、框架、本仓库另一条实验线 | — |

## Part E 面试题库

从 [E00 怎么用这套题](./E/00-how.md) 开始。先讲满三分钟，再看参考答案。

| 文件 | 主题 |
| --- | --- |
| [E01 语言](./E/01-javascript.md) | 类型、闭包、`this`、拷贝 |
| [E02 模块与包](./E/02-modules.md) | ESM/CJS、semver、加载 |
| [E03 异步与事件循环](./E/03-event-loop.md) | 本教程最需要背熟实测顺序的一章 |
| [E04 Buffer、流、文件](./E/04-io.md) | 内存模型与背压 |
| [E05 网络与 HTTP](./E/05-http.md) | TCP、HTTP、SSE、WebSocket |
| [E06 进程与线程](./E/06-concurrency.md) | 子进程、cluster、Worker |
| [E07 内存与性能](./E/07-performance.md) | GC、测量、事件循环延迟 |
| [E08 安全](./E/08-security.md) | 注入、路径、JWT、时序 |
| [E09 工程与数据](./E/09-engineering.md) | 测试、配置、事务、退出 |
| [E10 系统设计](./E/10-system-design.md) | 容量、一致性、Node 的位置 |
| [E11 手写题](./E/11-coding.md) | 池、LRU、重试、防抖、令牌桶 |
| [E12 追问与评分](./E/12-scoring.md) | 面试官在听什么 |

## 和仓库里另一套实验的关系

根目录 `learning-guide.md` 描述的是按专题切片的 TypeScript 实验：工具链、类型、事件循环、流、网络、进程、数据、框架、AI 原语。那些目录仍是可运行的实验场。

本教程走完整的中文主线，示例尽量只用 Node 内置模块，方便在没有安装依赖时阅读和运行。框架（Fastify、Nest）、Zod、MCP 仍以原专题实验为准，本教程在 D15 说明它们适合放在哪一层。
