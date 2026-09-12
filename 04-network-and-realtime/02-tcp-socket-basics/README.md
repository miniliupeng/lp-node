# 02-tcp-socket-basics: TCP Socket 基础与粘包半包场景初探

HTTP 建立在 TCP 之上。如果不理解底层 TCP 的“面向字节流”特征，在设计长连接、自定义私有 RPC 协议或 IoT 物联网网关时，就会遭遇灾难性的数据错乱。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`node:net`**：Node.js 原生提供的 TCP 传输层套接字（Socket）模块。
- **TCP“面向字节流（Byte Stream）”**：TCP 协议只负责把一连串无序的 0 和 1 字节流可靠地运送到对端，**它根本不知道、也不关心你的应用层业务消息边界**！
- **粘包 (Packet Sticking)**：发送端连续发送了 `{"id":1}` 和 `{"id":2}`，由于 Nagle 算法优化或滑动窗口合并，接收端在一次 `socket.on('data')` 里收到了 `{"id":1}{"id":2}`。
- **半包 (Packet Splitting)**：发送了一个较大的数据，接收端分了两次才收完整。

### 2. 为什么需要搞透它？
- 如果你在接收端直接写 `JSON.parse(chunk.toString())`，一旦发生粘包，`JSON.parse('{"a":1}{"b":2}')` 会瞬间抛出语法错误崩溃！必须在应用层设计**封包定界规约**。

### 3. 日常工作中怎么用？
- 方案 A（简单文本）：**行分隔符定界**（每条消息末尾强制加 `\n`）；
- 方案 B（企业级二进制 RPC）：**TLV / 消息头指定长度**（前 4 个字节存 Body 长度，后面跟 Body 内容）。

---

## 🔬 核心代码切片

```typescript
import { createServer } from "node:net";

const server = createServer((socket) => {
  let buffer = "";
  socket.on("data", (chunk) => {
    buffer += chunk.toString();
    // 使用 \n 换行符作为应用层消息定界符，安全拆解粘包
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // 保留未收完整的半包
    for (const message of lines) {
      console.log(`收到完整消息: ${message}`);
    }
  });
});
```

---

## 🖥️ 控制台预期输出快照

```text
=== TCP Socket 通信与消息定界实战 ===
1. 原生 TCP 服务端启动成功，监听端口: 127.0.0.1:xxxxx
2. 客户端连续快速推送 3 条紧凑消息 (模拟 TCP 字节流粘包合并)
   -> 客户端发送: "MSG-1\n", "MSG-2\n", "MSG-3\n"
3. 服务端收到原始底层数据块 (发生粘包合并):
   [底层 raw 字节流]: "MSG-1\nMSG-2\nMSG-3\n"
4. 通过 \n 换行符协议安全拆解提取各消息:
   ✔ 成功解包消息 1: "MSG-1"
   ✔ 成功解包消息 2: "MSG-2"
   ✔ 成功解包消息 3: "MSG-3"
5. TCP 通信完成，客户端与服务端正常关闭连接
=====================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 04-network-and-realtime/02-tcp-socket-basics/main.ts
```
