# 教程目录

假设运行时是 **Node.js 22.23.4**。版本窗口和已核对的 API 见 [版本](./00-版本.md)。示例在仓库的 `examples/`，文件名保持英文，用 `node examples/run-all.mjs` 一次跑完。

章节目录和 Markdown 文件名用中文。阅读顺序仍是 A → E，对应下面五个目录：

```text
01-入门 → 02-进阶 → 03-运行时 → 04-工程与系统设计 → 05-面试题库
```

## A 入门

| 章 | 文件 | 示例 |
| --- | --- | --- |
| 运行时与第一个程序 | [运行时](./01-入门/01-运行时.md) | `examples/A/01-hello.mjs` |
| 值与相等 | [值与相等](./01-入门/02-值与相等.md) | `examples/A/02-values.mjs` |
| 函数、闭包、this | [函数闭包与 this](./01-入门/03-函数闭包与this.md) | `examples/A/03-functions.mjs` |
| 集合与 JSON | [集合与 JSON](./01-入门/04-集合与JSON.md) | `examples/A/04-json.mjs` |
| 错误 | [错误](./01-入门/05-错误.md) | `examples/A/05-errors.mjs` |
| 模块 | [模块](./01-入门/06-模块.md) | `examples/A/06-modules.mjs` |
| 包与版本范围 | [包与版本](./01-入门/07-包与版本.md) | `examples/A/07-semver.mjs` |
| 进程与路径 | [进程与路径](./01-入门/08-进程与路径.md) | `examples/A/08-path-process.mjs` |
| 文件 | [文件](./01-入门/09-文件.md) | `examples/A/09-fs.mjs` |
| 异步 | [异步](./01-入门/10-异步.md) | `examples/A/10-async.mjs`、`examples/A/15-promise-combinators.mjs` |
| 事件 | [事件](./01-入门/11-事件.md) | `examples/A/11-events.mjs` |
| HTTP | [HTTP](./01-入门/12-HTTP.md) | `examples/A/12-http.mjs` |
| 断言与调试 | [断言与调试](./01-入门/13-断言与调试.md) | `examples/A/13-assert.mjs` |
| 类型收窄 | [类型收窄](./01-入门/14-类型收窄.md) | `examples/A/14-guards.mjs` |
| 工具类型与 satisfies | [工具类型与 satisfies](./01-入门/15-工具类型与satisfies.md) | 编译期，不在 `run-all` 里执行 |

## B 进阶

| 章 | 文件 | 示例 |
| --- | --- | --- |
| Buffer | [字节与 Buffer](./02-进阶/01-字节与Buffer.md) | `examples/B/01-buffer.mjs` |
| 流与背压 | [流与背压](./02-进阶/02-流与背压.md) | `examples/B/02-backpressure.mjs` |
| 原子替换文件 | [原子替换文件](./02-进阶/03-原子替换文件.md) | `examples/B/03-atomic-write.mjs` |
| URL | [URL](./02-进阶/04-URL.md) | `examples/B/04-url.mjs` |
| TCP 定界 | [TCP 定界](./02-进阶/05-TCP定界.md) | `examples/B/05-tcp-frame.mjs` |
| HTTP 路由与正文 | [HTTP 路由与正文](./02-进阶/06-HTTP路由与正文.md) | `examples/B/06-http-router.mjs` |
| fetch 与重试 | [fetch 与重试](./02-进阶/07-fetch与重试.md) | `examples/B/07-fetch-retry.mjs` |
| 定时器 | [定时器](./02-进阶/08-定时器.md) | `examples/B/08-timers.mjs` |
| 子进程 | [子进程](./02-进阶/09-子进程.md) | `examples/B/09-child-process.mjs` |
| 密码学原语 | [密码学](./02-进阶/10-密码学.md) | `examples/B/10-crypto.mjs` |
| node:test | [测试](./02-进阶/11-测试.md) | `examples/B/11-sample.test.mjs` |
| 环境变量 | [环境变量](./02-进阶/12-环境变量.md) | `examples/B/12-env.mjs` |
| SQLite | [SQLite](./02-进阶/13-SQLite.md) | `examples/B/13-sqlite.mjs` |
| SSE | [服务器发送事件](./02-进阶/14-服务器发送事件.md) | `examples/B/14-sse.mjs` |
| WebSocket | [WebSocket](./02-进阶/15-WebSocket.md) | `examples/B/15-websocket.mjs` |

## C 运行时

