# 大厂高频面试题精讲 (03-capstone-pipeline-orchestration)

---

### Q1: 如果让你从 0 到 1 架构一个日均千万级请求的高可用 Node.js 服务端系统，你会如何设计全链路架构？

#### 🎯 面试官考点
- 考察全栈架构全局视野、分层解耦能力与生产高可用韧性（Resilience Engineering）。

#### 💡 满分回答模板
一个标准的千万级高可用 Node.js 生产架构应划分为以下五层防御体系：
1. **流量接入与接入网关层**：
   - 最外层使用 Cloudflare / CDN 进行静态资源加速与 DDoS 防护；
   - 接入层采用 Nginx 或 K8s Ingress Controller，实现 SSL 卸载、动态负载均衡（Round-Robin）与全量 gzip/brotli 压缩。
2. **计算与进程管理层**：
   - 采用 Docker 容器化部署在 Kubernetes (K8s) 上；每个 Pod 内部可结合 PM2 或多核 Cluster，压榨单机算力；
   - 配置严格的健康检查探针：存活探针（Liveness Probe）与就绪探针（Readiness Probe），配合标准的 **优雅停机（Graceful Shutdown）** 机制。
3. **数据接入与安全防护层**：
   - 使用 Fastify / NestJS 搭配 **Zod 进行强类型运行时数据入参净化**，严防注入；
   - 使用 **AsyncLocalStorage** 贯穿全链路，将网关生成的 `traceId` 自动无感透传给所有日志、RPC 调用与 SQL 操作。
4. **数据治理与缓存层**：
   - 建立多级缓存架构：本地内存缓存（LRU Cache，设硬上限防 OOM） + 分布式 Redis 哨兵/集群；
   - 数据库连接配置连接池上限（Max Connections），针对大文件读写和报表全量使用 **Stream 背压流式传输**。
5. **可观测性与监控告警（Observability）**：
   - 接入 Prometheus + Grafana 实时监控 Event Loop Lag（事件循环延迟）、V8 堆内存使用率（Heap Used）与 QPS；
   - 收集链路追踪（OpenTelemetry / Jaeger），一旦出现慢请求或错误率飙高立即飞书/钉钉告警。

---

### Q2: 在生产环境中，如果 Node.js 进程发生“内存泄漏（Memory Leak）”或“CPU 飙高 100%”，请详述系统性排查的标准 SOP 流程。

#### 🎯 面试官考点
- 生产故障排查（Troubleshooting）硬实力、Chrome DevTools 性能分析与 Heap Snapshot 内存快照比对。

#### 💡 满分回答模板
1. **排查内存泄漏（Memory Leak）的黄金 4 步法**：
   - **步骤 1：观察指标确认泄漏**：在 Grafana 查看 `process.memoryUsage().heapUsed`，如果呈波浪式锯齿上升（GC 之后依然无法回落，最低点持续攀升），说明必定存在泄漏。
   - **步骤 2：生成堆转储快照（Heap Snapshot）**：在问题容器中通过 Node.js 内置的 `v8.writeHeapSnapshot()` 导出快照；或者启动时带上 `--inspect`，通过 Chrome 浏览器 `chrome://inspect` 连接生产节点。
   - **步骤 3：三倍快照对比法（Three-Snapshot Technique）**：在流量平稳时采集快照 1；5 分钟后再采集快照 2；再过 5 分钟采集快照 3。在 DevTools 的 **Comparison（对比视图）** 中，重点筛选“在快照 1 和快照 2 之间分配、且到快照 3 依然没有被回收的对象”。
   - **步骤 4：排查常见元凶**：
     - ① 全局变量或未限制容量的 Map/Set 缓存；
     - ② 未解绑的事件监听器（`emitter.on` 漏调 `off`）；
     - ③ 闭包变量引用滞留；
     - ④ 大体积 Buffer 的 `subarray` 导致底层整块物理内存无法释放。
2. **排查 CPU 飙高 100% 的 SOP**：
   - **定位线程**：通过 `top -H -p <pid>` 确认是主执行线程飙高（业务 JS 逻辑）还是 libuv 线程池飙高（加解密/文件读写）；
   - **生成 CPU Profile**：使用 Node.js 自带的 `--cpu-prof` 或通过 Inspect 抓取 **CPU Profiler Flame Graph（火焰图）**；
   - **定位热点函数**：在火焰图中横向最宽的“平顶柱”就是耗费 CPU 时间最长的函数，常见原因：无终止条件的 `while` 死循环、超大数组的低效正则匹配（ReDoS 灾难性回溯）或在主线程执行复杂 JSON 序列化。

---

### Q3: 为什么说 Node.js 的“单线程异步非阻塞 + 事件驱动模型”在海量 I/O 并发场景下比传统多线程模型具有决定性优势？

#### 🎯 面试官考点
- 深入本质理解操作系统开销：线程栈物理内存、CPU 线程上下文切换（Context Switch）与系统调用。

#### 💡 满分回答模板
1. **内存开销的降维打击**：
   - **传统多线程模型（如早期的 Java/PHP 线程池）**：每个连接独占一个操作系统线程。每个物理线程在 OS 内核中默认需要开辟 **1MB~8MB 的独立调用栈内存**。支撑 10 万个并发连接，仅仅是为线程分配栈内存就需要 100GB~800GB 物理内存，普通服务器直接爆死！
   - **Node.js 单线程模型**：所有的并发网络连接共享一个主线程栈，底层由内核的 `epoll` 多路复用句柄支撑。一个连接在空闲时仅占用几 KB 的操作系统套接字缓冲区，单台机器轻松支撑数十万个长连接。
2. **CPU 上下文切换（Context Switching）的零损耗**：
   - 当成千上万个线程并发运行时，CPU 需要频繁地在内核态和用户态之间切换寄存器状态与 CPU 缓存（L1/L2 Cache 击穿），**大量的 CPU 时间白白浪费在“切换线程”这件事情上，而非执行真实业务**；
   - Node.js 主线程永远专注于按顺序执行事件循环中的就绪回调，**完全消除了线程竞争与线程切换开销**，CPU 跑满时每一转都在做真正的业务计算。

---

### Q4: 请用三句话总结一名优秀现代 Node.js 工程师在日常编码中必须坚守的“核心军规”。

#### 🎯 面试官考点
- 工程师综合素养与防御性编程肌肉记忆。

#### 💡 满分回答模板
1. **永远不要阻塞事件循环（Don't Block the Event Loop）**：任何耗时超过几毫秒的计算必须移入 `worker_threads` 或拆解为微任务异步切片，时刻保持主线程事件循环毫秒级畅通。
2. **永远使用流与背压处理大数据（Always Use Streams with Backpressure）**：面对不可预知大小的文件、网络请求、大数据集，严禁用 `readFile` 一次性吃进内存，坚决使用 `pipeline` 边读边写防 OOM。
3. **未经验证的输入皆为毒药（Never Trust External Input）**：在所有边界入口坚持使用 Zod 运行时强类型校验，杜绝 `as any` 掩耳盗铃，配合 `AsyncLocalStorage` 打造全链路可追踪、可观测的韧性系统。
