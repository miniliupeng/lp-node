import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { EventEmitter, once } from 'node:events';

const emitter = new EventEmitter();
const seen = [];
emitter.on('tick', (n) => seen.push(n));
emitter.once('tick', () => seen.push('once'));
emitter.emit('tick', 1);
emitter.emit('tick', 2);
assert.deepEqual(seen, [1, 'once', 2]);

const waited = once(emitter, 'done');
emitter.emit('done', 'finished');
assert.deepEqual(await waited, ['finished']);

const crashed = spawnSync(
  process.execPath,
  ['-e', 'const {EventEmitter}=require("node:events"); new EventEmitter().emit("error", new Error("boom"));'],
  { encoding: 'utf8' },
);
assert.notEqual(crashed.status, 0);
assert.match(crashed.stderr, /boom/);

console.log('PASS A/11-events');
