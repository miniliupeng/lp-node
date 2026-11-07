import assert from 'node:assert/strict';

function compose(middlewares) {
  return function run(context) {
    let index = -1;
    function dispatch(cursor) {
      if (cursor <= index) return Promise.reject(new Error('next called twice'));
      index = cursor;
      const fn = middlewares[cursor];
      if (!fn) return Promise.resolve();
      return Promise.resolve(fn(context, () => dispatch(cursor + 1)));
    }
    return dispatch(0);
  };
}

const trace = [];
const app = compose([
  async (ctx, next) => {
    trace.push('a-before');
    try {
      await next();
      trace.push('a-after');
    } catch (error) {
      trace.push(`a-catch:${error.message}`);
    }
  },
  async (ctx, next) => {
    trace.push('b-before');
    await next();
    trace.push('b-after');
  },
  async (ctx) => {
    trace.push('handler');
    ctx.body = 'ok';
  },
]);

const context = {};
await app(context);
assert.equal(context.body, 'ok');
assert.deepEqual(trace, ['a-before', 'b-before', 'handler', 'b-after', 'a-after']);

const bad = compose([
  async (_ctx, next) => {
    await next();
    await next();
  },
  async () => {},
]);
await assert.rejects(bad({}), /next called twice/);

console.log('PASS D/09-compose');
