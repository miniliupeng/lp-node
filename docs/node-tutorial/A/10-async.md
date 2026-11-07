# A10 异步入门

对应示例：[`examples/node-tutorial/A/10-async.mjs`](../../../examples/node-tutorial/A/10-async.mjs)

这一章把 Promise 用对。回调和微任务的精确顺序在 Part C，那里有断言，不在这里提前背口诀。

## 回调为什么不够

Node 早期 API 的形状是 `fn(..., (error, value) => {})`。错误放在第一个参数。嵌套几层之后，错误处理会漏：有的分支忘记调用回调，有的调用了两次。

Promise 把“将来的成功或失败”变成一个对象，失败只会进入拒绝状态一次。

## Promise 的三种状态

- pending：还没有结果
- fulfilled：有一个值
- rejected：有一个原因

状态只走一次。`then` 登记成功回调，`catch` 登记失败回调，`finally` 两边都会走。

`Promise.withResolvers()` 在 22.23.4 可用。它返回 `{ promise, resolve, reject }`，适合把还没有 Promise 化的回调 API 包一层。示例用它把 5 送进 promise 再 `await` 出来。

自己写 `new Promise` 时，记住在每个分支里恰好结算一次，并在 `reject` 时传入 `Error` 对象，这样栈才有用。

## async / await

`async` 函数总是返回 Promise。函数里的 `return 1` 会把这个 Promise 完成成 1。`throw` 或 `await` 到拒绝，都会让返回的 Promise 拒绝。

`await` 会暂停这个 async 函数，等右侧的 Promise 落定。在等待期间，进程可以去跑别的 JavaScript，所以 `await` 不是“线程睡眠”，主线程没有被占住。真正占住主线程的是长时间的同步循环。

```javascript
function delay(ms, value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

const value = await delay(1, 7);
```

## 多个 Promise

`Promise.all`：全部成功才成功；有一个拒绝就拒绝。适合“缺一不可”的读取。示例断言其中一个拒绝时，`all` 拒绝。

`Promise.allSettled`：等全部落定，每项是 `{ status: 'fulfilled', value }` 或 `{ status: 'rejected', reason }`。适合“能做多少做多少”，例如批量刷新缓存。示例断言两项的 `status`。

`Promise.race`：谁先落定用谁，其余的仍会在后台继续。需要取消其余工作时，给它们同一个 `AbortSignal`。

`Promise.any`：谁先成功用谁；全部拒绝才拒绝。

## 错误不要丢

```javascript
try {
  await load();
} catch (error) {
  logger.error(error);
  throw error;
}
```

浮空的 Promise（创建了但没有 `await` 或 `catch`）如果拒绝，在 Node 22 上默认会导致进程退出。见 [C13](../C/13-failure.md)。

## 自测

1. `async` 函数里 `return 1`，调用方拿到的是什么？一个会完成成 1 的 Promise。要值就 `await`。
2. 什么时候用 `allSettled` 而不是 `all`？部分失败不应该取消整批结果的时候。
3. `await` 会不会挡住别的请求？不会挡住进程里其他已经就绪的 JavaScript。同步死循环才会。
