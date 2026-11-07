// 假设：Node.js >= 22，实测 22.23.4。本文件是 ESM（.mjs）。
import assert from 'node:assert/strict';

assert.equal(typeof process.version, 'string');
assert.ok(process.version.startsWith('v'));
assert.equal(typeof process.pid, 'number');
assert.ok(process.versions.node);
assert.ok(process.versions.v8);
assert.ok(process.versions.uv);

const major = Number(process.versions.node.split('.')[0]);
assert.ok(major >= 22, `需要 Node 22+，当前 ${process.version}`);

console.log(
  JSON.stringify({
    node: process.version,
    v8: process.versions.v8,
    uv: process.versions.uv,
    openssl: process.versions.openssl,
    lts: process.release.lts,
  })
);
console.log('PASS A/01-hello');
