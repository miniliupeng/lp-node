# D11 安全清单

这一章只讲防御：哪些输入会改变程序的含义，以及对应的 API 该怎么用。示例都在本机、假数据上。

| 风险 | 做法 | 示例 |
| --- | --- | --- |
| 路径逃出根目录 | `path.resolve` 之后检查 `path.relative` | `D/08-safe-path.mjs`、A08 |
| 命令注入 | 参数数组，不启 shell | `B/09-child-process.mjs` |
| SQL 注入 | 预编译参数 | `B/13-sqlite.mjs` |
| 原型污染 | 不递归合并不可信对象；JSON.parse 在 22.23 不会改原型 | A04 |
| 令牌比较泄露时序 | 长度相同后 `timingSafeEqual` | `B/10-crypto.mjs` |
| JWT 算法被换成 `none` | 只接受 `HS256` | `D/02-jwt.mjs` |
| 巨大请求体 | 字节上限，413 | `B/06-http-router.mjs` |
| 服务端请求伪造 | 解析 URL 后做协议和主机允许列表 | B04、B07 |
| 秘密进日志 | 结构化日志不打环境变量和 `Authorization` | D03 |
| 依赖漏洞 | 锁文件、定期审计、尽快升级补丁版本 | A07 |
| 权限过大 | 操作系统用户、容器、必要时 `--permission` | C14 |

## 路径

`resolveInside` 允许 `a/../b.txt`（仍在根内），拒绝 `../secret`、`/etc/passwd` 和 `a/../../secret`。错误码 `E_PATH_ESCAPE`。

这是字符串层面的检查。若目录里可能出现符号链接，打开文件后还要用真实路径再查一次。

## 命令

示例把含分号的字符串当作 `node -e` 的 argv 打印出来，没有创建文件。需要 shell 的功能时重新设计输入，而不是把用户字符串拼进 `exec`。

## 头

对外响应可以加上：

- `X-Content-Type-Options: nosniff`
- 明确的 `Content-Type`
- 只在 HTTPS 上发送的 Cookie 属性（D06）

安全头不是认证。没有会话检查时，头不会拦住未登录用户。

## 正则

不可信的正则表达式可以让匹配时间相对输入长度爆炸。不要把用户输入编译成正则。固定的正则也要避免含糊的嵌套量词。

## 依赖

`pnpm audit` 或同等工具看已知漏洞。审计报告要人工看：测试工具的漏洞和生产运行路径上的漏洞不是同一优先级。锁文件保证你装的是审计过的那一棵树。

## 自测

1. `path.join(root, req.query.file)` 够安全吗？不够。`..` 会走出根目录。
2. `timingSafeEqual` 能比较不同长度吗？不能，会抛 `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH`。先比长度，不同则失败。
3. `--permission` 能代替参数化 SQL 吗？不能。它限制的是进程权限，不是查询语法。
