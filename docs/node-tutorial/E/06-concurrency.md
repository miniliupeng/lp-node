# E06 进程、线程、cluster

### Q1. 子进程怎样避免命令注入？

- 难度：初级
- 考察点：shell
- 参考答案：`spawn(file, args)` 把每一项当 argv，不经过 shell。示例传入 `hello; touch /tmp/...`，输出就是这串字符，文件没有被创建。`exec` 和 `shell: true` 会把分号交给 shell。必须用 shell 时，命令保持常量，用户数据走标准输入或白名单。
- 易错点：先过滤几个字符再拼进 `exec`。过滤名单总会漏。
- 追问：不读子进程 stdout 会怎样？管道写满后子进程阻塞。

### Q2. Worker 和子进程的差别？

- 难度：中级
- 考察点：隔离与通信
- 参考答案：`worker_threads` 是同一进程里的另一个 isolate，有自己的堆和事件循环，用消息通信，可以用 `SharedArrayBuffer`。`child_process` 是另一个操作系统进程，崩溃隔离更强，通信靠管道或 IPC。两者都不共享普通 JavaScript 变量。示例 Worker 计算 1 到 10 的和 55，并把共享缓冲写成 42。
- 易错点：说 Worker 能读主线程的 `let`。
- 追问：什么时候用 Worker？主线程上的 CPU 工作已经长到影响事件循环延迟。不要为每个请求创建一个 Worker。

### Q3. cluster 共享内存吗？

- 难度：中级
- 考察点：多进程
- 参考答案：不共享。主进程协调监听句柄，把连接分给 Worker。非 Windows 默认轮询。长连接在建立时分一次，之后不会按消息重新分。示例 fork 一个 Worker，用 IPC 拿端口，请求正文是 `pid:` 加进程号，再 `SIGTERM` 让它 `close`。内存会话和内存限流在多 Worker 下各算各的。
- 易错点：说 cluster 是多线程。
- 追问：和容器副本怎么选？选一个负责拉起进程。编排器扩容时，一个容器一个进程更清晰。两者一起重启会造成混乱。

### Q4. `fork` 和 `spawn` 的差别？

- 难度：初级
- 考察点：IPC
- 参考答案：`fork` 启动 Node 脚本并建立 IPC，可以 `process.send`。`spawn` 启动任意程序，默认没有这条 Node 消息通道。跑系统命令用 `spawn` 或 `execFile`。
- 易错点：用 `fork` 去跑 `ls`。
- 追问：`execFile` 的 `maxBuffer`？收集输出的上限，超过则失败并杀掉子进程。长输出用 `spawn` 流式读。

### Q5. 主线程、线程池、Worker 各执行什么？

- 难度：高级
- 考察点：三套并发
- 参考答案：主线程执行 JavaScript 和事件循环回调。libuv 线程池执行会阻塞的 fs、`dns.lookup`、慢哈希、异步压缩，默认 4。Worker 执行你放进去的 JavaScript。加 Worker 不会加快正在等数据库的请求。线程池被慢哈希占满时，`readFile` 会排队，见 C05。
- 易错点：把三套都说成“Node 是多线程所以请求并行”。
- 追问：`dns.resolve4` 走线程池吗？不走。它用 c-ares 做 DNS 查询。`dns.lookup` 才走系统解析和线程池。
