import assert from 'node:assert/strict';

function makeCounter() {
  let n = 0;
  return () => {
    n += 1;
    return n;
  };
}

const next = makeCounter();
assert.deepEqual([next(), next(), next()], [1, 2, 3]);

const box = {
  n: 4,
  method() {
    const arrow = () => this.n;
    return arrow();
  },
};

assert.equal(box.method(), 4);
const detached = box.method;
assert.throws(() => detached(), TypeError);

function add(left, right = 1) {
  return left + right;
}

assert.equal(add(2), 3);
assert.equal(0 ?? 1, 0);
assert.equal(null ?? 'missing', 'missing');

const user = { name: 'ada', city: 'hz' };
const { name, ...rest } = user;
assert.equal(name, 'ada');
assert.deepEqual(rest, { city: 'hz' });
assert.equal(user?.profile?.title, undefined);

console.log('PASS A/03-functions');
