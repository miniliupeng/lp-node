import assert from 'node:assert/strict';
import { AsyncLocalStorage } from 'node:async_hooks';

const als = new AsyncLocalStorage();

export function log(level, message) {
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

assert.deepEqual(JSON.parse(lines[0]), { level: 'info', message: 'a', requestId: 'req-a' });
assert.deepEqual(JSON.parse(lines[1]), { level: 'info', message: 'b', requestId: 'req-b' });
assert.equal(JSON.parse(log('info', 'outside')).requestId, null);

console.log('PASS D/07-logger-als');
