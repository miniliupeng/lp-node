import assert from 'node:assert/strict';

const major = Number(process.versions.node.split('.')[0]);
assert.ok(major >= 22, `需要 Node 22+，当前 ${process.version}`);
assert.equal(process.release.lts, 'Jod');

console.log(
  JSON.stringify({
    node: process.version,
    v8: process.versions.v8,
    uv: process.versions.uv,
    openssl: process.versions.openssl,
    lts: process.release.lts,
  }),
);
console.log('PASS A/01-hello');
