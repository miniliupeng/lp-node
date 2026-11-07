import assert from 'node:assert/strict';

async function mapLimit(items, limit, fn) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('limit must be a positive integer');
  const out = new Array(items.length);
  let cursor = 0;
  let active = 0;
  let peak = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      active += 1;
      peak = Math.max(peak, active);
      try {
        out[index] = await fn(items[index], index);
      } finally {
        active -= 1;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return { out, peak };
}

const { out, peak } = await mapLimit([1, 2, 3, 4, 5], 2, async (n) => {
  await new Promise((resolve) => setTimeout(resolve, 5));
  return n * 10;
});
assert.deepEqual(out, [10, 20, 30, 40, 50]);
assert.ok(peak <= 2);
console.log('PASS E/01-pool');
