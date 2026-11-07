import assert from 'node:assert/strict';

function handle(result) {
  switch (result.kind) {
    case 'ok':
      return result.data;
    case 'fail':
      return result.error;
    default:
      throw new TypeError(`unexpected kind ${result.kind}`);
  }
}

assert.equal(handle({ kind: 'ok', data: 'saved' }), 'saved');
assert.equal(handle({ kind: 'fail', error: 'busy' }), 'busy');
assert.throws(() => handle({ kind: 'later' }), /unexpected kind/);

function isUser(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.name === 'string' &&
    Number.isInteger(value.age)
  );
}

const parsed = JSON.parse('{"name":"ada","age":36,"role":"admin"}');
assert.equal(isUser(parsed), true);
assert.equal(isUser({ name: 'ada', age: '36' }), false);
assert.equal(isUser(null), false);

console.log('PASS A/14-guards');
