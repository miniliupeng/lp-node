/**
 * 01-node-runtime-and-pnpm
 * 演示 Node.js 运行时探针采集、内存监控与 ESM 环境识别
 */

function formatMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

interface RuntimeDiagnostics {
  nodeVersion: string;
  v8Version: string;
  pid: number;
  uptimeSeconds: number;
  platform: string;
  arch: string;
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  };
  isESM: boolean;
}

function collectDiagnostics(): RuntimeDiagnostics {
  const mem = process.memoryUsage();
  return {
    nodeVersion: process.version,
    v8Version: process.versions.v8,
    pid: process.pid,
    uptimeSeconds: Math.floor(process.uptime()),
    platform: process.platform,
    arch: process.arch,
    memory: {
      rss: formatMB(mem.rss),
      heapTotal: formatMB(mem.heapTotal),
      heapUsed: formatMB(mem.heapUsed),
      external: formatMB(mem.external),
    },
    // ESM 模式下 import.meta.url 必然存在
    isESM: typeof import.meta.url === 'string',
  };
}

function run(): void {
  const info = collectDiagnostics();

  console.log('=== Node.js 现代运行时健康状态 ===');
  console.log(`运行时版本: ${info.nodeVersion} (V8: ${info.v8Version})`);
  console.log(`执行环境: ${info.platform} (${info.arch}), PID: ${info.pid}`);
  console.log(`已持续运行: ${info.uptimeSeconds} 秒`);
  console.log('内存分配快照:');
  console.log(`  - 物理常驻集 (RSS): ${info.memory.rss}`);
  console.log(`  - 申请堆总量 (heapTotal): ${info.memory.heapTotal}`);
  console.log(`  - 实际已用堆 (heapUsed): ${info.memory.heapUsed}`);
  console.log(`  - C++ 绑定扩展内存 (external): ${info.memory.external}`);
  console.log(`模块化规范: ${info.isESM ? 'ECMAScript Modules (ESM)' : 'CommonJS'}`);
  console.log('===================================');
}

run();
