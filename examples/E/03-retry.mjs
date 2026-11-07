import assert from 'node:assert/strict';

async function retry(fn, { attempts, delayMs, sleep }) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await sleep(delayMs * 2 ** attempt);
    }
  }
  throw lastError;
}

const delays = [];
let calls = 0;
const value = await retry(
  () => {
    calls += 1;
    if (calls < 3) throw new Error(`fail ${calls}`);
    return 'ok';
  },
  {
    attempts: 3,
    delayMs: 10,
    sleep: async (ms) => {
      delays.push(ms);
    },
  },
);
assert.equal(value, 'ok');
assert.deepEqual(delays, [10, 20]);
await assert.rejects(retry(() => { throw new Error('always'); }, { attempts: 2, delayMs: 1, sleep: async () => {} }), /always/);
console.log('PASS E/03-retry');
