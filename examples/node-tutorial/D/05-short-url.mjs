import assert from 'node:assert/strict';
import http from 'node:http';

function addressOf(server) {
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('expected address');
  return address;
}

function createShortLinks() {
  const byCode = new Map();
  const byUrl = new Map();
  let seq = 0;
  return {
    create(url) {
      const existing = byUrl.get(url);
      if (existing) return existing;
      seq += 1;
      const code = seq.toString(36);
      byCode.set(code, url);
      byUrl.set(url, code);
      return code;
    },
    resolve(code) {
      return byCode.get(code);
    },
  };
}

const links = createShortLinks();
const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  if (req.method === 'POST' && url.pathname === '/links') {
    const target = url.searchParams.get('url');
    if (!target || !/^https?:\/\//.test(target)) {
      res.writeHead(400, { 'content-type': 'text/plain' });
      res.end('bad url');
      return;
    }
    const code = links.create(target);
    res.writeHead(201, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ code }));
    return;
  }
  const code = url.pathname.slice(1);
  const target = links.resolve(code);
  if (!target) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(302, { location: target });
  res.end();
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
try {
  const { port } = addressOf(server);
  const base = `http://127.0.0.1:${port}`;
  const created = await fetch(`${base}/links?url=${encodeURIComponent('https://example.com/a')}`, {
    method: 'POST',
  });
  assert.equal(created.status, 201);
  const { code } = await created.json();
  const again = await fetch(`${base}/links?url=${encodeURIComponent('https://example.com/a')}`, {
    method: 'POST',
  });
  assert.equal((await again.json()).code, code);
  const redirected = await fetch(`${base}/${code}`, { redirect: 'manual' });
  assert.equal(redirected.status, 302);
  assert.equal(redirected.headers.get('location'), 'https://example.com/a');
} finally {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
}

console.log('PASS D/05-short-url');
