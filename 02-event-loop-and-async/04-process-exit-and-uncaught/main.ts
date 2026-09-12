/**
 * 04-process-exit-and-uncaught
 * 演示未捕获异常全局防御机制与企业级标准优雅停机 (Graceful Shutdown) 编排
 */

// 1. 模拟底层服务与在途任务状态
const state = {
  isShuttingDown: false,
  activeRequests: 1, // 模拟当前有 1 个在途业务请求正在处理
};

// 2. 企业级优雅停机标准 4 步法
async function executeGracefulShutdown(triggerSource: string): Promise<void> {
  if (state.isShuttingDown) return;
  state.isShuttingDown = true;

  console.log(`\n[停机信号触发: ${triggerSource}] 启动优雅退出流程...`);

  // 步骤 1: 标记停止接纳新外部网络连接
  console.log('  -> 步骤 1: 拒绝新请求接入 (已下线就绪探针 Readiness Probe)');

  // 步骤 2: 等待所有在途请求平稳收尾
  console.log('  -> 步骤 2: 等待在途请求消化完毕...');
  await new Promise<void>((resolve) => {
    const timer = setInterval(() => {
      state.activeRequests -= 1;
      if (state.activeRequests <= 0) {
        clearInterval(timer);
        console.log('     ✔ 所有在途事务均已正常兑现处理');
        resolve();
      }
    }, 15);
  });

  // 步骤 3: 释放底层数据库连接池与消息队列通道
  console.log('  -> 步骤 3: 释放数据库连接池与 Redis 句柄 (关闭连接)');

  // 步骤 4: 进程平稳退出
  console.log('  -> 步骤 4: 资源释放完毕，安全退出进程 (exitCode: 0)');
}

// 3. 全局未捕获异常兜底守卫
function registerGlobalSafetyGuards(): void {
  process.on('uncaughtException', (error: Error) => {
    console.error('💥 [FATAL] 捕获到全局未捕获异常 (堆状态已不可信):', error.message);
    // 致命异常必须在记录日志后尽快自杀退出，避免脏状态扩散
    void executeGracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('⚠️ [WARNING] 捕获到未处理的 Promise Rejection:', reason);
  });
}

async function run(): Promise<void> {
  console.log('=== 未捕获异常防御与优雅停机实战 ===');

  // 1. 注册全局防御
  registerGlobalSafetyGuards();
  console.log('1. 全局异常监听器注册完成: uncaughtException, unhandledRejection');

  // 2. 模拟触发模拟的 SIGTERM 信号停机
  console.log('2. 模拟应用平稳运行中，接收到系统下发 SIGTERM 信号...');
  await executeGracefulShutdown('SIGTERM');

  console.log('====================================');
}

await run();
