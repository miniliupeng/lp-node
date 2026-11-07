import assert from 'node:assert/strict';
import { AsyncLocalStorage } from 'node:async_hooks';

const als = new AsyncLocalStorage();

function log(level, message) {
  const requestId = als.getStore()?.requestId ?? null;
  return JSON.stringify({ level, message, requestId });
}

const lines = await Promise.all([
  als.run({ requestId: 'req-a' }, async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return log('info', 'a');
  }),
  als.run({ requestId: 'req-b' }, async () => log('info', 'b')),
]);
assert.equal(JSON.parse(lines[0]).requestId, 'req-a');
assert.equal(JSON.parse(lines[1]).requestId, 'req-b');
assert.equal(JSON.parse(log('info', 'outside')).requestId, null);
console.log('PASS D/07-logger-als');
