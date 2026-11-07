import assert from 'node:assert/strict';

export function parseUser(input) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new TypeError('user must be an object');
  }
  const { name, age } = input;
  if (typeof name !== 'string' || name.length < 1 || name.length > 40) {
    throw new TypeError('name must be 1..40 characters');
  }
  if (!Number.isInteger(age) || age < 0 || age > 130) {
    throw new TypeError('age must be an integer from 0 to 130');
  }
  return { name, age };
}

assert.deepEqual(parseUser({ name: 'ada', age: 36, extra: true }), { name: 'ada', age: 36 });
assert.throws(() => parseUser(null), TypeError);
assert.throws(() => parseUser({ name: '', age: 1 }), /name/);
assert.throws(() => parseUser({ name: 'ada', age: 1.5 }), /age/);
assert.throws(() => parseUser({ name: 'ada', age: '36' }), /age/);

console.log('PASS D/06-validation');
