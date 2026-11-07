import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { text } from 'node:stream/consumers';

const web = Readable.toWeb(Readable.from(['你好', 'Node']));
assert.equal(await text(Readable.fromWeb(web)), '你好Node');
const grouped = Object.groupBy(
  [
    { kind: 'a', n: 1 },
    { kind: 'b', n: 2 },
    { kind: 'a', n: 3 },
  ],
  (item) => item.kind,
);
assert.equal(grouped.a.length, 2);
assert.deepEqual([1, 2, 3, 4].values().filter((n) => n % 2 === 0).take(1).toArray(), [2]);

console.log('PASS C/07-pipeline');
