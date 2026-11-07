import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const strip = spawnSync(process.execPath, [join(dir, 'strip-sample.ts')], { encoding: 'utf8' });
assert.equal(strip.status, 0, strip.stderr);
assert.match(strip.stdout, /5/);
assert.equal(process.features.typescript, 'strip');

const enumerated = spawnSync(process.execPath, [join(dir, 'enum-sample.ts')], { encoding: 'utf8' });
assert.notEqual(enumerated.status, 0);
assert.match(enumerated.stderr, /ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX/);

const transformed = spawnSync(
  process.execPath,
  ['--experimental-transform-types', join(dir, 'enum-sample.ts')],
  { encoding: 'utf8' },
);
assert.equal(transformed.status, 0, transformed.stderr);
assert.match(transformed.stdout, /1/);
console.log('PASS C/15-types-strip');
