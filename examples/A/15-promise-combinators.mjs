import assert from 'node:assert/strict';

function delay(ms, value, fail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (fail ? reject(value) : resolve(value)), ms);
  });
}

assert.equal(await Promise.any([Promise.reject(new Error('a')), Promise.resolve('b')]), 'b');
await assert.rejects(
  Promise.any([Promise.reject(new Error('a')), Promise.reject(new Error('b'))]),
  (error) => {
    assert.equal(error.name, 'AggregateError');
    assert.equal(error.errors.length, 2);
    return true;
  },
);

assert.equal(await Promise.race([delay(30, 'slow'), delay(5, 'fast')]), 'fast');
await assert.rejects(Promise.race([delay(30, 'slow'), delay(5, new Error('boom'), true)]), /boom/);

console.log('PASS A/15-promise-combinators');
