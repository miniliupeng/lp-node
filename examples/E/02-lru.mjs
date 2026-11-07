import assert from 'node:assert/strict';

class Lru {
  constructor(max) {
    if (!Number.isInteger(max) || max < 1) throw new RangeError('max');
    this.max = max;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.max) this.map.delete(this.map.keys().next().value);
    return this;
  }
}

const cache = new Lru(2);
cache.set('a', 1).set('b', 2);
assert.equal(cache.get('a'), 1);
cache.set('c', 3);
assert.equal(cache.get('b'), undefined);
assert.equal(cache.get('a'), 1);
assert.equal(cache.get('c'), 3);
console.log('PASS E/02-lru');
