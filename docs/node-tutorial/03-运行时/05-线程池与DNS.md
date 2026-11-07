# 线程池与 DNS

示例：`examples/C/05-threadpool.mjs`

libuv 线程池默认 4。`UV_THREADPOOL_SIZE` 在进程启动时读取，改 `process.env` 影响不了已经在跑的进程。

在 **22.23.4 这枚二进制**上，下面几件事走线程池：

- 异步 `fs.readFile`
- `dns.lookup`（`getaddrinfo`）
- `pbkdf2` / `scrypt`
- 异步 `randomBytes`
- 异步 zlib

实验：子进程里先提交一个 400000 次的 `pbkdf2`，5ms 后再 `readFile`。

- `UV_THREADPOOL_SIZE=1` 时，读取要等哈希结束，实测约几十毫秒。
- 池大小为 4 时，读取约 1ms 完成。

断言是 `blocked > free + 15` 且 `free < 40`。数字会随机器浮动，关系应当保持。

`dns.lookup('localhost')` 走 `getaddrinfo` 和系统 hosts，会占用线程池。本机上 `localhost` 得到 `::1`、family 6，不要把这个地址写死成所有机器的结果。

`dns.resolve4` 走 c-ares，不占这个线程池。不要在示例里写死 `example.com` 的 A 记录。

22.23.4 的默认文件 I/O 不是 io_uring。不要在没核对 `process.report` 或源码的情况下声称已经切换。


## 是什么

libuv 线程池默认 4。`UV_THREADPOOL_SIZE` 必须在进程启动时就位。22.23.4 这枚二进制上，异步 `readFile`、`dns.lookup`、`pbkdf2`、`scrypt`、异步 `randomBytes`、异步 zlib 走这个池。

## 实验在断言什么

子进程里先提交一个 400000 次的 `pbkdf2`，5ms 后再 `readFile`。池大小为 1 时读取要等哈希，池大小为 4 时读取大约 1ms。断言是 `blocked > free + 15` 且 `free < 40`。绝对数字会浮动，关系应当保持。

`dns.lookup` 走 `getaddrinfo` 和系统 hosts，占用线程池。本机上 `localhost` 可能是 `::1`，不要把这个地址写死成所有机器的结果。`dns.resolve4` 走 c-ares，不占这个线程池。不要在示例里写死公共域名的 A 记录。

不要声称 22.23.4 默认使用 io_uring。那要看这次构建和平台，本教程没有把文件读取观察成绕过线程池。

## 本章问答

### 1. 为什么文件读取会被 pbkdf2 拖住？

**考点：** 共享线程池。

**回答：** 在这枚 22.23.4 上，两者都向默认池提交工作。池里只有 1 条线程时，读取排在哈希后面。池有空位时，读取不必等那一次哈希。这是实测关系，不是对所有未来版本的承诺。

### 2. lookup 和 resolve 有什么差别？

**考点：** 系统解析和 DNS 协议。

**回答：** `dns.lookup` 使用系统解析器，会看 hosts，并占用线程池。`dns.resolve4` 走 c-ares，直接做 DNS 查询，不占这个池。`localhost` 的结果取决于这台机器的 hosts。

### 3. 线程池大小能在运行中改吗？

**考点：** 启动时读取。

**回答：** 不能靠给 `process.env` 赋值影响已经在跑的池。示例用 `spawnSync` 给子进程一份新环境。合法范围要看 libuv，不要设成 0。

## 事故复盘

登录接口里同步风格地大量 `pbkdf2`，同时用户上传走 `readFile`。池大小为默认 4 时，上传延迟跟着口令哈希走。示例在池为 1 和 4 时比较了这个关系。把哈希并发和文件并发分开预算，而不是只加机器。

用 `dns.lookup` 解析大量不重复的主机名，线程池被 `getaddrinfo` 占满，文件读取变慢。能用 `dns.resolve` 的批量查询不要走 `lookup`。不要把 `localhost` 的解析结果写死进测试，除非测试自己写 hosts。
