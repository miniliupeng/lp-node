# Buffer

示例：`examples/B/01-buffer.mjs`

`Buffer` 是 `Uint8Array` 的子类，表示一段字节。字符串要经过编码才变成字节。UTF-8 里 `héllo` 是 5 个 UTF-16 码元、6 个字节，示例断言这两项。

`Buffer.from('héllo', 'utf8')` 复制字符的编码。`Buffer.alloc(n)` 分配并填 0。`allocUnsafe` 可能含旧数据，写满之前不能当秘密或当响应发出去。

`Buffer.poolSize` 在 22.23.4 是 8192。小于这个尺寸的分配会从池里切一块。

`subarray` 与原 Buffer 共享内存，改一边另一边变。`Buffer.from(view)` 复制。`Buffer.prototype.slice` 也共享内存，22.23.4 上调用它没有警告。`Uint8Array.prototype.slice` 是复制。新代码用 `subarray`。

`Buffer.concat([a, b])` 分配新内存并把两段抄进去。TCP 分帧见[TCP 定界](./05-TCP定界.md)。

把二进制写进 JSON 时用 base64 或 base64url，并写明编码。默认 `toString()` 按 UTF-8 解码，非法序列会被替换。


## 是什么

`Buffer` 是 `Uint8Array` 的子类，字节放在 `ArrayBuffer` 里。V8 堆里通常只留一个很小的包装对象。`process.memoryUsage().arrayBuffers` 会计入这些字节，`heapUsed` 不会按同样的幅度上涨。`--max-old-space-size` 限制的是 V8 老生代堆，不是进程的 RSS，也不是容器内存上限。一块很大的 Buffer 仍然可以把进程打到被系统杀掉。

小于 `Buffer.poolSize`（22.23.4 上是 8192）的分配从池里切。池是进程内的，不是跨进程共享。

## alloc 和 allocUnsafe

`Buffer.alloc(n)` 填 0。`allocUnsafe` 不保证清零，里面可能是这块内存以前的内容。在小缓冲池上，那就是本进程早些时候的 Buffer。若只写入前 200 字节就把 1024 字节发出去，剩下的字节可能带上一次请求的碎片。不是极致热路径就用 `alloc`。用了 `allocUnsafe` 就必须在发出去之前写满，或先 `fill(0)`。

## 视图会留住整块内存

`subarray` 和 `Buffer#slice` 共享底层 `ArrayBuffer`。22.23.4 上调用 `Buffer#slice` 没有弃用警告。`Uint8Array#slice` 和 `Buffer.from(view)` 是复制。

从一块 100MB 的 Buffer 上 `subarray(0, 4)`，只要这 4 个字节还被缓存引用，整块 100MB 就不能回收。要长期留下一个小片段，用 `Buffer.from(huge.subarray(0, 4))`。

`héllo` 是 5 个 UTF-16 码元、6 个 UTF-8 字节。字符串 `length` 不是字节数。默认 `toString()` 按 UTF-8 解码，非法序列会被替换，不抛错。

## 本章问答

### 1. Buffer 在不在 V8 堆里？

**考点：** 堆和外部内存。

**回答：** 包装对象在堆里，字节在 `ArrayBuffer` 里，计入 `arrayBuffers`。老生代上限不按 RSS 计算。容器的内存限制仍然会杀掉进程。不要说 Buffer 完全不受任何内存限制。

### 2. 为什么 subarray 可能把大块内存留住？

**考点：** 视图和底层存储的生命周期绑在一起。

**回答：** 小视图引用整块 `ArrayBuffer`。只想留下 4 个字节时要复制。`Buffer#slice` 也是共享，和 `Uint8Array#slice` 的复制不是一回事。

### 3. allocUnsafe 的风险是什么？

**考点：** 未初始化内存。

**回答：** 未写满就发送，可能把旧字节发给客户端。小块来自本进程的池，不一定是别的进程的内存，但已经足够泄漏上一个请求的内容。默认用 `alloc`。

## 事故复盘

从上传的大缓冲切出 16 字节的头放进缓存，然后丢掉大缓冲的变量。`arrayBuffers` 不下降，因为 `subarray` 仍引用整块存储。缓存里改成 `Buffer.from(headerView)`。

`allocUnsafe` 分配 4KB，只写入令牌的 32 字节就发给客户端。其余字节来自池里上一次的内容。令牌和响应用 `alloc` 或写满再发送。

把 `Buffer` 当字符串做日志，二进制里的无效 UTF-8 被替换成 ``，排错时看见的不是原始字节。日志里对二进制用 `base64url` 或十六进制，并限制长度。
