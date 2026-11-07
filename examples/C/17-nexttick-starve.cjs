'use strict';

const assert = require('node:assert/strict');

const order = [];
setTimeout(() => order.push('timeout'), 0);
setImmediate(() => order.push('immediate'));

let steps = 0;
function spin() {
  steps += 1;
  if (steps < 400) {
    process.nextTick(spin);
    return;
  }
  assert.deepEqual(order, []);
  setTimeout(() => {
    assert.ok(order.includes('timeout'));
    assert.ok(order.includes('immediate'));
    console.log('PASS C/17-nexttick-starve');
  }, 20);
}

process.nextTick(spin);
