import assert from 'node:assert/strict';
import http from 'node:http';

function addressOf(server) {
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('expected address');
  return address;
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        const error = new Error('payload too large');
        error.statusCode = 413;
        reject(error);
        req.pause();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', () => {});
  });
}

const server = http.createServer(async (req, res) => {
  const key = `${req.method} ${req.url}`;
  try {
    if (key === 'GET /health') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (key === 'POST /echo') {
      const raw = await readBody(req, 32);
      const json = JSON.parse(raw.toString('utf8'));
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ echo: json }));
      return;
    }
    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'not found' }));
  } catch (error) {
    const status = error.statusCode ?? 400;
    if (!res.headersSent) {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', connection: 'close' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
try {
  const { port } = addressOf(server);
  const base = `http://127.0.0.1:${port}`;
  assert.deepEqual(await (await fetch(`${base}/health`)).json(), { ok: true });
  const echo = await fetch(`${base}/echo`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'ada' }),
  });
  assert.deepEqual(await echo.json(), { echo: { name: 'ada' } });
  assert.equal((await fetch(`${base}/nope`)).status, 404);
  assert.equal((await fetch(`${base}/echo`, { method: 'POST', body: 'x'.repeat(64) })).status, 413);
} finally {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

console.log('PASS B/06-http-router');
