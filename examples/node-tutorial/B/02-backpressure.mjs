import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const writes = [];
const dest = new Writable({
  highWaterMark: 1,
  write(chunk, _encoding, callback) {
    writes.push(String(chunk));
    setTimeout(callback, 5);
  },
});

const results = [dest.write('a'), dest.write('b')];
assert.ok(results.includes(false));
await new Promise((resolve) => dest.once('drain', resolve));
dest.end();
await new Promise((resolve) => dest.once('finish', resolve));
assert.deepEqual(writes, ['a', 'b']);

await assert.rejects(
  pipeline(
    Readable.from(['x']),
    new Writable({
      write(_chunk, _encoding, callback) {
        callback(new Error('write failed'));
      },
    })
  ),
  /write failed/
);

console.log('PASS B/02-backpressure');
