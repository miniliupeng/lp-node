import assert from 'node:assert/strict';
import { monitorEventLoopDelay, performance } from 'node:perf_hooks';

const histogram = monitorEventLoopDelay({ resolution: 10 });
histogram.enable();
await new Promise((resolve) => setTimeout(resolve, 40));
histogram.disable();
assert.equal(typeof histogram.mean, 'number');
assert.ok(histogram.max >= 0);
performance.mark('a');
performance.mark('b');
performance.measure('ab', 'a', 'b');
assert.ok(performance.getEntriesByName('ab').at(-1).duration >= 0);
console.log('PASS C/11-perf');
