import assert from 'node:assert/strict';
import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const hash = createHash('sha256').update('abc').digest('hex');
const subtle = Buffer.from(await crypto.subtle.digest('SHA-256', Buffer.from('abc'))).toString('hex');
assert.equal(hash, subtle);
assert.equal(hash.length, 64);

const mac = createHmac('sha256', 'secret').update('payload').digest();
assert.equal(timingSafeEqual(mac, createHmac('sha256', 'secret').update('payload').digest()), true);
assert.throws(() => timingSafeEqual(mac, Buffer.from('short')), {
  code: 'ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH',
});

const salt = randomBytes(16);
const left = await scrypt('password', salt, 32);
const right = await scrypt('password', salt, 32);
assert.equal(timingSafeEqual(left, right), true);
assert.equal(typeof crypto.randomUUID(), 'string');

console.log('PASS B/10-crypto');
