# C10 cluster

对应示例：[`examples/node-tutorial/C/10-cluster.mjs`](../../../examples/node-tutorial/C/10-cluster.mjs)

## 多个进程听一个端口

`node:cluster` 的主进程 `fork` 出 Worker 进程。Worker 调用 `server.listen(同一端口)` 时，实际的监听句柄由主进程协调分发。进程之间不共享 JavaScript 堆。

示例只 fork 一个 Worker，让它 `listen(0)`，通过 IPC `process.send` 把端口送回来。主进程用 `http.get` 且 `agent: false`（不复用连接）请求一次，正文匹配 `pid:<数字>`，然后 `SIGTERM`。Worker 在 `SIGTERM` 上 `server.close` 再退出。

这证明了：能拉起 Worker、能通信、能关掉。它没有证明多核吞吐。

## 调度

非 Windows 上默认调度策略是轮询（`SCHED_RR`）：主进程按顺序把连接分给 Worker。Windows 上由操作系统分发共享句柄。长连接（WebSocket）会一直占住第一次分到的那个进程，之后的消息不会重新轮询。

多个 Worker 都在 `listen` 同一个端口时，本机回环上的短连接会按轮询分散。`fetch` 默认可能复用连接，看起来像“总打到同一个 Worker”。测量时要关闭 keep-alive，示例里的 `agent: false` 就是这个原因。

## 和容器的关系

一台机器上用 cluster 吃满几个核，是一种做法。容器编排里更常见的做法是一个容器一个进程，由编排器扩容副本，前面有负载均衡。那样崩溃隔离更清楚，滚动发布也不依赖主进程拉起 Worker。

cluster 的主进程死了，Worker 一起没。编排器会重启整个容器。两种模型选一个当作“谁负责拉起进程”，避免 cluster、进程管理器和编排器同时重启同一份服务。

## 状态

会话如果放在进程内存里，下一个请求落到另一个 Worker 就找不到会话。状态放在进程外面（数据库、缓存），或使用粘性会话并接受负载不均。内存里的限流计数器同样只在一个进程里有效，见 D08。

## 自测

1. Worker 之间能共享一个 `Map` 吗？不能，它们是不同进程。
2. 为什么长连接不按消息轮询？连接建立时分一次，之后字节都在这条连接上。
3. `agent: false` 在示例里做什么？避免 HTTP 客户端复用连接，从而每次都是新连接。
