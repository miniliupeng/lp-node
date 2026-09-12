# 阶段 04: 网络编程与实时通信通信

网络是服务端的命脉。现代 Web 框架虽然封装了便捷的 API，但在高并发长连接系统、自定义 RPC 协议开发或生产网络疑难故障（如连接泄漏、假死挂起）排查中，**原生网络原语是不可或缺的基石**。

---

## 💡 核心工程心智与传输层模型

1. **原生 HTTP/1.1 服务与流式解包**：
   - `http.IncomingMessage`（`req`）本质是可读流（`Readable`），客户端上传的 HTTP Body 是以数据分块形式到达的；
   - `http.ServerResponse`（`res`）本质是可写流（`Writable`），必须显式调用 `res.end()` 明确通知对端报文完成；
   - 掌握 Keep-Alive 长连接复用与超时防御参数（`keepAliveTimeout`, `headersTimeout`）。
2. **TCP Socket 传输与应用层定界 (Framing)**：
   - TCP 是面向连续字节流（Byte Stream）的传输层协议，协议栈本身没有应用层消息边界的概念；
   - 掌握多数据包合并传输引发的“粘包”与拆分传输引发的“半包”成因（MTU、Nagle 算法与滑动窗口）；
   - 实践基于特定分隔符（如 `\n`）与固定消息头（Length-Field / TLV）的应用层解包定界方案。
3. **WebSocket 长连接与心跳保活机制**：
   - 掌握基于 HTTP `101 Switching Protocols` 与 `Sec-WebSocket-Key` 哈希签名的协议升级（Upgrade）握手全流程；
   - 理解中间网络设备（NAT 路由器/网关）空闲超时丢弃映射的痛点；
   - 掌握应用层 Ping/Pong 探测机制与带随机抖动的**指数退避重连算法（Exponential Backoff with Jitter）**，防范服务端重启时的“惊群雪崩”。

---

## 🗺️ 阶段专题导航

| 专题目录 | 核心原语 | 关键掌握目标 |
| :--- | :--- | :--- |
| **[01-native-http-server](./01-native-http-server)** | 原生 HTTP 服务与路由分发 | 搞懂 `req` 可读流与 `res` 可写流的本质，实现零依赖轻量 REST 路由 |
| **[02-tcp-socket-basics](./02-tcp-socket-basics)** | TCP Socket 与粘包半包场景 | 掌握 `node:net` 原生套接字通信与 TCP 字节流无边界本质分析 |
| **[03-websocket-heartbeat](./03-websocket-heartbeat)** | 长连接机制与心跳重连保活 | 掌握 HTTP 协议升级（Upgrade）原理、应用层心跳探针与断线重连心智 |

---

## 🚀 统一运行指令

```bash
make run-04
```
