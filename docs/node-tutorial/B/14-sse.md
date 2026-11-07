# B14 Server-Sent Events

对应示例：[`examples/node-tutorial/B/14-sse.mjs`](../../../examples/node-tutorial/B/14-sse.mjs)

## 服务器单向推文本

SSE 是普通的 HTTP 响应，`Content-Type` 为 `text/event-stream`。正文由空行分隔的事件组成：

```text
: keep-alive

event: ping
data: hello

data: {"n":1}

```

- 以 `:` 开头的行是注释。示例用它表示心跳，解析器会跳过。
- `event:` 设置事件名。没有这行时，事件名是 `message`。
- `data:` 是载荷。多行 `data:` 用换行拼起来。
- 一个空行表示事件结束。

示例写出注释、一个 `ping` 事件和一个默认事件，然后 `res.end()`。客户端用 `fetch` 读完正文，再用几行解析函数得到：

```javascript
[
  { event: 'ping', data: 'hello' },
  { event: 'message', data: '{"n":1}' },
]
```

22.23.4 没有全局 `EventSource`。浏览器里有。Node 客户端用 `fetch` 读响应体的流即可。长连接不要等 `text()` 收齐再处理，应当边读边按 `\n\n` 切事件。示例因为服务器马上 `end()`，所以一次性读完也能看到完整事件。

## 头

`Cache-Control: no-cache` 避免中间层把流缓存成一个完整文件。需要断开时，客户端中止 `fetch`，服务器监听 `req` 的 `close` 停止生产。不要在客户端离开后继续写。

## 和 WebSocket 的选择

只需要服务器推文本、客户端偶尔用普通 HTTP 说话时，SSE 更简单，走普通代理和 HTTP 状态码。需要客户端高频发送二进制或双向帧时，用 WebSocket，见下一章。

## 自测

1. 事件之间用什么分隔？一个空行，也就是 `\n\n`。
2. 没有 `event:` 行时名字是什么？`message`。
3. Node 22.23 有 `EventSource` 吗？没有。
