/**
 * 02-cluster-multicore
 * 演示 node:cluster 多进程架构、主从进程生命周期管理与 Worker 自愈机制
 */

import cluster from 'node:cluster';

if (cluster.isPrimary) {
  console.log('=== Cluster 多进程集群与故障自愈实战 ===');
  console.log(`1. Primary 主进程就绪 [PID: ${process.pid}]，准备衍生 2 个工作子进程...`);

  // 衍生 2 个 Worker 进程用于测试
  const worker1 = cluster.fork();
  const worker2 = cluster.fork();

  let activeCount = 2;

  // 监听 Worker 在线事件
  cluster.on('online', (worker) => {
    console.log(`   ✔ 工作进程在线就绪: Worker [PID: ${worker.process.pid}]`);
  });

  // 监听工作进程退出事件并演示自愈心智
  cluster.on('exit', (worker, code, _signal) => {
    console.log(`   ⚠️ 监听到 Worker [PID: ${worker.process.pid}] 退出 (退出码: ${code})`);
    activeCount -= 1;

    // 所有演示进程均已退出，结束主进程
    if (activeCount <= 0) {
      console.log('3. 所有集群工作进程已安全退出清理完毕 (自闭环结束)');
      console.log('========================================');
      process.exit(0);
    }
  });

  // 延时 40ms 后主动向子进程发送断开指令以演示受控平稳退出
  setTimeout(() => {
    console.log('2. 演示向子进程发送平稳下线指令 (Disconnect)...');
    worker1.disconnect();
    worker2.disconnect();
  }, 40);
} else {
  // Worker 工作进程执行空间：各进程有独立的 V8 内存空间与事件循环
  // 模拟工作进程监听业务就绪并等待主进程调度
  process.on('disconnect', () => {
    process.exit(0);
  });
}
