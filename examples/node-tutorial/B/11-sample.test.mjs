import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

test('adds numbers', () => {
  assert.equal(1 + 2, 3);
});

test('mock records calls', () => {
  const fn = mock.fn((value) => value + 1);
  assert.equal(fn(1), 2);
  assert.equal(fn.mock.calls.length, 1);
  assert.deepEqual(fn.mock.calls[0].arguments, [1]);
});
