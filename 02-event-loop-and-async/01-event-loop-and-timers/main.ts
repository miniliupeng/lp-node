/**
 * 01-event-loop-and-timers
 * 实测 Node.js 事件循环执行顺序：同步 -> nextTick -> 微任务 -> 宏任务 (Timers / Check)
 */

async function runEventLoopExperiment(): Promise<void> {
  const timeline: string[] = [];

  console.log('=== Node.js 事件循环时序实测 ===');

  await new Promise<void>((resolve) => {
    // 1. 同步任务
    timeline.push('1. 同步代码主栈');

    // 2. 宏任务阶段 A: 定时器 (Timers 阶段)
    setTimeout(() => {
      timeline.push('4. 宏任务: setTimeout(0)');
      // 检查宏任务执行完毕后结束测试
      if (timeline.length >= 5) resolve();
    }, 0);

    // 3. 宏任务阶段 B: Check 阶段
    setImmediate(() => {
      timeline.push('5. 宏任务: setImmediate');
      if (timeline.length >= 5) resolve();
    });

    // 4. 标准微任务 (Microtask)
    Promise.resolve().then(() => {
      timeline.push('3. 标准微任务: Promise.then');
    });

    // 5. Node.js 特权微任务 (nextTick Queue)
    process.nextTick(() => {
      timeline.push('2. 特权微任务: process.nextTick');
    });
  });

  // 输出实际执行时间线
  timeline.forEach((step, idx) => {
    console.log(`[步骤 ${idx + 1}] ${step}`);
  });

  console.log('--------------------------------');
  console.log('💡 结论提炼:');
  console.log('   - 微任务优先级: process.nextTick > Promise.then');
  console.log('   - 当前轮次所有微任务清空后，事件循环才切入下一阶段宏任务');
  console.log('================================');
}

await runEventLoopExperiment();
