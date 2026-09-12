/**
 * 02-buffer-and-binary
 * 演示 Buffer 编码转换、内存分配机制以及 subarray 切片共享内存陷阱与防护
 */

function run(): void {
  console.log('=== Buffer 二进制与内存模型实战 ===');

  // 1. 常见二进制编码互转 (utf-8, hex, base64)
  const originalStr = 'Node.js 2026';
  const buf = Buffer.from(originalStr, 'utf-8');
  const hexStr = buf.toString('hex');
  const base64Str = buf.toString('base64');

  console.log('1. 二进制编码转换:');
  console.log(`   - 原始文本: "${originalStr}" (字节长度: ${buf.byteLength})`);
  console.log(`   - Hex 16进制: ${hexStr}`);
  console.log(`   - Base64 编码: ${base64Str}`);

  // 2. 内存分配方式比对
  console.log('2. 内存分配方式安全性对比:');
  const safeBuf = Buffer.alloc(8); // 强制全部初始化为 0x00
  console.log(`   - Buffer.alloc(8) 确定性清零: ${safeBuf.toString('hex')}`);

  // 3. 重点：Buffer.subarray 内存共享陷阱 (共享连续底层物理内存)
  console.log('3. Buffer 切片 (subarray) 内存共享与防泄漏机制:');
  const sourceBuffer = Buffer.from('Hello World', 'utf-8');
  console.log(`   - 初始 sourceBuffer: "${sourceBuffer.toString()}"`);

  // 获取切片：注意！这不会在内存中开辟新空间
  const sliceView = sourceBuffer.subarray(0, 5); // "Hello"
  // 将切片的首字节修改为 ASCII 74 ('J')
  sliceView[0] = 74;

  console.log("   -> 篡改切片 sliceView[0] = 'J' (ASCII 74)");
  console.log(`   ⚠️ 原 sourceBuffer 内容被直接改变: "${sourceBuffer.toString()}"`);

  // 正确的生产隔离做法：通过 Buffer.from 克隆一块全新独立的物理内存
  const independentClone = Buffer.from(sourceBuffer.subarray(0, 5));
  independentClone[0] = 77; // 'M'
  console.log(
    `   ✔ 真正独立内存深拷贝: 克隆对象="${independentClone.toString()}", 原对象="${sourceBuffer.toString()}"`
  );

  console.log('==================================');
}

run();
