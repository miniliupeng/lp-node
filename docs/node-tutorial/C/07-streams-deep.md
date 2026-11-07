# C07 流的内部选择

对应示例：[`C/07-pipeline.mjs`](../../../examples/node-tutorial/C/07-pipeline.mjs)、背压示例 [`B/02-backpressure.mjs`](../../../examples/node-tutorial/B/02-backpressure.mjs)

## 缓冲单位

非对象模式的 `highWaterMark` 以字节计，默认 16 KiB 这一量级（可读与可写的默认值以当前版本文档为准，写代码时不要依赖“正好 16384”做协议）。对象模式以对象个数计。

示例 B02 把水位设成 1 字节，用来迫使 `write` 返回 `false`。生产代码用默认水位即可，除非你测量过内存。

## Web Streams

浏览器和 `fetch` 的正文使用 WHATWG 流。Node 流可以用：

```javascript
import { Readable } from 'node:stream';
import { text } from 'node:stream/consumers';

const web = Readable.toWeb(Readable.from(['你好', 'Node']));
const back = Readable.fromWeb(web);
await text(back); // 你好Node
```

`C/07-pipeline.mjs` 断言结果是 `你好Node`。从 `fetch` 读到的 `response.body` 是 Web 流。要接到文件可写流时，用 `Readable.fromWeb`，再交给 `pipeline`，这样背压仍然有效。

`node:stream/consumers` 的 `text` / `json` / `buffer` 会把整个流收进内存。大响应不要用它们，改为逐块处理。

## 错误

`pipeline` 在某一段失败时销毁流，并把错误传给 Promise。自己写 `pipe` 时要给每一段登记 `error`，否则错误会变成未捕获异常。

消费者中止时，把 `AbortSignal` 传给 `stream.addAbortSignal` 或支持 `signal` 的 API，让生产者停下来。只是停止读、不通知生产者，上游可能还在读文件或收网络数据。

## 对象模式

`objectMode` 的一“块”是一个值。它适合按记录处理，不适合当成字节协议。不要把对象模式的流直接接到 HTTP 响应上，响应需要字节。

## 自测

1. `Readable.toWeb` 解决什么问题？把 Node 可读流交给只接受 Web 流的 API。
2. `stream/consumers` 的 `text()` 适合大文件吗？不适合，它会读完整个流。
3. 背压信号是什么？`write` 返回 `false`，之后等待 `drain`。
