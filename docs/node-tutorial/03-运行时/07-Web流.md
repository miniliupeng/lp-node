# Web Streams

示例：`examples/C/07-pipeline.mjs`

Node 流和 Web Streams 可以互转：

```javascript
import { Readable } from 'node:stream';
const web = Readable.toWeb(Readable.from(['你好', 'Node']));
const text = await new Response(web).text();
```

示例断言结果是 `你好Node`。`Readable.fromWeb` 把 Web 可读流转回 Node 流。

同一文件还演示 `Object.groupBy` 和迭代器的 `filter` / `take`。这些是语言能力，不是流的一部分，放在一起是为了确认 22.23.4 都有。

Web `ReadableStream` 的背压通过 `desiredSize` 和拉取算法表达。Node 流用 `write()` 的返回值和 `drain`。混用时让 `pipeline` 或 `toWeb` 负责适配，不要两边各缓冲一份无上限队列。

`zlib` 在这枚二进制上有 `zstdCompressSync` / `zstdDecompressSync`。压缩大响应时仍要走流，而不是同步压完整份正文。


## 是什么

Node 的 `stream` 和 Web 的 `ReadableStream` 是两套 API。`Readable.toWeb` / `Readable.fromWeb` 做转换。示例把 `['你好', 'Node']` 转成 Web 流，再用 `Response` 读回 `你好Node`。

背压的说法不同。Node 看 `write()` 的返回值和 `drain`。Web 流看 `desiredSize` 和拉取。混用时让转换函数负责，不要两边各放一个无上限队列。

同一文件还确认了 `Object.groupBy` 和迭代器的 `filter` / `take`。它们是语言能力，放在一起只是为了在 22.23.4 上一次断言。

`zlib` 有 `zstdCompressSync` / `zstdDecompressSync`。压缩大响应仍要走流。同步压完整份正文会堵住事件循环。

## 本章问答

### 1. 什么时候做转换，而不是重写消费者？

**考点：** 两套流的边界。

**回答：** 一端已经是 Web `fetch` 的正文，另一端是 Node 的文件流时，用 `toWeb` 或 `fromWeb`。不要为了接上而把整个正文读进字符串。

### 2. 为什么同步 zstd 不适合放在请求路径上？

**考点：** 主线程。

**回答：** `*Sync` 在返回前不让出主线程。大正文会让同一进程的其他请求停下。用异步或流式压缩，并给输出设上限。

### 3. groupBy 的返回值是对象还是 Map？

**考点：** 两个函数。

**回答：** `Object.groupBy` 返回普通对象，键会变成字符串。`Map.groupBy` 返回 `Map`，键可以保持原值。分组键如果是对象，用后者。

## 事故复盘

为了把 Web 流接到文件，先 `await response.text()` 再写入。大正文把字符串放进堆。用 `Readable.fromWeb` 或 `pipeline`，不要整份物化。

在请求里 `zstdCompressSync` 压 20MB 报表。事件循环停在这一调用上，其他请求的超时全部触发。压缩走流或异步 API。
