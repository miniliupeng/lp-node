import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const blocked = spawnSync(
  process.execPath,
  ['--permission', '--allow-fs-read=/tmp', '-e', 'require("node:fs").readFileSync("/etc/hostname")'],
  { encoding: 'utf8' },
);
assert.notEqual(blocked.status, 0);
assert.match(blocked.stderr, /ERR_ACCESS_DENIED/);

const allowed = spawnSync(
  process.execPath,
  [
    '--permission',
    '--allow-fs-read=/etc/hostname',
    '-e',
    'require("node:fs").readFileSync("/etc/hostname"); process.stdout.write("ok\\n")',
  ],
  { encoding: 'utf8' },
);
assert.equal(allowed.status, 0, allowed.stderr);
assert.match(allowed.stdout, /ok/);
assert.equal(process.permission, undefined);
console.log('PASS C/14-permission');
