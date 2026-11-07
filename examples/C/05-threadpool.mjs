import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const child = `
const { pbkdf2 } = require('node:crypto');
const { readFile } = require('node:fs');
pbkdf2('secret', 'salt', 400000, 16, 'sha256', () => {});
setTimeout(() => {
  const started = Date.now();
  readFile(__filename, () => process.stdout.write(String(Date.now() - started)));
}, 5);
`;

function measure(poolSize) {
  const result = spawnSync(process.execPath, ['-e', child], {
    env: { ...process.env, UV_THREADPOOL_SIZE: String(poolSize) },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  return Number(result.stdout);
}

const blocked = measure(1);
const free = measure(4);
assert.ok(blocked > free + 15, `blocked ${blocked} should exceed free ${free}`);
assert.ok(free < 40, `free path took ${free}ms`);
console.log(`PASS C/05-threadpool blocked=${blocked}ms free=${free}ms`);
