# B15 最小 WebSocket 服务器

对应示例：[`examples/node-tutorial/B/15-websocket.mjs`](../../../examples/node-tutorial/B/15-websocket.mjs)

Node 22.23.4 有全局 `WebSocket` **客户端**，没有内置的 WebSocket 服务器。示例自己完成握手和文本帧，再用全局客户端去连它。这是教学实现：只处理完整到达的短文本，生产系统用经过广泛使用的库。

## 握手

客户端发送 `Upgrade: websocket` 和 `Sec-WebSocket-Key`。服务器计算：

```text
base64( sha1( key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" ) )
```

把结果放进 `Sec-WebSocket-Accept`，状态码 101。GUID 是 RFC 6455 规定的固定字符串。示例用 `createHash('sha1')` 计算。这里的 SHA-1 是协议规定的握手步骤，不是口令哈希。

头不够时，示例直接结束套接字并返回 400。

## 帧

客户端发来的帧带掩码，服务器发出的帧不带掩码。示例的 `readFrame`：

- 数据不够一帧就返回 `null`，把字节留在缓冲里
- 解出 opcode 和载荷
- 若有掩码，按 4 字节循环异或
- 拒绝超过 1 MiB 的声明长度

opcode：`0x1` 文本，`0x8` 关闭，`0x9` ping，`0xA` pong。示例对文本回复 `echo:` 加原文，对 ping 回 pong，对关闭帧回一个关闭帧并结束。

服务器帧的第一个字节是 `0x80 | opcode`（FIN 位加上 opcode）。长度小于 126 时用 1 个字节表示长度。

## 跑通的断言

客户端 `ws.send('hi')`，收到的文本是 `echo:hi`。消息体如果是 `Blob` 或 `ArrayBuffer`，示例会转成字符串再比较。

## 生产还要补的部分

- 分片帧（FIN 为 0）
- 关闭码和原因
- 每条消息的大小与每秒帧数限制
- 心跳超时后主动断开
- 反向代理的升级配置

水平扩展时，连接落在哪台机器上，消息就要能送到那台机器。单进程里的 `Map<userId, socket>` 在第二台机器上失效。设计见 [D14](../D/14-system-design.md)。

## 自测

1. `Sec-WebSocket-Accept` 是什么？`base64(sha1(key + GUID))`。
2. 为什么客户端帧带掩码？协议要求浏览器发出的帧掩码，避免中间盒把字节流误认成 HTTP。
3. Node 22 的全局 `WebSocket` 能 `listen` 吗？不能，它是客户端。
