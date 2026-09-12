/**
 * 01-fs-and-path-basics
 * 演示现代路径计算、递归目录创建与文件系统原子写入 (Atomic Write)
 */

import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// 生产级文件安全原子写入函数
async function atomicWriteFile(targetPath: string, content: string): Promise<void> {
  const tmpPath = `${targetPath}.tmp.${Date.now()}`;
  // 1. 先将内容完整写入临时文件
  await writeFile(tmpPath, content, 'utf-8');
  // 2. 利用操作系统原子 rename 系统调用瞬间覆盖目标文件，避免半写损坏态
  await rename(tmpPath, targetPath);
}

async function run(): Promise<void> {
  console.log('=== 现代文件与路径操作最佳实践 ===');

  // 1. 路径 API 差异对比
  const joined = join('config', 'nested', 'app.json');
  const resolved = resolve(import.meta.dirname, 'scratch', 'demo.json');
  console.log('1. 路径工具对比:');
  console.log(`   - path.join (片段拼接): ${joined}`);
  console.log(`   - path.resolve (绝对路径): ${resolved}`);

  // 2. 递归目录创建与原子写入实战
  console.log('2. 递归目录创建与原子写入实战:');
  const testDir = resolve(import.meta.dirname, 'scratch_dir');
  const testFile = resolve(testDir, 'app_state.json');

  // 创建多级目录 (recursive: true 保证即使目录已存在或父级不存在也不报错)
  await mkdir(testDir, { recursive: true });
  console.log(`   ✔ 递归创建目录成功: ${testDir}`);

  // 执行安全原子写入
  const payload = JSON.stringify({ status: 'HEALTHY', updatedAt: new Date().toISOString() });
  await atomicWriteFile(testFile, payload);
  console.log('   ✔ 安全原子写入完成 (通过 tmp 文件 + rename 瞬间切换)');

  // 读回数据验证
  const content = await readFile(testFile, 'utf-8');
  console.log(`   ✔ 读回数据确认: ${content}`);

  // 3. 现场清理，保持工作区零残留
  await rm(testDir, { recursive: true, force: true });
  console.log('3. 现场临时目录清理完毕 (零残留)');
  console.log('=================================');
}

await run();
