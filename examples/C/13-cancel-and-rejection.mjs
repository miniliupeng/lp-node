import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const rejected = spawnSync(process.execPath, ['--input-type=module', '-e', 'Promise.reject(new Error("boom"))'], {
  encoding: 'utf8',
});
assert.notEqual(rejected.status, 0);
assert.match(rejected.stderr, /boom/);

const handled = spawnSync(
  process.execPath,
  ['-e', 'process.on("unhandledRejection", () => {}); Promise.reject(new Error("boom"));'],
  { encoding: 'utf8' },
);
assert.equal(handled.status, 0, handled.stderr);

const file = join(tmpdir(), `lp-node-abort-${process.pid}.txt`);
await writeFile(file, 'hello');
try {
  const ac = new AbortController();
  ac.abort();
  await assert.rejects(readFile(file, { signal: ac.signal }), { code: 'ABORT_ERR' });
} finally {
  await rm(file, { force: true });
}

console.log('PASS C/13-cancel-and-rejection');
