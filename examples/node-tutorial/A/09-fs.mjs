import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = await mkdtemp(join(tmpdir(), 'lp-node-fs-'));
try {
  const file = join(dir, 'note.txt');
  await writeFile(file, 'hello\n', 'utf8');
  assert.equal(await readFile(file, 'utf8'), 'hello\n');

  const ac = new AbortController();
  ac.abort();
  await assert.rejects(readFile(file, { signal: ac.signal }), {
    name: 'AbortError',
    code: 'ABORT_ERR',
  });
} finally {
  await rm(dir, { recursive: true, force: true });
}

console.log('PASS A/09-fs');
