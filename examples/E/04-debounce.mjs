import assert from 'node:assert/strict';

function debounce(fn, timer) {
  let current = null;
  return (...args) => {
    timer.clear(current);
    current = timer.set(() => {
      current = null;
      fn(...args);
    });
  };
}

let calls = 0;
let saved = null;
const fake = {
  set(callback) {
    saved = callback;
    return 1;
  },
  clear() {
    saved = null;
  },
};
const wrapped = debounce(() => {
  calls += 1;
}, fake);
wrapped('a');
wrapped('b');
assert.equal(calls, 0);
saved();
assert.equal(calls, 1);
console.log('PASS E/04-debounce');
