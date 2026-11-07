import assert from 'node:assert/strict';

class AppError extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.name = 'AppError';
    this.code = code;
  }
}

const cause = new Error('disk full');
const error = new AppError('E_SAVE', 'cannot save', { cause });
assert.equal(error instanceof AppError, true);
assert.equal(error instanceof Error, true);
assert.equal(error.code, 'E_SAVE');
assert.equal(error.cause, cause);
assert.match(error.stack ?? '', /05-errors\.mjs/);

function parsePort(raw) {
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new AppError('E_PORT', `bad port: ${raw}`);
  }
  return port;
}

assert.equal(parsePort('80'), 80);
assert.throws(() => parsePort('0'), { name: 'AppError', code: 'E_PORT' });

console.log('PASS A/05-errors');
