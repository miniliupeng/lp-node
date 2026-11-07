import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import http from 'node:http';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function acceptValue(key) {
  return createHash('sha1')
    .update(key + GUID)
    .digest('base64');
}

function encodeFrame(opcode, payload) {
  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  if (body.length > 65535) throw new Error('frame too large');
  const head = body.length < 126 ? Buffer.alloc(2) : Buffer.alloc(4);
  head[0] = 0x80 | opcode;
  if (body.length < 126) head[1] = body.length;
  else {
    head[1] = 126;
    head.writeUInt16BE(body.length, 2);
  }
  return Buffer.concat([head, body]);
}

function readFrame(buffer) {
  if (buffer.length < 2) return null;
  const opcode = buffer[0] & 0x0f;
  const masked = (buffer[1] & 0x80) !== 0;
  let length = buffer[1] & 0x7f;
  let offset = 2;
  if (length === 126) {
    if (buffer.length < 4) return null;
    length = buffer.readUInt16BE(2);
    offset = 4;
  } else if (length === 127) {
    if (buffer.length < 10) return null;
    const bits = buffer.readBigUInt64BE(2);
    if (bits > 1024n * 1024n) throw new Error('frame too large');
    length = Number(bits);
    offset = 10;
  }
  if (length > 1024 * 1024) throw new Error('frame too large');
  const maskLength = masked ? 4 : 0;
  if (buffer.length < offset + maskLength + length) return null;
  const mask = masked ? buffer.subarray(offset, offset + 4) : null;
  offset += maskLength;
  const payload = Buffer.from(buffer.subarray(offset, offset + length));
  if (mask) {
    for (let i = 0; i < payload.length; i += 1) payload[i] ^= mask[i % 4];
  }
  return { opcode, payload, rest: Buffer.from(buffer.subarray(offset + length)) };
}

async function asText(data) {
  if (typeof data === 'string') return data;
  if (Buffer.isBuffer(data)) return data.toString('utf8');
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString('utf8');
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString('utf8');
  }
  if (data && typeof data.text === 'function') return data.text();
  return String(data);
}

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('upgrade only');
});

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  const upgrade = String(req.headers.upgrade ?? '').toLowerCase();
  if (!key || upgrade !== 'websocket') {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    return;
  }
  socket.write(
    [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptValue(key)}`,
      '',
      '',
    ].join('\r\n')
  );
  let pending = Buffer.alloc(0);
  socket.on('data', (chunk) => {
    pending = Buffer.concat([pending, chunk]);
    while (true) {
      const frame = readFrame(pending);
      if (!frame) break;
      pending = frame.rest;
      if (frame.opcode === 0x8) {
        socket.end(encodeFrame(0x8, Buffer.alloc(0)));
        return;
      }
      if (frame.opcode === 0x9) {
        socket.write(encodeFrame(0xa, frame.payload));
        continue;
      }
      if (frame.opcode === 0x1) {
        socket.write(encodeFrame(0x1, Buffer.from(`echo:${frame.payload.toString('utf8')}`)));
      }
    }
  });
  socket.on('error', () => {});
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (address === null || typeof address === 'string') throw new Error('expected address');

try {
  const text = await new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${address.port}`);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error('websocket timeout'));
    }, 2000);
    ws.addEventListener('error', () => {
      clearTimeout(timer);
      reject(new Error('websocket error'));
    });
    ws.addEventListener('open', () => ws.send('hi'));
    ws.addEventListener('message', (event) => {
      clearTimeout(timer);
      resolve(asText(event.data));
      ws.close();
    });
  });
  assert.equal(await text, 'echo:hi');
} finally {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
}

console.log('PASS B/15-websocket');
