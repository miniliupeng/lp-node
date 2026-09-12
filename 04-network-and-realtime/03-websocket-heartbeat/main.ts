/**
 * 03-websocket-heartbeat
 * 演示 WebSocket 协议升级 (Upgrade) 机制、心跳保活 (Ping/Pong) 与指数退避重连状态机
 */

import { createServer, type IncomingMessage } from 'node:http';
import type { AddressInfo, Socket } from 'node:net';

// 1. 模拟指数退避重连延迟计算 (带上限与随机抖动 Jitter)
function calculateBackoff(attempt: number, baseMs = 500, maxMs = 4000): number {
  const exponential = Math.min(maxMs, baseMs * 2 ** attempt);
  const jitter = Math.floor(Math.random() * 200); // 随机抖动避免羊群惊群效应
  return exponential + jitter;
}

// 2. 心跳探测状态机
class HeartbeatDetector {
  private isAlive = true;

  onPongReceived(): void {
    this.isAlive = true;
    console.log('   ✔ 收到对端 PONG 回执: 连接健康');
  }

  checkHealth(): boolean {
    if (!this.isAlive) {
      console.log('   ⚠️ 连续心跳超时！判定连接已假死 (Ghost Connection)');
      return false;
    }
    this.isAlive = false; // 预设为 false，等待下一次 PONG 唤醒
    console.log('   -> 发送 PING 心跳探针包，等待回执...');
    return true;
  }
}

async function run(): Promise<void> {
  console.log('=== WebSocket 心跳保活与重连机制实战 ===');

  // 1. 原生 HTTP 监听 upgrade 事件演示协议升级握手
  const server = createServer();
  server.on('upgrade', (req: IncomingMessage, socket: Socket) => {
    console.log(`1. 拦截到协议升级请求: Upgrade: ${req.headers.upgrade}`);
    // 回复 HTTP 101 Switching Protocols 完成握手
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n\r\n'
    );
    socket.destroy(); // 演示完毕安全断开
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  console.log(`   ✔ 服务端就绪，监听握手升级端点: ws://127.0.0.1:${port}`);

  // 2. 模拟心跳保活状态机流转
  console.log('2. 心跳检测流转演练:');
  const detector = new HeartbeatDetector();

  // 周期 1: 正常收发
  detector.checkHealth();
  detector.onPongReceived();

  // 周期 2: 模拟网络中断，未收到 PONG
  detector.checkHealth();
  const isHealthy = detector.checkHealth(); // 第二次探查发现依然没被置为 true

  // 3. 触发指数退避重连展示
  if (!isHealthy) {
    console.log('3. 触发客户端指数退避 (Exponential Backoff) 重连模拟:');
    for (let attempt = 0; attempt < 3; attempt++) {
      const delay = calculateBackoff(attempt);
      console.log(`   - 第 ${attempt + 1} 次重连调度: 延时 ${delay} ms 后发起拨号`);
    }
  }

  await new Promise<void>((resolve) => server.close(() => resolve()));
  console.log('=========================================');
}

await run();
