import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mul } from './06-local.mjs';

const require = createRequire(import.meta.url);
const math = require('./06-math.cjs');

assert.equal(mul(3, 4), 12);
assert.equal(math.add(3, 4), 7);
assert.equal(typeof import.meta.dirname, 'string');
assert.equal(typeof import.meta.filename, 'string');
assert.ok(import.meta.url.startsWith('file:'));
assert.equal(pathToFileURL(import.meta.filename).href, import.meta.url);

const dynamic = await import('./06-local.mjs');
assert.equal(dynamic.mul(2, 5), 10);

const requiredEsm = require('./06-local.mjs');
assert.equal(requiredEsm.mul(2, 6), 12);
assert.equal(process.features.require_module, true);

console.log('PASS A/06-modules');
