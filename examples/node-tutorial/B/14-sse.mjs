import assert from 'node:assert/strict';
import http from 'node:http';

function addressOf(server) {
  const address = server.address();
  if (address === null || typeof address === 'string') throw new Error('expected address');
  return address;
}

function parseSse(text) {
  const events = [];
  for (const block of text.split('\n\n')) {
    if (!block.trim()) continue;
    let event = 'message';
    const data = [];
    for (const line of block.split('\n')) {
      if (line.startsWith(':')) continue;
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
    }
    if (data.length > 0) events.push({ event, data: data.join('\n') });
  }
  return events;
}

const server = http.createServer((req, res) => {
  if (req.url !== '/events') {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });
  res.write(': keep-alive\n\n');
  res.write('event: ping\ndata: hello\n\n');
  res.write('data: {"n":1}\n\n');
  res.end();
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
try {
  const { port } = addressOf(server);
  const response = await fetch(`http://127.0.0.1:${port}/events`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/event-stream/);
  assert.equal(typeof EventSource, 'undefined');
  const events = parseSse(await response.text());
  assert.deepEqual(events, [
    { event: 'ping', data: 'hello' },
    { event: 'message', data: '{"n":1}' },
  ]);
} finally {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
}

console.log('PASS B/14-sse');
