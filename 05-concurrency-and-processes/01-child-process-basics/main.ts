/**
 * 01-child-process-basics
 * 演示 child_process.spawn 流式执行外部命令、避免 maxBuffer 缓冲区溢出以及安全传参机制
 */

import { spawn } from 'node:child_process';

// 封装 spawn 为可直接 await 的流式异步函数
function executeSafeCommand(
  cmd: string,
  args: string[]
): Promise<{ stdout: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    // spawn 直接调用系统二进制程序，不经过 Shell 解析，免疫注入且支持海量输出
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

    child.on('error', reject);
    child.on('close', (exitCode) => {
      if (exitCode !== 0) {
        const errOutput = Buffer.concat(stderrChunks).toString('utf-8');
        reject(new Error(`命令执行失败 (退出码 ${exitCode}): ${errOutput}`));
      } else {
        const stdOutput = Buffer.concat(stdoutChunks).toString('utf-8');
        resolve({ stdout: stdOutput.trim(), exitCode: exitCode ?? 0 });
      }
    });
  });
}

async function run(): Promise<void> {
  console.log('=== child_process 子进程通信实战 ===');

  // 1. 使用当前 node 解释器自身执行安全命令 (免疫 Shell 注入)
  console.log('1. 安全流式衍生子进程 (spawn 避免 maxBuffer 内存撑爆):');
  const result = await executeSafeCommand(process.execPath, [
    '-e',
    "console.log(JSON.stringify({ pid: process.pid, runtime: 'Node.js', status: 'OK' }))",
  ]);

  console.log(`   ✔ 子进程退出状态: exitCode = ${result.exitCode}`);
  console.log(`   ✔ 子进程标准输出: ${result.stdout}`);

  // 2. 核心架构认知总结
  console.log('2. child_process 4 大 API 选型策略:');
  console.log('   - spawn: 基础底层原语，以流（Stream）返回，适合大数据量、音视频转码');
  console.log('   - exec: 开启系统 Shell 执行字符串命令，存在 1MB 缓冲区上限与命令注入风险');
  console.log('   - execFile: 直接执行可执行文件（不走 Shell），适合获取轻量短小执行结果');
  console.log('   - fork: 专属于 Node.js 实例的衍生方式，内置专属 IPC 双向通信管道');
  console.log('====================================');
}

await run();
