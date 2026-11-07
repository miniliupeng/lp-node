import assert from 'node:assert/strict';
import { AsyncLocalStorage } from 'node:async_hooks';

const store = new AsyncLocalStorage();

async function work(id, ms) {
  return store.run({ id }, async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    return store.getStore().id;
  });
}

const ids = await Promise.all([work('a', 15), work('b', 1)]);
assert.deepEqual(ids, ['a', 'b']);
assert.equal(store.getStore(), undefined);

console.log('PASS C/08-als');
