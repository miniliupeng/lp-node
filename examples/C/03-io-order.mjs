import assert from 'node:assert/strict';
import { readFile } from 'node:fs';

const order = await new Promise((resolve, reject) => {
  readFile(new URL(import.meta.url), (error) => {
    if (error) {
      reject(error);
      return;
    }
    const seen = [];
    process.nextTick(() => seen.push('nextTick'));
    queueMicrotask(() => seen.push('microtask'));
    setImmediate(() => seen.push('immediate'));
    setTimeout(() => {
      seen.push('timeout');
      resolve(seen);
    }, 0);
  });
});

assert.deepEqual(order, ['nextTick', 'microtask', 'immediate', 'timeout']);
console.log('PASS C/03-io-order');
