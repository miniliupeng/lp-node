import assert from 'node:assert/strict';
import { fromB } from './12-circular-a.mjs';

assert.deepEqual(fromB(), { bName: 'module-b', seen: 'module-a' });
try {
  await import('./12-tdz-a.mjs');
  throw new Error('expected TDZ');
} catch (error) {
  assert.equal(error instanceof ReferenceError, true);
}
console.log('PASS C/12-circular-main');
