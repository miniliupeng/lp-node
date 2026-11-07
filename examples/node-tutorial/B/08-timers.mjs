import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

const order = [];
setTimeout(() => order.push('timeout'), 0);
setImmediate(() => order.push('immediate'));
await delay(30);
assert.ok(order.includes('timeout'));
assert.ok(order.includes('immediate'));

const hanging = setTimeout(() => {}, 60_000);
hanging.unref();

const ac = new AbortController();
const pending = delay(60_000, undefined, { signal: ac.signal });
ac.abort();
await assert.rejects(pending, { name: 'AbortError' });

console.log('PASS B/08-timers');
