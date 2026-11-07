import assert from 'node:assert/strict';
import { isMainThread, parentPort, Worker, workerData } from 'node:worker_threads';

if (!isMainThread) {
  if (workerData.kind === 'sum') {
    let total = 0;
    for (let i = 1; i <= workerData.n; i += 1) total += i;
    parentPort.postMessage(total);
  } else if (workerData.kind === 'sab') {
    const view = new Int32Array(workerData.buffer);
    Atomics.store(view, 0, 42);
    parentPort.postMessage('stored');
  }
} else {
  function onceMessage(worker) {
    return new Promise((resolve, reject) => {
      worker.once('message', resolve);
      worker.once('error', reject);
    });
  }

  const sumWorker = new Worker(new URL(import.meta.url), {
    workerData: { kind: 'sum', n: 10 },
  });
  assert.equal(await onceMessage(sumWorker), 55);
  assert.equal(await new Promise((resolve) => sumWorker.once('exit', resolve)), 0);

  const buffer = new SharedArrayBuffer(4);
  const sabWorker = new Worker(new URL(import.meta.url), {
    workerData: { kind: 'sab', buffer },
  });
  assert.equal(await onceMessage(sabWorker), 'stored');
  assert.equal(Atomics.load(new Int32Array(buffer), 0), 42);
  assert.equal(await new Promise((resolve) => sabWorker.once('exit', resolve)), 0);
  console.log('PASS C/09-worker');
}
