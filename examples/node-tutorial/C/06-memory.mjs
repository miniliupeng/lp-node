import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { getHeapStatistics } from 'node:v8';

const before = process.memoryUsage();
const block = Buffer.alloc(1_000_000);
const after = process.memoryUsage();
assert.equal(block.length, 1_000_000);
assert.equal(block[0], 0);
assert.ok(after.arrayBuffers > before.arrayBuffers);
assert.ok(after.rss > 0);
assert.ok(after.heapUsed > 0);

const heap = getHeapStatistics();
assert.ok(heap.heap_size_limit > heap.used_heap_size);
performance.mark('start');
performance.mark('end');
performance.measure('gap', 'start', 'end');
const measure = performance.getEntriesByName('gap')[0];
assert.ok(measure);
assert.ok(measure.duration >= 0);

console.log('PASS C/06-memory');
