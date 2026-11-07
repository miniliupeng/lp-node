import assert from 'node:assert/strict';

function tripleEqual(left, right) {
  return left === right;
}

const notNumber = Number('nope');
const negativeZero = Number('-0');

assert.equal(typeof null, 'object');
assert.equal(null === undefined, false);
assert.equal(Number.isNaN(notNumber), true);
assert.equal(tripleEqual(notNumber, notNumber), false);
assert.equal(Object.is(notNumber, notNumber), true);
assert.equal(tripleEqual(0, negativeZero), true);
assert.equal(Object.is(0, negativeZero), false);
assert.equal(1 / negativeZero, Number.NEGATIVE_INFINITY);

const shared = { n: 1 };
const alias = shared;
alias.n = 2;
assert.equal(shared.n, 2);

const cloned = structuredClone({
  n: 1,
  when: new Date('2026-01-02T00:00:00.000Z'),
  nested: { ok: true },
});
cloned.nested.ok = false;
assert.equal(cloned.when.toISOString(), '2026-01-02T00:00:00.000Z');

class Box {
  constructor(n) {
    this.n = n;
  }

  double() {
    return this.n * 2;
  }
}

const copied = structuredClone(new Box(3));
assert.deepEqual(copied, { n: 3 });
assert.equal(Object.getPrototypeOf(copied), Object.prototype);
assert.equal(typeof copied.double, 'undefined');

console.log('PASS A/02-values');
