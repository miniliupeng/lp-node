import assert from 'node:assert/strict';
import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = await mkdtemp(join(tmpdir(), 'lp-node-atomic-'));
try {
  const target = join(dir, 'config.json');
  const temporary = join(dir, `.config.json.${process.pid}.tmp`);
  await writeFile(temporary, '{"ok":true}\n');
  await rename(temporary, target);
  assert.equal(await readFile(target, 'utf8'), '{"ok":true}\n');
} finally {
  await rm(dir, { recursive: true, force: true });
}

console.log('PASS B/03-atomic-write');
