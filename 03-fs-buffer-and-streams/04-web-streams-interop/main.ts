/**
 * 04-web-streams-interop
 * 演示现代 WHATWG Web Streams 标准 (ReadableStream, TransformStream)
 * 以及与 Node.js 原生流 (Readable.toWeb / Readable.fromWeb) 的无缝桥接
 */

import { Readable } from 'node:stream';
import type { ReadableStream as NodeWebReadableStream } from 'node:stream/web';

async function demonstratePureWebStream(): Promise<void> {
  console.log('1. 原生 Web Streams 管道转换 (TransformStream):');

  // 创建标准 Web 可读流
  const webSource = new ReadableStream<string>({
    start(controller) {
      controller.enqueue('apple');
      controller.enqueue('banana');
      controller.close();
    },
  });

  // 创建标准 Web 转换流 (转为大写)
  const uppercaseTransform = new TransformStream<string, string>({
    transform(chunk, controller) {
      controller.enqueue(chunk.toUpperCase());
    },
  });

  // 管道连接并消费
  const transformedStream = webSource.pipeThrough(uppercaseTransform);
  const reader = transformedStream.getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    console.log(`   ✔ Web Stream 转换输出: "${value}"`);
  }
}

async function demonstrateInteropBridge(): Promise<void> {
  console.log('2. Web Streams 与 Node 原生流互通桥梁 (fromWeb / toWeb):');

  // 1. 创建一个 Web ReadableStream
  const webStream = new ReadableStream<string>({
    start(controller) {
      controller.enqueue('Node ');
      controller.enqueue('Web Stream ');
      controller.enqueue('Interop 2026');
      controller.close();
    },
  });

  // 2. 利用 Readable.fromWeb 无缝桥接为 Node.js 原生流 (严格对齐 node:stream/web 类型)
  const nodeReadable = Readable.fromWeb(webStream as unknown as NodeWebReadableStream);

  // 3. 使用 Node.js 原生 for await...of 异步迭代器消费
  const chunks: string[] = [];
  for await (const chunk of nodeReadable) {
    chunks.push(String(chunk));
  }

  console.log(`   ✔ 通过 Node.js 原生流消费者读出拼接结果: "${chunks.join('')}"`);
}

async function run(): Promise<void> {
  console.log('=== Web Streams 与 Node.js 原生流互通实战 ===');
  await demonstratePureWebStream();
  await demonstrateInteropBridge();
  console.log('============================================');
}

await run();
