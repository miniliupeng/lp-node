import assert from 'node:assert/strict';
import { arch, platform, tmpdir } from 'node:os';
import path from 'node:path';

assert.equal(path.basename('/tmp/demo/app.mjs'), 'app.mjs');
assert.equal(path.extname('app.test.mjs'), '.mjs');
assert.equal(path.join('/var', 'app', 'a', '..', 'b'), path.normalize('/var/app/b'));
assert.equal(path.resolve('/var/app', 'file.txt'), '/var/app/file.txt');
assert.equal(path.isAbsolute('/var/app'), true);

const root = path.resolve('/srv/data');
function insideRoot(userPath) {
  const resolved = path.resolve(root, userPath);
  const relative = path.relative(root, resolved);
  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return resolved;
  }
  throw new Error('path escapes root');
}

assert.equal(insideRoot('a/b.txt'), '/srv/data/a/b.txt');
assert.throws(() => insideRoot('../etc/passwd'), /escapes/);
assert.throws(() => insideRoot('/etc/passwd'), /escapes/);

assert.equal(typeof platform(), 'string');
assert.equal(typeof arch(), 'string');
assert.equal(typeof tmpdir(), 'string');
assert.ok(process.cwd().length > 0);
assert.ok(process.execPath.endsWith('node') || process.execPath.includes('node'));

console.log('PASS A/08-path-process');
