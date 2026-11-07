import assert from 'node:assert/strict';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

if (!isMainThread) {
  if (workerData.kind === 'sum') {
    let total = 0;
    for (let i = 1; i <= workerData.n; i += 1) total += i;
    parentPort.postMessage(total);
  } else if (workerData.kind === 'sab') {
    Atomics.store(new Int32Array(workerData.buffer), 0, 42);
    parentPort.postMessage('stored');
  }
} else {
  function onceMessage(worker) {
    return new Promise((resolve, reject) => {
      worker.once('message', resolve);
      worker.once('error', reject);
    });
  }

  const sumWorker = new Worker(new URL(import.meta.url), { workerData: { kind: 'sum', n: 10 } });
  assert.equal(await onceMessage(sumWorker), 55);
  const buffer = new SharedArrayBuffer(4);
  const sabWorker = new Worker(new URL(import.meta.url), { workerData: { kind: 'sab', buffer } });
  assert.equal(await onceMessage(sabWorker), 'stored');
  assert.equal(Atomics.load(new Int32Array(buffer), 0), 42);
  console.log('PASS C/09-worker');
}
