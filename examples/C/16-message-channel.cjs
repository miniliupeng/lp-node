'use strict';

const assert = require('node:assert/strict');
const { MessageChannel } = require('node:worker_threads');

const order = [];
const { port1, port2 } = new MessageChannel();
port2.on('message', () => order.push('message'));
port1.postMessage('x');
process.nextTick(() => order.push('nextTick'));
queueMicrotask(() => order.push('microtask'));
setImmediate(() => order.push('immediate'));

setTimeout(() => {
  port1.close();
  port2.close();
  assert.deepEqual(order, ['nextTick', 'microtask', 'message', 'immediate']);
  console.log('PASS C/16-message-channel');
}, 20);
