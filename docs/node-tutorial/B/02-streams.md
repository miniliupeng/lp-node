# B02 流与背压

对应示例：[`examples/node-tutorial/B/02-backpressure.mjs`](../../../examples/node-tutorial/B/02-backpressure.mjs)。Web Streams 互操作在 [`C/07-pipeline.mjs`](../../../examples/node-tutorial/C/07-pipeline.mjs)。

## 四种流

- `Readable`：数据从这里出来。文件读取、HTTP 请求。
- `Writable`：数据往这里去。文件写入、HTTP 响应。
- `Duplex`：两边都有。TCP 套接字。
- `Transform`：读进来、变一变、写出去。压缩、哈希。

默认模式下块是 `Buffer` 或字符串。`objectMode: true` 时块是任意 JavaScript 值，`highWaterMark` 的单位变成对象个数。

## 背压

生产速度可以快过消费速度。流用内部缓冲和 `highWaterMark` 表达“先别写了”。

`writable.write(chunk)` 返回 `false` 时，表示内部缓冲已经达到水位，调用方应等待 `'drain'` 再继续写。返回 `true` 表示还可以继续。

示例把 `highWaterMark` 设为 1，连续写 `'a'` 和 `'b'`，并断言两次返回值里至少有一次是 `false`。每个 `write` 的回调延迟 5ms，用来模拟慢消费者。`'drain'` 之后 `end()`，最终两个块都写到了。

如果不管返回值，一直 `write`，缓冲会涨到占满内存。这就是没有背压的流式上传或日志管道会出的事故。

## pipeline

`stream.promises.pipeline(source, dest)` 把流接起来，转发错误，并在失败时销毁相关流。示例让 writable 的回调收到 `new Error('write failed')`，`pipeline` 的 Promise 以这条错误拒绝。

手动 `pipe` 时，错误不会自动从上游传到下游，你要自己监听。新代码用 `pipeline`。

## 读的两种模式

- 暂停模式：调用 `read()`，或用 `for await`。
- 流动模式：注册 `'data'` 监听器后开始自动吐数据。

`'data'` 一注册就会开始消费。如果那时还没准备好写下游，数据只能堆在你自己的数组里。让 `pipeline` 负责节奏。

## 自测

1. `write` 返回 `false` 之后应该做什么？等待 `'drain'`。
2. `pipeline` 比 `pipe` 多做了什么？把错误变成拒绝，并销毁流。
3. `highWaterMark` 是硬上限吗？它是提醒调用方减速的水位，不是一个不可越过的内存配额。继续写仍可能成功，缓冲继续增长。
