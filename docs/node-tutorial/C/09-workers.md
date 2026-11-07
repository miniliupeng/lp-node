# C09 worker_threads

对应示例：[`examples/node-tutorial/C/09-worker.mjs`](../../../examples/node-tutorial/C/09-worker.mjs)

## 它是另一个 isolate

Worker 有自己的 V8 堆和自己的事件循环。主线程的变量不会出现在 Worker 里。通信靠消息，消息按结构化克隆算法复制，除非你转移或共享 `ArrayBuffer`。

示例在主线程里用 `isMainThread` 分支。Worker 使用同一个文件 URL 再启动一次，靠 `workerData.kind` 区分任务。不要用 `node -e` 的临时路径当 Worker 脚本，那种路径不能被再次加载。

求和任务把 `n: 10` 传进去，Worker 返回 55，然后退出码 0。这是 CPU 计算从主线程挪走的形状：主线程只负责收消息。

## 共享内存

`SharedArrayBuffer` 不会被复制。示例把它放进 `workerData`，Worker 用 `Atomics.store` 写成 42，主线程 `Atomics.load` 读到 42。

共享内存上的普通读写没有自动加锁。需要互斥时用 `Atomics.wait` / `Atomics.notify`，或只让一个线程写某一段。教程不展开自己发明锁。

`postMessage` 的第二个参数可以列出要转移的 `ArrayBuffer`。转移之后，发送方那个缓冲变为不可用，接收方独占它。`SharedArrayBuffer` 是共享，不是转移。

结构化克隆会丢掉方法。这和 `structuredClone` 的限制相同。不要把类实例当成 RPC 对象传进 Worker。

## 适合与不适合

适合：图像处理、压缩、加密、大 JSON 的解析，这些会占住主线程几十毫秒以上的 CPU 工作。

不适合：为每个请求开一个 Worker。创建 isolate 的成本远高于一次函数调用。池化少量 Worker，反复投递任务。

I/O 密集的服务通常先把逻辑写成异步 I/O。加 Worker 不会让数据库变快。

## 自测

1. Worker 能读到主线程的 `let` 吗？不能。
2. `SharedArrayBuffer` 和转移 `ArrayBuffer` 的差别？前者两边同时能访问，后者所有权移交。
3. 为什么不要按请求创建 Worker？创建 isolate 比处理请求贵。
