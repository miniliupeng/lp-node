import assert from 'node:assert/strict';

function delay(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

const value = await delay(1, 7);
assert.equal(value, 7);

const settled = await Promise.allSettled([
  Promise.resolve('ok'),
  Promise.reject(new Error('nope')),
]);
assert.equal(settled[0].status, 'fulfilled');
assert.equal(settled[0].value, 'ok');
assert.equal(settled[1].status, 'rejected');
assert.equal(settled[1].reason.message, 'nope');

await assert.rejects(Promise.all([Promise.resolve(1), Promise.reject(new Error('stop'))]), /stop/);

const { promise, resolve } = Promise.withResolvers();
resolve(5);
assert.equal(await promise, 5);

console.log('PASS A/10-async');
