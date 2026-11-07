# B11 用 node:test 写测试

对应示例：[`examples/node-tutorial/B/11-sample.test.mjs`](../../../examples/node-tutorial/B/11-sample.test.mjs)

```bash
node --test examples/node-tutorial/B/11-sample.test.mjs
```

## 用例

```javascript
import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

test('adds numbers', () => {
  assert.equal(1 + 2, 3);
});
```

`node --test` 会找文件并输出 TAP。一个文件里可以有多个 `test`。`describe` / `it` 是同一套 API 的别名风格。失败的断言会使该用例失败，进程退出码非 0。

异步用例把函数写成 `async`，或返回 Promise。忘记 `await` 时，用例可能在断言之前就被标成成功。

## mock.fn

示例：

```javascript
const fn = mock.fn((value) => value + 1);
assert.equal(fn(1), 2);
assert.equal(fn.mock.calls.length, 1);
assert.deepEqual(fn.mock.calls[0].arguments, [1]);
```

`mock.fn` 在 22.23.4 上不需要实验旗标。`mock.timers` 会打印实验警告，教程的防抖示例改为注入 `{ set, clear }`，测试不依赖实验定时器。

`mock.method(obj, 'name', fn)` 可以替换对象上的方法，并在用例结束后恢复。用它替换时钟、随机数或出站客户端，不要在单元测试里真的打到外部网络。

## 测什么

- 纯函数：输入输出，包括边界（空字符串、0、上限）。
- 路由：起本机服务器，用 `fetch` 打 200、400、404、413，测完 `server.close()`。教程的 HTTP 示例就是这种形状，只是断言写在脚本里而不是 `test()` 里。
- 失败路径：拒绝、错误码、超时。

不要为了覆盖率去断言私有字段。覆盖率开关 `--experimental-test-coverage` 在 22.23 的帮助里仍标着 experimental。

## 自测

1. 500 的 HTTP 响应需要 `fetch` 抛错才能被测试发现吗？不需要。断言 `response.status`。
2. 为什么 mock 掉时钟？测试不要真的睡几秒，也避免和真实时间绑定。
3. 异步测试最常见的假通过是什么？忘了 `await`，用例函数提前返回。
