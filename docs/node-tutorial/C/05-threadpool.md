# C05 libuv 线程池与 DNS

对应示例：[`examples/node-tutorial/C/05-threadpool.mjs`](../../../examples/node-tutorial/C/05-threadpool.mjs)

## 默认 4

不设置 `UV_THREADPOOL_SIZE` 时，池子大小是 4。这个变量要在进程启动时就存在，运行中再改环境变量不会把已经创建的池子变大。

会使用线程池的典型异步 API：

- 文件系统：`fs.readFile`、`fs.writeFile` 等
- `dns.lookup`（系统的 `getaddrinfo`）
- `crypto.pbkdf2`、`crypto.scrypt`、异步 `randomBytes`
- 异步的 zlib 压缩

纯 JavaScript、以及 `dns.resolve` / `dns.resolve4`（c-ares，走网络 DNS 查询）不占用这条池子。

libuv 还有 io_uring 后端，Node 在不同小版本里对它的默认开关不一样。下面的实验说明：**这枚 22.23.4 上，异步 `readFile` 会等线程池**。不要根据旧博客写成“22 的 fs 已经不走线程池”。

## 实验

示例启动两个子进程，都只跑一个较重的 `pbkdf2`，并在 5ms 后 `readFile` 自己。

- `UV_THREADPOOL_SIZE=1`：唯一的线程在做 `pbkdf2`，`readFile` 要等它结束。本机大约几十毫秒。
- `UV_THREADPOOL_SIZE=4`：还有空闲线程，`readFile` 很快返回。本机大约 1ms。

断言是 `blocked > free + 15` 且 `free < 40`。绝对毫秒数会变，关系不应变。如果将来某次运行在空池时也很慢，先看机器是不是整体卡住，再看 Node 版本是不是换了 fs 后端。

## DNS 的两个入口

`dns.lookup('localhost')` 使用系统解析，会读 `/etc/hosts`，并占用线程池。本机一次调用得到 `::1`，地址族 6（IPv6）。

`dns.resolve4('example.com')` 使用 c-ares 向 DNS 服务器查询，不走同一条 hosts 逻辑，也不把工作丢进上面的线程池。它返回的地址随网络变化，教程不把具体 IP 写进断言。

服务器里对同一个主机名反复 `dns.lookup`，会占满线程池，连文件读取一起变慢。可以缓存解析结果，或在明确要 DNS 协议时使用 `dns.resolve*`。`lookup` 和 `resolve` 的结果可能不同，因为 hosts 文件和 DNS 服务器本来就可以不同。

## 自测

1. 为什么异步 `pbkdf2` 仍会拖慢 `readFile`？它们共享 libuv 线程池。
2. 怎样把池子改成 8？启动前设置 `UV_THREADPOOL_SIZE=8`。
3. `dns.lookup` 和 `dns.resolve4` 的差别？前者是系统解析加线程池，后者是 DNS 查询。
