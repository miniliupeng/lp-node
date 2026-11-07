'use strict';

const assert = require('node:assert/strict');
const a = require('./12-cjs-a.cjs');
const b = require('./12-cjs-b.cjs');

assert.equal(b.aDoneWhileBInit, false);
assert.equal(a.bDoneWhileAInit, true);
assert.equal(a.done, true);
assert.equal(b.done, true);
console.log('PASS C/12-cjs-main');
