import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('exit', (code) => resolve({ code, stdout, stderr }));
  });
}

const literal = 'hello; touch /tmp/lp-node-should-not-exist';
const result = await run(['-e', 'console.log(process.argv[1])', literal]);
assert.equal(result.code, 0);
assert.equal(result.stdout.trim(), literal);
assert.equal(existsSync('/tmp/lp-node-should-not-exist'), false);

console.log('PASS B/09-child-process');
