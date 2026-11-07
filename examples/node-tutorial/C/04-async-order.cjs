'use strict';

const assert = require('node:assert/strict');

const order = [];
async function run() {
  order.push('async-start');
  await null;
  order.push('after-await');
}

run();
Promise.resolve().then(() => order.push('promise'));
process.nextTick(() => order.push('nextTick'));
queueMicrotask(() => order.push('microtask'));

const inner = [];
Promise.resolve().then(() => {
  queueMicrotask(() => inner.push('microtask'));
  Promise.resolve().then(() => inner.push('promise'));
  process.nextTick(() => inner.push('nextTick'));
});

setTimeout(() => {
  assert.deepEqual(order, ['async-start', 'nextTick', 'after-await', 'promise', 'microtask']);
  assert.deepEqual(inner, ['microtask', 'promise', 'nextTick']);
  console.log('PASS C/04-async-order');
}, 0);
