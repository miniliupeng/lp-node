# A11 事件

对应示例：[`examples/node-tutorial/A/11-events.mjs`](../../../examples/node-tutorial/A/11-events.mjs)

## EventEmitter

很多 Node 对象都是事件发射器：套接字、流、服务器、子进程。你注册监听器，对方在将来调用它。

```javascript
import { EventEmitter, once } from 'node:events';

const emitter = new EventEmitter();
emitter.on('tick', (n) => seen.push(n));
emitter.once('tick', () => seen.push('once'));
emitter.emit('tick', 1);
emitter.emit('tick', 2);
```

示例得到 `[1, 'once', 2]`。`on` 一直留着，`once` 在第一次之后移除。同一个事件上，监听器按注册顺序同步调用。`emit` 返回时，这些监听器已经跑完。

`once(emitter, 'done')` 返回 Promise，等到下一次该事件。示例在登记之后再 `emit('done', 'finished')`，`await` 得到 `['finished']`。参数以数组形式给出，因为事件可以带多个参数。

## error 事件是特殊的

如果对 `'error'` 调用 `emit`，而当时没有监听器，`EventEmitter` 会把那个错误抛出来。示例用子进程跑了一段没有监听器的 `emit('error')`，子进程非 0 退出，stderr 含 `boom`。

给服务器、流、套接字登记 `error` 监听器，至少要记日志。忽略错误可以写成空函数，但那是明确的决定，不是忘记。

流和请求更推荐 `stream.promises.pipeline`，它会把错误传递出来，见 B02。

## 监听器泄漏

默认情况下，同一事件超过 10 个监听器会打印 `MaxListenersExceededWarning`。这通常是每次请求都 `on`、却从不 `off`。在请求结束或 `AbortSignal` 中止时移除监听器。`once` 和 `events.once` 用完即删。

`emitter.off(name, fn)` 需要传入当时注册的同一个函数引用。临时箭头函数无法被 `off` 掉。

## 自测

1. `emit` 是同步还是异步？同步调用当前的监听器。
2. 没有 `error` 监听器时 `emit('error', err)` 会怎样？抛出 `err`。
3. 为什么警告最大监听器数量？帮助发现忘记移除的监听器。数量本身不是内存上限，可以用 `setMaxListeners` 调整，但先确认监听器确实需要那么多。
