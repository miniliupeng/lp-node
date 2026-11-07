import assert from 'node:assert/strict';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const file = join(tmpdir(), `lp-node-env-${process.pid}.env`);
const previous = process.env.TUTORIAL_PORT;
delete process.env.TUTORIAL_PORT;
delete process.env.APP_NAME;
delete process.env.HASH;
delete process.env.QUOTED;
try {
  await writeFile(file, 'TUTORIAL_PORT=4321\nAPP_NAME="demo app"\nHASH=a#b\nQUOTED="a#b"\n');
  process.loadEnvFile(file);
  assert.equal(process.env.TUTORIAL_PORT, '4321');
  assert.equal(process.env.APP_NAME, 'demo app');
  assert.equal(process.env.HASH, 'a');
  assert.equal(process.env.QUOTED, 'a#b');
} finally {
  if (previous === undefined) delete process.env.TUTORIAL_PORT;
  else process.env.TUTORIAL_PORT = previous;
  delete process.env.APP_NAME;
  delete process.env.HASH;
  delete process.env.QUOTED;
  await rm(file, { force: true });
}

console.log('PASS B/12-env');
