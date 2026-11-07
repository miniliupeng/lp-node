import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import path from 'node:path';

assert.equal(path.basename('/tmp/demo/app.mjs'), 'app.mjs');
assert.equal(path.join('/var', 'app', 'a', '..', 'b'), path.normalize('/var/app/b'));
assert.equal(path.resolve('/var/app', '/etc/passwd'), '/etc/passwd');

const root = path.resolve('/srv/data');
function insideRoot(userPath) {
  const resolved = path.resolve(root, userPath);
  const relative = path.relative(root, resolved);
  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) return resolved;
  throw new Error('path escapes root');
}

assert.equal(insideRoot('a/b.txt'), '/srv/data/a/b.txt');
assert.throws(() => insideRoot('../etc/passwd'), /escapes/);
assert.throws(() => insideRoot('/etc/passwd'), /escapes/);
assert.equal(typeof tmpdir(), 'string');
assert.ok(process.cwd().length > 0);

console.log('PASS A/08-path-process');
