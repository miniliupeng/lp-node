# D15 2026 年怎么选

日期和版本表以 [版本说明](../00-versions-and-how-to-run.md) 为准。

## 运行时

2026-11-07：

- 新服务优先 **Node 26 Active LTS**（Lithium），上线前把你依赖的 API 在 26 上再跑一遍
- 22（Jod）处于 Maintenance，支持到 2027-04-30。本教程的断言是在 22.23.4 上做的
- 24（Krypton）处于 Maintenance，支持到 2028-04-30
- 27 此时是 Alpha。不把生产流量放上去
- 已经结束支持的版本（20 在 2026-04-30 结束）只作为迁移起点

锁定小版本或锁定镜像摘要，补丁升级走 CI 再发布。

## 语言

应用代码用 TypeScript，CI 里跑 `tsc --noEmit`。Node 22 的类型剥离让 `node file.ts` 能跑起来，但它不检查类型，也不接受 `enum`。构建步骤仍然负责要改写的语法。

教程示例用 JavaScript，是为了 `node 文件` 就能验证，不把 tsx 当成运行时的一部分。

## 框架

- 一个内部服务、路由很少：`node:http` 足够，本教程的示例就是这条路
- 需要插件、校验和性能：Fastify。仓库 `07-modern-web-frameworks/01-fastify-core-and-plugins` 讲它的封装作用域
- 需要依赖注入和固定分层：Nest。同目录下的 IoC 实验讲容器和拦截器
- 框架解决结构，不改变事件循环、背压和线程池。那些仍按 Part C 理解

## 数据与校验

边界校验用 Zod 或同等库（仓库阶段 06）。SQLite 适合嵌入式和测试。`node:sqlite` 在 22.23.4 仍是实验模块。多实例服务使用独立的数据库，而不是每台机器一份文件。

## 测试

`node:test` 和 `node:assert/strict` 够用。模拟时钟时注入函数，不依赖仍在实验的 `mock.timers`。集成测试起真实的本机服务器，像教程示例那样在 `finally` 里 `close()`。

## 观察与发布

日志走 stdout 的 JSON。指标至少有延迟分位数和事件循环延迟。发布用滚动替换和向后兼容的迁移（D13）。

## 学完本教程之后

回到仓库根目录的专题实验，把同一概念放进 TypeScript 和框架里再做一遍：事件循环、流、cluster、JWT、MCP。两条线互相参照，不需要删掉任何一边。
