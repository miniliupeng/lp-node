import assert from 'node:assert/strict';
import http from 'node:http';

const server = http.createServer(async (req, res) => {
  if (req.url === '/slow') {
    await new Promise((resolve) => setTimeout(resolve, 80));
    res.end('slow');
    return;
  }
  res.end('ok');
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (address === null || typeof address === 'string') throw new Error('expected address');
const base = `http://127.0.0.1:${address.port}`;
const slow = fetch(`${base}/slow`);
await new Promise((resolve) => setTimeout(resolve, 10));
const closed = new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()));
});
let refused = false;
try {
  await fetch(`${base}/`);
} catch {
  refused = true;
}
assert.equal(await (await slow).text(), 'slow');
await closed;
assert.equal(refused, true);
console.log('PASS D/04-graceful');
