'use strict';

const assert = require('node:assert/strict');
const order = [];

process.nextTick(() => {
  order.push('nt1');
  queueMicrotask(() => order.push('mt-from-nt'));
  process.nextTick(() => order.push('nt2'));
});
queueMicrotask(() => {
  order.push('mt1');
  process.nextTick(() => order.push('nt-from-mt'));
  queueMicrotask(() => order.push('mt2'));
});
Promise.resolve().then(() => order.push('p1'));

setTimeout(() => {
  assert.deepEqual(order, ['nt1', 'nt2', 'mt1', 'p1', 'mt-from-nt', 'mt2', 'nt-from-mt']);
  console.log('PASS C/01-event-loop-cjs');
}, 0);
