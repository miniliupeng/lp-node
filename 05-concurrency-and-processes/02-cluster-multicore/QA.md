# 大厂高频面试题精讲 (02-cluster-multicore)

---

### Q1: 多个 Cluster Worker 进程为什么可以同时写 `server.listen(3000)`，而不会报端口被占用冲突（`EADDRINUSE`）？

#### 🎯 面试官考点
- 操作系统的文件描述符传递（File Descriptor Passing）与主从代理拦截机制。

#### 💡 满分回答模板
1. **本质：瞒天过海的拦截劫持**：
   - 当在 Worker 进程中调用 `server.listen(3000)` 时，Node.js 底层**根本没有直接向操作系统内核发起真正的 `bind` 和 `listen` 系统调用**！
   - Worker 进程的 `net` 模块检测到自己当前处于集群子进程状态，它会悄悄通过内部 IPC 管道向 Primary（Master）主进程发送一条内部指令：`"queryServer"`。
2. **句柄分发模型**：
   - 真正向操作系统调用 `bind(3000)` 和 `listen(3000)` 并创建监听 Socket 句柄的，**从始至终只有 Primary 主进程一个人**！
   - 当外部 HTTP 请求到来时，主进程的监听 Socket 触发连接，主进程将接收到的连接 Socket 句柄（文件描述符 FD）通过跨进程 IPC 管道直接“移交（Pass Handle）”给其中一个空闲的 Worker 进程去读取解析，因此绝对不会产生端口竞争冲突。

---

### Q2: Cluster 模块支持哪些请求分发策略？Node.js 默认使用的是哪种？

#### 🎯 面试官考点
- 轮询调度（Round-Robin）与操作系统的抢占惊群问题。

#### 💡 满分回答模板
Node.js 提供了两种调度策略（可通过 `cluster.schedulingPolicy` 调整）：
1. **Round-Robin 轮询分发策略（默认，推荐！）**：
   - 主进程统一接收所有的外部新连接，内部维护一个 Worker 循环队列，按顺序依次将连接分发给下一个 Worker。
   - *优势*：负载极其均匀，有效防止个别 Worker 被饿死或过载。在除 Windows 以外的所有系统上默认启用。
2. **操作系统抢占分发（OS Shared Socket）**：
   - 主进程创建监听 Socket 后，直接将底层的 Socket 句柄复制给所有 Worker，让所有 Worker 进程一起去操作系统的 `accept()` 系统调用中争抢进来的新连接。
   - *致命缺点（惊群效应与负载严重失衡）*：在 Linux 调度下，通常只有 2~3 个最活跃的 Worker 能抢到 70% 以上的流量，其余子进程长期闲置，因此官方放弃了该模式作为默认。

---

### Q3: 生产环境中，PM2 的 Cluster 模式是如何实现“零停机平滑重载（Zero-Downtime Reload）”的？

#### 🎯 面试官考点
- 蓝绿发布思想、优雅下线配合滚动更新在进程维度的应用。

#### 💡 满分回答模板
PM2 的 `pm2 reload all` 实现零停机更新的标准步骤：
1. **逐个滚动替换（Rolling Restart）**：假设启动了 4 个 Worker，PM2 绝不一次性全部杀死，而是**一次只操作一个 Worker**；
2. **先衍生新版本 Worker**：针对 Worker 1，PM2 先调用 `cluster.fork()` 启动一个运行了最新代码的临时 Worker 1-new；
3. **等待新 Worker 成功监听就绪**：监听新 Worker 的 `listening` 事件，确认它已经完全加载完所有数据库配置并准备好接客；
4. **平稳下线老 Worker**：向老 Worker 1 发送断开信号（`disconnect()`），让老 Worker 停止接收新连接并消化完当前在途请求后平稳退出；
5. **循环往复**：随后依次对 Worker 2、3、4 重复上述步骤。整个发布期间，始终有至少 3 个 Worker 在全负荷对外提供正常服务，实现**真正的无感零停机发布**。
