import assert from 'node:assert/strict';

export function createMemoryQueue() {
  let seq = 1;
  const items = [];
  return {
    push(payload) {
      const id = seq;
      seq += 1;
      items.push({ id, payload, visibleAt: 0 });
      return id;
    },
    pull(now, visibilityMs) {
      const job = items.find((item) => item.visibleAt <= now);
      if (!job) return undefined;
      job.visibleAt = now + visibilityMs;
      return { id: job.id, payload: job.payload };
    },
    ack(id) {
      const index = items.findIndex((item) => item.id === id);
      if (index >= 0) items.splice(index, 1);
    },
    size() {
      return items.length;
    },
  };
}

const queue = createMemoryQueue();
const id = queue.push({ kind: 'email' });
const first = queue.pull(0, 1000);
assert.deepEqual(first, { id, payload: { kind: 'email' } });
assert.equal(queue.pull(500, 1000), undefined);
const again = queue.pull(1000, 1000);
assert.equal(again.id, id);
queue.ack(id);
assert.equal(queue.size(), 0);
assert.equal(queue.pull(5000, 1000), undefined);

console.log('PASS D/03-queue');
