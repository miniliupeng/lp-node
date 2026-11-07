import assert from 'node:assert/strict';

const text = 'héllo';
const bytes = Buffer.from(text, 'utf8');
assert.equal(bytes.toString('utf8'), text);
assert.equal(text.length, 5);
assert.equal(bytes.length, 6);

const shared = Buffer.from('abcdef');
const view = shared.subarray(1, 3);
view[0] = 0x5a;
assert.equal(shared.toString('utf8'), 'aZcdef');

const copy = Buffer.from(shared.subarray(0, 2));
copy[0] = 0x51;
assert.equal(shared[0], 0x61);

const zeroed = Buffer.alloc(8);
assert.ok([...zeroed].every((byte) => byte === 0));
const unsafe = Buffer.allocUnsafe(8);
assert.equal(unsafe.length, 8);
assert.equal(Buffer.poolSize, 8192);

const joined = Buffer.concat([Buffer.from('ab'), Buffer.from('cd')]);
assert.equal(joined.toString('utf8'), 'abcd');

console.log('PASS B/01-buffer');
