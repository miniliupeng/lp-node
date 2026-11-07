# C06 内存与垃圾回收

对应示例：[`examples/node-tutorial/C/06-memory.mjs`](../../../examples/node-tutorial/C/06-memory.mjs)

## 两块账

`process.memoryUsage()`：

| 字段 | 含义 |
| --- | --- |
| `rss` | 进程驻留内存，包含堆、栈、共享库和外部内存 |
| `heapTotal` / `heapUsed` | V8 管理的 JS 堆 |
| `external` | 绑在 JS 对象上、但在 V8 堆外的内存 |
| `arrayBuffers` | `ArrayBuffer` 和 `Buffer` 占用的部分 |

示例分配 1_000_000 字节的 `Buffer.alloc`，断言分配之后 `arrayBuffers` 变大，并且第一个字节是 0。Buffer 的字节不在 `heapUsed` 里逐字节存放。只看 `heapUsed` 会漏掉大块缓冲。

`v8.getHeapStatistics().heap_size_limit` 是 V8 老生代堆的上限。示例断言它大于当前已用堆。可用 `--max-old-space-size`（单位 MB）调整。到达上限且回收不出空间时，进程抛出堆内存不足并退出。

## V8 怎么回收

V8 把堆分成新生代和老生代。

- 新生代用清除（scavenge）：对象先活在这里，挺过回收的再晋升。
- 老生代用标记-清除-整理。标记可以增量、并发地进行，减少一次停顿的时间。

这些线程是 V8 的，不是给你跑 JavaScript 的。主线程在某些回收步骤上仍会短暂停顿。`perf_hooks.monitorEventLoopDelay` 能看到停顿反映到事件循环延迟上，见 C11。

不要在生产代码里调用 `global.gc()`。那要启动时加 `--expose-gc`，而且会打乱回收节奏。

## 常见的堆增长

- 全局数组只加不删，例如把每个请求体留在内存里做“临时日志”
- 缓存没有上限。LRU 的一种写法在 [`E/02-lru.mjs`](../../../examples/node-tutorial/E/02-lru.mjs)
- 闭包抓住了大对象，定时器又把闭包留住
- `EventEmitter` 监听器没有移除
- 在请求路径上拼接越来越大的字符串或 Buffer

排查时看趋势：`rss` 和 `arrayBuffers` 是否随请求数单调上升，请求停止后是否回落。一次快照说明不了泄漏。检查器可以抓堆快照；Node 也有 `--heapsnapshot-near-heap-limit` 这类启动参数，用来在接近上限时自动抓。抓到的快照含业务数据，按敏感数据处理。

## 自测

1. 为什么大 Buffer 不一定让 `heapUsed` 同幅度上涨？字节在 V8 堆外，记在 `arrayBuffers` / `external`。
2. 新生代回收的名字是什么？scavenge。
3. 无上限的 `Map` 缓存会怎样？`rss` 随条目增长，直到堆上限。
