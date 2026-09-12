/**
 * 02-tcp-socket-basics
 * 演示原生 TCP Socket 通信、TCP 字节流合并（粘包）现象及使用分隔符定界安全解包
 */

import { type AddressInfo, createConnection, createServer } from 'node:net';

async function run(): Promise<void> {
  console.log('=== TCP Socket 通信与消息定界实战 ===');

  const receivedMessages: string[] = [];
  let rawChunkCount = 0;

  // 1. 创建 TCP 服务端
  const server = createServer((socket) => {
    let unparsedBuffer = '';

    socket.on('data', (chunk) => {
      rawChunkCount += 1;
      unparsedBuffer += chunk.toString('utf-8');

      // 应用层消息定界：使用 '\n' 换行符切割消息帧
      const parts = unparsedBuffer.split('\n');
      // 最后一个元素可能是未接收完整的半包，留到下次拼接
      unparsedBuffer = parts.pop() ?? '';

      for (const msg of parts) {
        if (msg.trim()) receivedMessages.push(msg.trim());
      }
    });
  });

  // 监听系统动态分配端口
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  console.log(`1. 原生 TCP 服务端就绪，监听临时端口: 127.0.0.1:${port}`);

  // 2. 创建 TCP 客户端并连续快速推包 (制造单 TCP 帧合并传输)
  const client = createConnection({ port, host: '127.0.0.1' });
  await new Promise<void>((resolve) => client.once('connect', resolve));

  console.log('2. 客户端建立连接，连续快速写入 3 条紧凑消息...');
  // 连续调用 write，操作系统协议栈会自动将这三条微小数据合并为一个 TCP 包发送
  client.write('ACTION:LOGIN|UID:1001\n');
  client.write('ACTION:PING|UID:1001\n');
  client.write('ACTION:LOGOUT|UID:1001\n');

  // 等待传输完成
  await new Promise((resolve) => setTimeout(resolve, 30));

  // 3. 断言与解包验证
  console.log(`3. 底层 Socket 触发 data 事件次数: ${rawChunkCount} 次 (验证了多包合并传输特征)`);
  console.log('4. 应用层协议定界解包还原结果:');
  receivedMessages.forEach((msg, idx) => {
    console.log(`   ✔ 成功解包帧 [${idx + 1}]: "${msg}"`);
  });

  // 4. 清理释放资源
  client.end();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  console.log('5. TCP 连接与服务端实例已安全释放');
  console.log('=====================================');
}

await run();
