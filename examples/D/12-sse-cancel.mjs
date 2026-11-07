import assert from 'node:assert/strict';
import http from 'node:http';

const tokens = ['你', '好', '，', '世', '界'];
let sent = 0;

const server = http.createServer(async (req, res) => {
  let stopped = false;
  req.on('close', () => {
    stopped = true;
  });
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });
  for (const token of tokens) {
    if (stopped) break;
    res.write(`data: ${token}\n\n`);
    sent += 1;
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  if (!stopped) {
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (address === null || typeof address === 'string') throw new Error('expected address');
const controller = new AbortController();
try {
  const response = await fetch(`http://127.0.0.1:${address.port}/stream`, { signal: controller.signal });
  const reader = response.body.getReader();
  const first = await reader.read();
  assert.equal(first.done, false);
  controller.abort();
  await reader.cancel().catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 180));
  assert.ok(sent >= 1 && sent < tokens.length, `sent ${sent}`);
} finally {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}
console.log('PASS D/12-sse-cancel');
