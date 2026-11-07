import assert from 'node:assert/strict';
import http from 'node:http';

function addressOf(server) {
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('expected address');
  return address;
}

let hits = 0;
const server = http.createServer((_req, res) => {
  hits += 1;
  if (hits === 1) {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('try again');
    return;
  }
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('ready');
});

async function fetchWithRetry(url, attempts) {
  let lastStatus = 0;
  for (let i = 0; i < attempts; i += 1) {
    const response = await fetch(url);
    lastStatus = response.status;
    if (response.ok) return response;
    await response.arrayBuffer();
  }
  throw new Error(`failed with ${lastStatus}`);
}

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
try {
  const { port } = addressOf(server);
  const response = await fetchWithRetry(`http://127.0.0.1:${port}/`, 2);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'ready');
  assert.equal(hits, 2);
} finally {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
}

console.log('PASS B/07-fetch-retry');
