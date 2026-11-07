# B04 URL

对应示例：[`examples/node-tutorial/B/04-url.mjs`](../../../examples/node-tutorial/B/04-url.mjs)

## 用 WHATWG URL

`new URL('https://example.com:8443/a/b?q=1&q=2#top')` 把字符串拆开。示例断言：

- `hostname` 是 `example.com`（不含端口）
- `port` 是字符串 `'8443'`
- `pathname` 是 `/a/b`
- `hash` 是 `#top`
- `searchParams.getAll('q')` 是 `['1', '2']`

重复的查询键要用 `getAll`。`get` 只返回第一个。

`searchParams.set('lang', 'zh')` 会更新 `url.search`。不要自己用正则切查询字符串。

## 相对解析

`new URL('/health', 'http://127.0.0.1:3000/app/')` 的结果是 `http://127.0.0.1:3000/health`。绝对路径会替换掉基址的路径。基址应当是完整的绝对 URL。

拼接用户提供的地址时，先解析，再检查 `protocol` 是否在允许列表（只要 `https:`），并检查主机名。这是防止服务端请求伪造时的第一步：不要把用户字符串直接交给 `fetch`。允许列表比“挡住 127.0.0.1”更接近正确，因为还有 DNS 重绑定、IPv6、十进制 IP 等写法。教程不提供扫描器，只把检查放在解析之后。

## 这个版本没有 URLPattern

22.23.4 上 `typeof URLPattern` 是 `"undefined"`。路由匹配用明确的路径比较，或引入已经声明的依赖。示例断言了这个全局不存在，避免教程写成“Node 22 自带 URLPattern”。

`querystring` 模块是旧 API。新代码用 `URL` 和 `URLSearchParams`。

## 自测

1. `hostname` 和 `host` 的差别？`host` 可以带端口，`hostname` 不带。
2. 为什么查询值不要手写 `split('&')`？编码、重复键、`+` 与空格的规则容易错。`URLSearchParams` 已经实现这些规则。
3. 用户传来的 URL 在请求第三方之前要检查什么？协议和主机是否在允许列表里。
