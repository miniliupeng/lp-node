import assert from 'node:assert/strict';

function createContainer() {
  const registrations = new Map();
  const singletons = new Map();
  const container = {
    register(token, factory, options = {}) {
      registrations.set(token, { factory, singleton: options.singleton !== false });
    },
    resolve(token) {
      const item = registrations.get(token);
      if (!item) throw new Error(`missing ${token}`);
      if (item.singleton && singletons.has(token)) return singletons.get(token);
      const instance = item.factory(container);
      if (item.singleton) singletons.set(token, instance);
      return instance;
    },
  };
  return container;
}

const container = createContainer();
let dbBuilds = 0;
container.register('db', () => {
  dbBuilds += 1;
  return { query: (name) => ({ name }) };
});
container.register('users', (c) => {
  const db = c.resolve('db');
  return { find: (name) => db.query(name) };
});

const users = container.resolve('users');
assert.deepEqual(users.find('ada'), { name: 'ada' });
assert.equal(container.resolve('db'), container.resolve('db'));
assert.equal(dbBuilds, 1);

console.log('PASS D/10-di');
