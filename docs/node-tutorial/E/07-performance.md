# E07 内存与性能

### Q1. `memoryUsage` 各字段是什么？

- 难度：中级
- 考察点：堆内与堆外
- 参考答案：`rss` 是进程驻留。`heapUsed` / `heapTotal` 是 V8 堆。`arrayBuffers` 和 `external` 记 Buffer 等堆外内存。示例分配 1MB 的 `Buffer.alloc` 后 `arrayBuffers` 上升。只监控 `heapUsed` 会漏掉大缓冲。
- 易错点：说 Buffer 的每个字节都在 `heapUsed` 里。
- 追问：堆上限？`v8.getHeapStatistics().heap_size_limit`，可用 `--max-old-space-size` 调整。

### Q2. V8 怎样回收？

- 难度：高级
- 考察点：分代
- 参考答案：新生代用 scavenge，活下来的对象晋升。老生代标记-清除-整理，标记可以增量、并发，用来缩短停顿。回收线程不执行你的 JavaScript。主线程在某些步骤上仍会停。不要在生产调用 `global.gc()`。
- 易错点：说 Node 不会停顿。
- 追问：泄漏长什么样？请求停止后 `rss` 不回落，堆快照里同一路径的对象数量随请求增长。一次快照不能下结论。

### Q3. 事件循环延迟怎么测？

- 难度：中级
- 考察点：`perf_hooks`
- 参考答案：`monitorEventLoopDelay` 的直方图单位是纳秒。延迟高且 CPU 高：看同步计算和 GC。延迟高且 CPU 低：看在等的 I/O 或占满的线程池。`performance.now()` 是单调时钟。`--prof` 用来看 CPU 时间在哪些函数。
- 易错点：用 `Date.now()` 的差当唯一指标，校时会让差变负。
- 追问：平均值为什么不够？它掩盖 p99。

### Q4. 无上限缓存会怎样？

- 难度：初级
- 考察点：资源上限
- 参考答案：`Map` 只增不删会把堆撑到上限。给容量上限，用 LRU 在超限时删掉最久未用的键。示例 `E/02-lru.mjs` 容量 2，访问 `a` 后再插入 `c`，`b` 被淘汰。生产缓存还要有过期时间，避免陈旧数据一直占着名额。
- 易错点：用进程内存缓存当跨副本的一致数据源。
- 追问：缓存失效？写路径删除对应键，或使用短 TTL。多副本各自的 LRU 会短时间不一致。

### Q5. 怎样判断进程为什么不退出？

- 难度：中级
- 考察点：活跃句柄
- 参考答案：事件循环里还有服务器、套接字或未 `unref` 的定时器。`process.getActiveResourcesInfo()` 列出类型。心跳定时器调用 `unref`。`server.close()` 之后还要关掉数据库句柄。
- 易错点：调用 `process.exit()` 掩盖未关闭的连接。
- 追问：`exit` 事件里能 `await` 吗？不能指望。`exit` 回调里只做同步工作。异步收尾放在 `beforeExit` 不可靠，因为只要还有句柄，`beforeExit` 不会触发。收尾放在信号处理器里显式做。
