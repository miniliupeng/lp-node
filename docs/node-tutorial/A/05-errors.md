# A05 错误

对应示例：[`examples/node-tutorial/A/05-errors.mjs`](../../../examples/node-tutorial/A/05-errors.mjs)

## 抛出与捕获

`throw` 会中断当前调用栈，直到某个 `try/catch` 接住。接不住就变成未捕获异常，进程默认退出。

捕获后要处理：记录足够的上下文、转换成调用方能理解的结果、或继续抛出。空的 `catch {}` 会把故障吞掉，调用方以为成功。

判断错误种类用 `instanceof`，或看 Node 系统错误上的 `code`（如 `ENOENT`、`ABORT_ERR`）。比较 `error.message` 的英文句子很脆，句子会随版本调整。

## Error 上有什么

`new Error('cannot save', { cause })` 带上原因链。示例里的 `cause` 是原来的 `disk full`。日志里应把 `cause` 打出来，否则只剩最外层的一句“cannot save”。

`error.stack` 是字符串，包含构造 `Error` 时的调用栈。示例断言栈文本里能找到当前文件名。把栈返回给 HTTP 客户端会泄露目录结构，响应里给稳定的错误码，栈留在服务端日志。

## 自定义错误

```javascript
class AppError extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.name = 'AppError';
    this.code = code;
  }
}
```

设置 `name`，否则有些日志只显示 `Error`。`code` 用稳定字符串，例如 `E_PORT`，给程序分支使用。

示例的 `parsePort`：合法端口返回数字；`0` 抛 `AppError`，`code` 为 `E_PORT`。

跨 `vm` 或跨 Worker 时，`instanceof` 可能失败，因为两边的 `Error` 构造函数不是同一个函数。跨边界优先约定 `code` 字段。

## 同步错误和异步错误

`try/catch` 能接住同一调用栈里的 `throw`，也能接住 `await` 到的拒绝。它接不住已经脱离当前栈的回调里的 `throw`，除非那个回调自己有 `try/catch`。Promise 的拒绝要用 `await`、`.catch` 或 `try/catch` 包住 `await`。这部分的顺序在 [A10](./10-async.md) 和 [C03](../C/03-queues.md)。

## 自测

1. 为什么响应体里不返回 `error.stack`？栈包含服务器路径和内部函数名。
2. `cause` 解决什么问题？保留外层语义的同时留下原始失败。
3. 端口校验为什么抛错误而不是返回 `NaN`？调用方漏判 `NaN` 时会把坏配置继续传下去；抛错会在边界停住。
