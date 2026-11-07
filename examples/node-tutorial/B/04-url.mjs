import assert from 'node:assert/strict';

const url = new URL('https://example.com:8443/a/b?q=1&q=2#top');
assert.equal(url.hostname, 'example.com');
assert.equal(url.port, '8443');
assert.equal(url.pathname, '/a/b');
assert.equal(url.hash, '#top');
assert.deepEqual(url.searchParams.getAll('q'), ['1', '2']);

url.searchParams.set('lang', 'zh');
assert.equal(url.searchParams.get('lang'), 'zh');

const relative = new URL('/health', 'http://127.0.0.1:3000/app/');
assert.equal(relative.href, 'http://127.0.0.1:3000/health');

assert.equal(typeof URLPattern, 'undefined');

console.log('PASS B/04-url');
