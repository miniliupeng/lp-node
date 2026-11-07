import assert from 'node:assert/strict';
import { createHmac, timingSafeEqual } from 'node:crypto';

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signHs256(payload, secret) {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode(payload);
  const data = `${header}.${body}`;
  const signature = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyHs256(token, secret, nowSeconds) {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'format' };
  const [headerPart, payloadPart, signaturePart] = parts;
  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, reason: 'json' };
  }
  if (header?.alg !== 'HS256') return { ok: false, reason: 'alg' };
  const expected = createHmac('sha256', secret).update(`${headerPart}.${payloadPart}`).digest();
  const actual = Buffer.from(signaturePart, 'base64url');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, reason: 'sig' };
  }
  if (typeof payload.exp === 'number' && nowSeconds >= payload.exp) return { ok: false, reason: 'exp' };
  return { ok: true, payload };
}

const secret = 'test-secret';
const token = signHs256({ sub: 'ada', exp: 200 }, secret);
assert.equal(verifyHs256(token, secret, 100).ok, true);
assert.equal(verifyHs256(token, 'other', 100).reason, 'sig');
assert.equal(verifyHs256(token, secret, 200).reason, 'exp');
const [headerPart, payloadPart, signaturePart] = token.split('.');
const tampered = Buffer.from(JSON.stringify({ sub: 'root', exp: 200 })).toString('base64url');
assert.equal(verifyHs256(`${headerPart}.${tampered}.${signaturePart}`, secret, 100).reason, 'sig');
const noneHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
assert.equal(verifyHs256(`${noneHeader}.${payloadPart}.`, secret, 100).reason, 'alg');
console.log('PASS D/02-jwt');