| 章 | 文件 | 示例 |
| --- | --- | --- |
| 进程里的三层 | [进程结构](./03-运行时/01-进程结构.md) | `examples/A/01-hello.mjs` |
| 事件循环阶段 | [事件循环](./03-运行时/02-事件循环.md) | `examples/C/01-event-loop-cjs.cjs`、`examples/C/03-io-order.mjs` |
| nextTick 与微任务 | [任务队列](./03-运行时/03-任务队列.md) | `examples/C/01-event-loop-cjs.cjs`、`examples/C/02-event-loop-mjs.mjs`、`examples/C/04-async-order.cjs` |
| 定时器与 I/O 顺序 | [定时与读写顺序](./03-运行时/04-定时与读写顺序.md) | `examples/C/03-io-order.mjs` |
| 线程池与 DNS | [线程池与 DNS](./03-运行时/05-线程池与DNS.md) | `examples/C/05-threadpool.mjs` |
| 内存 | [内存](./03-运行时/06-内存.md) | `examples/C/06-memory.mjs` |
| Web Streams | [Web 流](./03-运行时/07-Web流.md) | `examples/C/07-pipeline.mjs` |
| 异步上下文 | [异步上下文](./03-运行时/08-异步上下文.md) | `examples/C/08-als.mjs` |
| Worker | [工作线程](./03-运行时/09-工作线程.md) | `examples/C/09-worker.mjs` |
| cluster | [多进程](./03-运行时/10-多进程.md) | `examples/C/10-cluster.mjs` |
| 测量 | [性能测量](./03-运行时/11-性能测量.md) | `examples/C/11-perf.mjs` |
| 循环依赖 | [循环依赖](./03-运行时/12-循环依赖.md) | `examples/C/12-circular-main.mjs`、`examples/C/12-cjs-main.cjs` |
| 拒绝与取消 | [拒绝与取消](./03-运行时/13-拒绝与取消.md) | `examples/C/13-cancel-and-rejection.mjs` |
| 权限与类型剥离 | [权限与类型剥离](./03-运行时/14-权限与类型剥离.md) | `examples/C/14-permission.mjs`、`examples/C/15-types-strip.mjs`、`examples/C/16-message-channel.cjs` |
| nextTick 饥饿 | [定时器](./02-进阶/08-定时器.md) | `examples/C/17-nexttick-starve.cjs` |

## D 工程与系统设计

| 章 | 文件 | 示例 |
| --- | --- | --- |
| 目录与边界 | [目录与边界](./04-工程与系统设计/01-目录与边界.md) | |
| 配置 | [配置](./04-工程与系统设计/02-配置.md) | `examples/B/12-env.mjs` |
| 日志 | [日志](./04-工程与系统设计/03-日志.md) | `examples/D/07-logger-als.mjs` |
| HTTP API | [HTTP 接口](./04-工程与系统设计/04-HTTP接口.md) | `examples/B/06-http-router.mjs` |
| 校验 | [校验](./04-工程与系统设计/05-校验.md) | `examples/D/06-validation.mjs` |
| 会话与 JWT | [会话与 JWT](./04-工程与系统设计/06-会话与JWT.md) | `examples/D/02-jwt.mjs` |
| 数据访问 | [数据访问](./04-工程与系统设计/07-数据访问.md) | `examples/B/13-sqlite.mjs` |
| 限流 | [限流](./04-工程与系统设计/08-限流.md) | `examples/D/01-token-bucket.mjs` |
| 队列 | [队列](./04-工程与系统设计/09-队列.md) | `examples/D/03-queue.mjs` |
| 优雅退出 | [优雅退出](./04-工程与系统设计/10-优雅退出.md) | `examples/D/04-graceful.mjs` |
| 安全 | [安全](./04-工程与系统设计/11-安全.md) | `examples/D/08-safe-path.mjs` |
| 可观测性 | [可观测性](./04-工程与系统设计/12-可观测性.md) | `examples/C/11-perf.mjs` |
| 部署 | [部署](./04-工程与系统设计/13-部署.md) | |
| 系统设计 | [系统设计](./04-工程与系统设计/14-系统设计.md) | `examples/D/05-short-url.mjs` |
| 2026 选型 | [2026 选型](./04-工程与系统设计/15-2026选型.md) | |
| 洋葱中间件 | [洋葱中间件](./04-工程与系统设计/16-洋葱中间件.md) | `examples/D/09-compose.mjs` |
| 路由树与序列化 | [路由树与序列化](./04-工程与系统设计/17-路由树与序列化.md) | |
| 依赖注入与切面 | [依赖注入与切面](./04-工程与系统设计/18-依赖注入与切面.md) | `examples/D/10-di.mjs` |
| 模型上下文协议 | [模型上下文协议](./04-工程与系统设计/19-模型上下文协议.md) | `examples/D/11-mcp.mjs` |
| 流式生成与取消 | [流式生成与取消](./04-工程与系统设计/20-流式生成与取消.md) | `examples/D/12-sse-cancel.mjs` |

## E 面试题库

先看 [使用方式](./05-面试题库/00-使用方式.md)。每题都有题目、难度、考察点、参考答案、易错点和追问。先讲三分钟，再对照答案。

| 文件 | 主题 |
| --- | --- |
| [语言](./05-面试题库/01-语言.md) | 值、相等、this、JSON |
| [模块与包](./05-面试题库/02-模块与包.md) | ESM、CJS、类型剥离 |
| [事件循环](./05-面试题库/03-事件循环.md) | 阶段、队列、拒绝 |
| [字节流与文件](./05-面试题库/04-字节流与文件.md) | Buffer、流、定界 |
| [网络](./05-面试题库/05-网络.md) | HTTP、fetch、SSE、WebSocket |
| [进程与线程](./05-面试题库/06-进程与线程.md) | 子进程、Worker、cluster |
| [内存与性能](./05-面试题库/07-内存与性能.md) | 堆、事件循环延迟 |
| [安全](./05-面试题库/08-安全.md) | 注入、路径、JWT |
| [工程](./05-面试题库/09-工程.md) | 配置、日志、退出、测试 |
| [系统设计](./05-面试题库/10-系统设计.md) | 限流、队列、短链 |
| [手写题](./05-面试题库/11-手写题.md) | 池、LRU、重试、防抖 |
| [追问与评分](./05-面试题库/12-追问与评分.md) | 怎么区分背诵和理解 |
