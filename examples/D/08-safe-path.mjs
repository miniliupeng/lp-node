import assert from 'node:assert/strict';
import path from 'node:path';

function resolveInside(root, userPath) {
  const base = path.resolve(root);
  const resolved = path.resolve(base, userPath);
  const relative = path.relative(base, resolved);
  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) return resolved;
  const error = new Error('path escapes root');
  error.code = 'E_PATH_ESCAPE';
  throw error;
}

const root = '/srv/uploads';
assert.equal(resolveInside(root, 'a/../b.txt'), '/srv/uploads/b.txt');
assert.throws(() => resolveInside(root, '../secret'), { code: 'E_PATH_ESCAPE' });
assert.throws(() => resolveInside(root, '/etc/passwd'), { code: 'E_PATH_ESCAPE' });
assert.throws(() => resolveInside(root, 'a/../../secret'), { code: 'E_PATH_ESCAPE' });
console.log('PASS D/08-safe-path');
