/**
 * 03-streams-and-backpressure
 * 演示可写流 highWaterMark 水位线、write 返回 false 与 drain 事件背压机制，
 * 以及现代 stream/promises 的 pipeline 零泄漏管道编排
 */

import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

async function demonstrateRawBackpressure(): Promise<void> {
  console.log('1. 观察底层背压信号触发 (设定 highWaterMark = 16 字节):');

  // 创建一个小缓冲区的可写流
  const slowWriter = new Writable({
    highWaterMark: 16, // 水位线设为 16 字节
    write(_chunk, _encoding, callback) {
      // 模拟慢速 I/O 写入消耗 20 毫秒
      setTimeout(callback, 20);
    },
  });

  // 第一次写入 10 字节
  const canContinue1 = slowWriter.write(Buffer.alloc(10));
  console.log(`   -> 写入 Chunk 1 (10 字节) -> 缓冲区未满，write 返回: ${canContinue1}`);

  // 第二次写入 10 字节 (累计 20 字节，超过 16 字节水位线)
  const canContinue2 = slowWriter.write(Buffer.alloc(10));
  console.log(
    `   -> 写入 Chunk 2 (10 字节) -> 累计 20B 溢出水位线！write 返回: ${canContinue2} (触发背压)`
  );

  if (!canContinue2) {
    console.log("   -> 上游暂停生产，等待下游触发 'drain' 事件...");
    await new Promise<void>((resolve) => {
      slowWriter.once('drain', () => {
        console.log("   ✔ 下游缓冲区已排空，触发 'drain' 事件！通知上游可继续供水");
        resolve();
      });
    });
  }
}

async function demonstratePipeline(): Promise<void> {
  console.log('2. 现代 stream/promises.pipeline 自动化管理:');

  // 创建源头可读流 (发射 1 到 5 的数字)
  const source = Readable.from(['Chunk-1\n', 'Chunk-2\n', 'Chunk-3\n']);
  let receivedCount = 0;

  const destination = new Writable({
    write(_chunk, _encoding, callback) {
      receivedCount += 1;
      callback();
    },
  });

  // 使用 pipeline 自动处理背压平衡、完成关闭与异常销毁
  await pipeline(source, destination);
  console.log(`   ✔ 管道传输完成: 成功安全消费 ${receivedCount} 个数据块 (零资源泄漏)`);
}

async function run(): Promise<void> {
  console.log('=== Stream 背压 (Backpressure) 原理实战 ===');
  await demonstrateRawBackpressure();
  await demonstratePipeline();
  console.log('===========================================');
}

await run();
