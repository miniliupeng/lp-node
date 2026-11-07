import assert from 'node:assert/strict';

assert.equal(1, 1);
assert.deepEqual({ a: 1, b: [2] }, { a: 1, b: [2] });
assert.notEqual({ a: 1 }, { a: 1 });
assert.throws(() => {
  throw new Error('bad');
}, /bad/);

console.log('PASS A/13-assert');
