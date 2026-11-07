import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const node = process.execPath;
const timeoutMs = 15000;

const scripts = [
  'A/01-hello.mjs',
  'A/02-values.mjs',
  'A/03-functions.mjs',
  'A/04-json.mjs',
  'A/05-errors.mjs',
  'A/06-modules.mjs',
  'A/07-semver.mjs',
  'A/08-path-process.mjs',
  'A/09-fs.mjs',
  'A/10-async.mjs',
  'A/11-events.mjs',
  'A/12-http.mjs',
  'A/13-assert.mjs',
  'B/01-buffer.mjs',
  'B/02-backpressure.mjs',
  'B/03-atomic-write.mjs',
  'B/04-url.mjs',
  'B/05-tcp-frame.mjs',
  'B/06-http-router.mjs',
  'B/07-fetch-retry.mjs',
  'B/08-timers.mjs',
  'B/09-child-process.mjs',
  'B/10-crypto.mjs',
  'B/12-env.mjs',
  'B/13-sqlite.mjs',
  'B/14-sse.mjs',
  'B/15-websocket.mjs',
  'C/01-event-loop-cjs.cjs',
  'C/02-event-loop-mjs.mjs',
  'C/03-io-order.mjs',
  'C/04-async-order.cjs',
  'C/05-threadpool.mjs',
  'C/06-memory.mjs',
  'C/07-pipeline.mjs',
  'C/08-als.mjs',
  'C/09-worker.mjs',
  'C/10-cluster.mjs',
  'C/11-perf.mjs',
  'C/12-circular-main.mjs',
  'C/12-cjs-main.cjs',
  'C/13-cancel-and-rejection.mjs',
  'C/14-permission.mjs',
  'C/15-types-strip.mjs',
  'C/16-message-channel.cjs',
  'D/01-token-bucket.mjs',
  'D/02-jwt.mjs',
  'D/03-queue.mjs',
  'D/04-graceful.mjs',
  'D/05-short-url.mjs',
  'D/06-validation.mjs',
  'D/07-logger-als.mjs',
  'D/08-safe-path.mjs',
  'E/01-pool.mjs',
  'E/02-lru.mjs',
  'E/03-retry.mjs',
  'E/04-debounce.mjs',
];

function run(args) {
  return new Promise((resolve) => {
    const child = spawn(node, args, { cwd: root, stdio: 'inherit' });
    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      resolve({ args, code, signal });
    });
  });
}

const failures = [];
for (const script of scripts) {
  const result = await run([join(root, script)]);
  if (result.code !== 0) failures.push({ ...result, script });
}

const tested = await run(['--test', join(root, 'B/11-sample.test.mjs')]);
if (tested.code !== 0) failures.push({ ...tested, script: 'B/11-sample.test.mjs' });

if (failures.length > 0) {
  console.error('FAILED');
  for (const failure of failures) {
    console.error(`${failure.script} code=${failure.code} signal=${failure.signal}`);
  }
  process.exit(1);
}

console.log(`PASS run-all (${scripts.length + 1} programs)`);
