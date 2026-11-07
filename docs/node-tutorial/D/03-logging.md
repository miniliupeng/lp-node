# D03 日志

对应示例：[`examples/node-tutorial/D/07-logger-als.mjs`](../../../examples/node-tutorial/D/07-logger-als.mjs)

## 一行一个 JSON 对象

示例的 `log(level, message)` 返回：

```json
{"level":"info","message":"a","requestId":"req-a"}
```

字段稳定之后，收集系统才能索引。不要把异常拼进无结构的长句里。错误对象单独放 `err.message`、`err.code`、`err.stack`（栈留在服务端）。

级别至少区分：`debug`（默认关）、`info`（请求完成）、`error`（需要人看）。不要用 `console.log` 充当唯一通道，它没有级别，也无法自动带上请求号。

## 请求号

`AsyncLocalStorage.run({ requestId }, ...)` 之后，深层函数调用 `log` 不必再传请求号。示例让 `req-a` 等待 10ms，同时 `req-b` 立刻打日志，两条记录的 `requestId` 各自正确。`run` 外面是 `null`。

入口生成 `crypto.randomUUID()`，并把它放进响应头 `x-request-id`，方便调用方报障时对上日志。

## 要避免的内容

- 口令、令牌、Cookie、完整的支付卡号
- 把用户输入原样放进日志后再当成格式字符串（本示例用 JSON.stringify，输入只是 `message` 字段的值）
- 每个请求打多份完整正文。正文可能很大，也可能含个人数据

## 自测

1. 为什么用 JSON 而不是空格分隔的句子？字段可以稳定索引，句子一改解析就坏。
2. 请求号怎样穿过 `await`？放在 `AsyncLocalStorage` 里。
3. 栈应该出现在 HTTP 响应里吗？不应该。它出现在服务端日志里。
