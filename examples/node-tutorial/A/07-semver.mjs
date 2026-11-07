import assert from 'node:assert/strict';

// 只覆盖 major >= 1 的 ^ 与 ~。0.x 的 npm caret 规则不同，这里故意不实现。
function compare(left, right) {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return Math.sign(diff);
  }
  return 0;
}

function satisfies(range, version) {
  if (range.startsWith('^')) {
    const base = range.slice(1);
    const major = Number(base.split('.')[0]);
    if (major < 1) throw new Error('this demo only defines ^ for major >= 1');
    return compare(version, base) >= 0 && Number(version.split('.')[0]) === major;
  }
  if (range.startsWith('~')) {
    const base = range.slice(1);
    const [major, minor] = base.split('.').map(Number);
    const [vMajor, vMinor] = version.split('.').map(Number);
    return vMajor === major && vMinor === minor && compare(version, base) >= 0;
  }
  return range === version;
}

assert.equal(satisfies('^1.2.3', '1.2.3'), true);
assert.equal(satisfies('^1.2.3', '1.9.0'), true);
assert.equal(satisfies('^1.2.3', '1.2.2'), false);
assert.equal(satisfies('^1.2.3', '2.0.0'), false);
assert.equal(satisfies('~1.2.3', '1.2.9'), true);
assert.equal(satisfies('~1.2.3', '1.3.0'), false);
assert.equal(satisfies('1.2.3', '1.2.3'), true);
assert.throws(() => satisfies('^0.2.3', '0.2.4'), /major >= 1/);

console.log('PASS A/07-semver');
