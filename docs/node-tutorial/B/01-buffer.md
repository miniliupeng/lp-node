# B01 Buffer 与编码

对应示例：[`examples/node-tutorial/B/01-buffer.mjs`](../../../examples/node-tutorial/B/01-buffer.mjs)

## Buffer 是什么

`Buffer` 是 Node 对一块固定长度字节的视图，基于 `Uint8Array`。它表示文件、网络、加密里的字节，不是字符串。

字符串要进入 Buffer，必须指定编码。`Buffer.from(text, 'utf8')` 按 UTF-8 编码。`'héllo'` 的 `length` 是 5（UTF-16 码元），UTF-8 字节长度是 6，因为 `é` 编码成两个字节。示例两边都断言了。

常用编码：`utf8`、`hex`、`base64`、`base64url`。`base64url` 用在 JWT 那一章，它不使用 `+`、`/` 和填充带来的 URL 麻烦。

## 分配

`Buffer.alloc(n)` 分配 n 个字节并填 0。示例检查 8 个字节全是 0。

`Buffer.allocUnsafe(n)` 不保证清零，可能含有先前用过的内存。示例只断言长度为 8，不断言内容。在把它写到进程外面（文件、网络、日志）之前，必须自己填满每一个字节。

小于 `Buffer.poolSize`（22.23.4 上是 8192）的 `allocUnsafe` 可能从共享池里切一块。池是为了减少小块分配。`allocUnsafeSlow` 绕过池。业务代码优先 `alloc`，除非你在一个已经证明分配成为热点的路径上，并且立刻覆盖全部字节。

## 共享与复制

`subarray(start, end)` 返回同一块内存上的视图。示例把 `abcdef` 的视图第 0 个字节改成 `0x5a`，原缓冲变成 `aZcdef`。

`Buffer.from(view)` 会复制字节。示例在副本上改第一个字节，原缓冲的第一个字节仍是 `0x61`（`a`）。

`Buffer.prototype.slice` 在这个版本里也是共享内存，和 `Uint8Array.prototype.slice`（复制）不一样。22.23.4 上调用它没有打印运行时弃用警告。新代码写 `subarray`，读代码的人不会把它当成复制。

`Buffer.concat([a, b])` 分配新缓冲并复制。示例把 `ab` 和 `cd` 拼成 `abcd`。

## 和 JSON

Buffer 不能直接 `JSON.stringify` 成字节。要传文本就先 `toString('utf8')` 或 `toString('base64')`。接收方按同一编码解回来。

## 自测

1. 字符串 `length` 和 `Buffer.byteLength(s, 'utf8')` 何时不同？出现非 ASCII 时，UTF-8 字节数可以大于 UTF-16 码元数；代理对则更复杂。比较长度时先定单位。
2. 为什么 `allocUnsafe` 不能直接发给客户端？里面可能有旧数据。
3. `subarray` 改一个字节，原缓冲会变吗？会。
