import assert from 'node:assert/strict';
import cluster from 'node:cluster';
import http from 'node:http';

function get(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { agent: false }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
  });
}

if (cluster.isPrimary) {
  const worker = cluster.fork();
  const body = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('cluster timeout')), 4000);
    worker.on('message', async (message) => {
      if (message?.type !== 'ready') return;
      try {
        clearTimeout(timer);
        resolve(await get(`http://127.0.0.1:${message.port}/`));
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  });
  assert.match(body, /^pid:\d+$/);
  worker.kill('SIGTERM');
  await new Promise((resolve) => cluster.once('exit', resolve));
  console.log('PASS C/10-cluster');
} else {
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end(`pid:${process.pid}`);
  });
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    if (address && typeof address !== 'string') process.send({ type: 'ready', port: address.port });
  });
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}
