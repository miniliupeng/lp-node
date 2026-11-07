# URL

示例：`examples/B/04-url.mjs`

用 WHATWG `URL`，不要用字符串切 `?` 和 `#`。

```javascript
const url = new URL('https://example.com/a/b?x=1&x=2#top');
url.pathname; // '/a/b'
url.searchParams.getAll('x'); // ['1', '2']
```

`new URL('/health', 'http://127.0.0.1:3000')` 得到绝对地址。第二个参数是基准，相对路径靠它补全。

`url.hash` 含 `#`，浏览器默认不把它发给服务器。服务端路由不要依赖 hash。

22.23.4 没有全局 `URLPattern`。示例断言它是 `undefined`。路由用明确的路径判断，见[HTTP 路由与正文](./06-HTTP路由与正文.md)。

`searchParams` 会编码空格和 `&`。手工拼接查询字符串容易把用户输入变成额外参数。


## 是什么

WHATWG `URL` 把协议、主机、路径、查询和片段分成字段。`URLSearchParams` 负责编码。22.23.4 没有全局 `URLPattern`。路由用明确的路径比较，见[HTTP 路由与正文](./06-HTTP路由与正文.md)。

## 为什么不要自己切问号

查询里的值可以包含编码后的 `?`、`&` 和空格。手写 `split('&')` 再 `split('=')` 会把用户输入变成额外参数，或者把 `%26` 解错。`searchParams.get` 取第一个，`getAll` 取重复键的全部值。

`new URL('/health', 'http://127.0.0.1:3000')` 用第二个参数补全相对路径。`url.hash` 含 `#`。浏览器默认不把片段发给服务器，服务端路由不要依赖它。

`req.url` 在 Node 的 HTTP 服务器里通常是路径加查询，不含协议和主机。把它交给 `new URL(req.url, 'http://127.0.0.1')` 再取 `pathname`。比较路由时用 `pathname`，不要用 `includes`，否则 `/health-extra` 会命中 `/health`。

## 本章问答

### 1. 为什么没有 URLPattern 就不能做路由？

**考点：** 分清语言标准和这个二进制实际有的全局对象。

**回答：** 22.23.4 上 `globalThis.URLPattern` 是 `undefined`。路径不多时，用 `pathname` 相等或事先写好的分段规则。不要假设下一条 Node 版本会自动出现这个全局对象，换版本要重跑示例。

### 2. hash 能不能当服务端参数？

**考点：** 片段不在请求里。

**回答：** 不能。它留在浏览器。需要服务器看见的状态放查询或正文。

### 3. 同一个键出现两次怎么办？

**考点：** `get` 和 `getAll`。

**回答：** `get` 只返回第一个。`getAll` 返回数组。把重复键收成一个字符串会丢掉后面的值。示例断言 `x=1&x=2` 的 `getAll` 是 `['1','2']`。

## 事故复盘

路由用 `req.url.includes('/health')`。`/health-check` 和 `/health?x=/health` 都命中。先 `new URL(req.url, 'http://127.0.0.1')`，再比较 `pathname`。

自己用 `split('&')` 解析查询，值里的编码 `%26` 被当成新的参数。用 `searchParams.get` 和 `getAll`。重复键不要只用 `get`，否则第二个值消失。

把 `location.hash` 当服务端分页参数。浏览器不会把片段发给服务器，分页永远停在第一页。状态放查询或正文。
