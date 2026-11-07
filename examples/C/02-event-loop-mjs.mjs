import assert from 'node:assert/strict';

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

await new Promise((resolve) => setTimeout(resolve, 0));
assert.deepEqual(order, ['mt1', 'p1', 'mt2', 'nt1', 'nt-from-mt', 'nt2', 'mt-from-nt']);
console.log('PASS C/02-event-loop-mjs');
