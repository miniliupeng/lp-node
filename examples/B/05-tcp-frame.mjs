import assert from 'node:assert/strict';
import net from 'node:net';

function encodeFrame(text) {
  const body = Buffer.from(text);
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length);
  return Buffer.concat([header, body]);
}

function createParser(onFrame) {
  let pending = Buffer.alloc(0);
  return (chunk) => {
    pending = Buffer.concat([pending, chunk]);
    while (pending.length >= 4) {
      const length = pending.readUInt32BE(0);
      if (length > 1024 * 1024) throw new Error('frame too large');
      if (pending.length < 4 + length) return;
      const body = pending.subarray(4, 4 + length).toString('utf8');
      pending = Buffer.from(pending.subarray(4 + length));
      onFrame(body);
    }
  };
}

const server = net.createServer((socket) => {
  socket.on('data', createParser((text) => socket.write(encodeFrame(`echo:${text}`))));
  socket.on('error', () => {});
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (address === null || typeof address === 'string') throw new Error('expected address');

try {
  const echoed = await new Promise((resolve, reject) => {
    const frames = [];
    const socket = net.connect(address.port, '127.0.0.1', () => {
      socket.write(Buffer.concat([encodeFrame('one'), encodeFrame('two')]));
    });
    socket.on('data', createParser((text) => {
      frames.push(text);
      if (frames.length === 2) {
        socket.end();
        resolve(frames);
      }
    }));
    socket.on('error', reject);
  });
  assert.deepEqual(echoed, ['echo:one', 'echo:two']);
} finally {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

console.log('PASS B/05-tcp-frame');
