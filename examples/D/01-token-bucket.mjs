import assert from 'node:assert/strict';

function createTokenBucket({ capacity, refillPerSecond }) {
  let tokens = capacity;
  let updatedAt = 0;
  let started = false;
  return {
    tryRemove(cost = 1, now = 0) {
      if (!started) {
        updatedAt = now;
        started = true;
      }
      const elapsed = Math.max(0, now - updatedAt);
      tokens = Math.min(capacity, tokens + elapsed * (refillPerSecond / 1000));
      updatedAt = now;
      if (tokens < cost) return false;
      tokens -= cost;
      return true;
    },
  };
}

const bucket = createTokenBucket({ capacity: 2, refillPerSecond: 1 });
assert.equal(bucket.tryRemove(1, 0), true);
assert.equal(bucket.tryRemove(1, 0), true);
assert.equal(bucket.tryRemove(1, 0), false);
assert.equal(bucket.tryRemove(1, 999), false);
assert.equal(bucket.tryRemove(1, 1000), true);
assert.equal(bucket.tryRemove(1, 1000), false);
console.log('PASS D/01-token-bucket');
