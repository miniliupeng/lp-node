import assert from 'node:assert/strict';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const file = join(tmpdir(), `lp-node-env-${process.pid}.env`);
const snapshot = {
  APP_PORT: process.env.APP_PORT,
  APP_NAME: process.env.APP_NAME,
  HASH: process.env.HASH,
};

try {
  await writeFile(file, 'APP_PORT=4321\nAPP_NAME="demo app"\nHASH=a#b\nQUOTED="a#b"\n');
  process.loadEnvFile(file);
  assert.equal(process.env.APP_PORT, '4321');
  assert.equal(process.env.APP_NAME, 'demo app');
  assert.equal(process.env.HASH, 'a');
  assert.equal(process.env.QUOTED, 'a#b');
} finally {
  if (snapshot.APP_PORT === undefined) delete process.env.APP_PORT;
  else process.env.APP_PORT = snapshot.APP_PORT;
  if (snapshot.APP_NAME === undefined) delete process.env.APP_NAME;
  else process.env.APP_NAME = snapshot.APP_NAME;
  if (snapshot.HASH === undefined) delete process.env.HASH;
  else process.env.HASH = snapshot.HASH;
  delete process.env.QUOTED;
  await rm(file, { force: true });
}

console.log('PASS B/12-env');
