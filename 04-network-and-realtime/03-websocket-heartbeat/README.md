# 03-websocket-heartbeat: WebSocket 长连接机制与心跳重连保活

在客服系统、协同文档（如飞书/Google Docs）和金融行情推送中，**WebSocket** 提供了全双工（Full-Duplex）通信能力。但长连接最大的敌人是：**NAT 路由器超时断开与僵尸假死连接**。

---

## 💡 核心原理三段式

### 1. 是什么？
- **WebSocket 协议握手**：借用标准 HTTP 请求发起连接，请求头携带 `Upgrade: websocket` 与 `Connection: Upgrade`，服务端返回状态码 `101 Switching Protocols` 完成握手升级为二进制帧通信。
- **心跳探针 (Heartbeat Ping/Pong)**：客户端与服务端按固定周期（如 30 秒）互相发送微型探测帧。如果连续多次超时未收到回应，立即主动断开当前死连接。

### 2. 为什么需要应用层心跳？
- **NAT 路由超时**：运营商或家庭路由器的 NAT 映射表在连接空闲 60~120 秒后会**静默回收端口映射**。此时双方以为连接还在，但实际数据已经根本发不过去了！
- **识别单向假死**：拔掉网线或进电梯时，操作系统还没来得及发送 TCP FIN 挥手包，连接停留在 `ESTABLISHED` 假死状态，只有心跳超时才能快速发现并触发重新连接。

### 3. 日常工作中怎么用？
- 在客户端维护“心跳检测定时器”与带随机抖动的**指数退避重连算法（Exponential Backoff with Jitter）**。

---

## 🔬 核心代码切片

```typescript
// 简易心跳保活状态机
let isAlive = true;
socket.on("pong", () => { isAlive = true; });

// 周期巡检
const interval = setInterval(() => {
  if (!isAlive) return socket.terminate(); // 连续无应答，物理拔线自愈
  isAlive = false;
  socket.ping();
}, 30000);
```

---

## 🖥️ 控制台预期输出快照

```text
=== WebSocket 心跳保活与重连状态机实战 ===
1. 启动 HTTP 服务，监听 Upgrade 事件拦截握手升级
2. 客户端建立连接，启动心跳保活检测机制:
   -> 发送 PING 心跳探测包...
   ✔ 收到 PONG 回执: 连接存活，心跳正常
3. 模拟弱网环境 (切断服务端响应):
   -> 发送 PING 心跳探测包...
   ⚠️ 心跳超时！判定对端已假死，主动切断废弃句柄
4. 触发客户端指数退避重连机制 (Exponential Backoff):
   ✔ 第 1 次重连延迟: 1000 ms
=========================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 04-network-and-realtime/03-websocket-heartbeat/main.ts
```
