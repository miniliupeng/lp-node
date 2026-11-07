import assert from 'node:assert/strict';

const tools = {
  query_user(args) {
    if (args?.id !== 'u1') {
      const error = new Error('not found');
      error.toolError = true;
      throw error;
    }
    return 'ada';
  },
};

function rpcError(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

function handle(message) {
  if (message.id === undefined) return null;
  const { id, method, params } = message;
  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        resultType: 'complete',
        tools: [{ name: 'query_user', inputSchema: { type: 'object' } }],
      },
    };
  }
  if (method === 'tools/call') {
    const fn = tools[params?.name];
    if (!fn) return rpcError(id, -32602, 'unknown tool');
    try {
      const text = fn(params.arguments ?? {});
      return {
        jsonrpc: '2.0',
        id,
        result: { resultType: 'complete', content: [{ type: 'text', text }], isError: false },
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        result: { resultType: 'complete', content: [{ type: 'text', text: error.message }], isError: true },
      };
    }
  }
  return rpcError(id, -32601, 'method not found');
}

const listed = handle({ jsonrpc: '2.0', id: 1, method: 'tools/list' });
assert.equal(listed.result.tools[0].name, 'query_user');
const called = handle({
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/call',
  params: { name: 'query_user', arguments: { id: 'u1' } },
});
assert.equal(called.result.content[0].text, 'ada');
assert.equal(called.result.isError, false);
const missing = handle({
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: { name: 'query_user', arguments: { id: 'nope' } },
});
assert.equal(missing.result.isError, true);
assert.equal(handle({ jsonrpc: '2.0', id: 4, method: 'nope' }).error.code, -32601);
assert.equal(handle({ jsonrpc: '2.0', method: 'notifications/message' }), null);

console.log('PASS D/11-mcp');
