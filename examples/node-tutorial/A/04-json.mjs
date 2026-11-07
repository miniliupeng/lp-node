import assert from 'node:assert/strict';

const text = JSON.stringify({
  a: undefined,
  b: 1,
  c: 'ok',
  d: [1, undefined, 3],
});
assert.equal(text, '{"b":1,"c":"ok","d":[1,null,3]}');

const date = JSON.parse(JSON.stringify(new Date('2026-01-02T00:00:00.000Z')));
assert.equal(date, '2026-01-02T00:00:00.000Z');

assert.throws(() => JSON.stringify(1n), TypeError);
assert.throws(() => {
  const cycle = {};
  cycle.self = cycle;
  JSON.stringify(cycle);
}, TypeError);

const parsed = JSON.parse('{"__proto__":{"admin":true},"role":"user"}');
assert.equal(parsed.admin, undefined);
assert.equal(parsed.role, 'user');
assert.equal(Object.hasOwn(parsed, '__proto__'), true);
assert.equal(Object.getPrototypeOf(parsed), Object.prototype);

console.log('PASS A/04-json');
