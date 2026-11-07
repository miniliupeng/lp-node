# C01 进程里有什么

这一章没有单独的脚本。版本号来自 [`A/01-hello.mjs`](../../../examples/node-tutorial/A/01-hello.mjs)，线程池行为来自 [`C/05-threadpool.mjs`](../../../examples/node-tutorial/C/05-threadpool.mjs)。

## 三层

一个 Node 进程启动后：

1. **V8** 创建 isolate，编译并执行 JavaScript，管理 JS 堆。22.23.4 的 V8 是 `12.4.254.21-node.57`。
2. **libuv** 提供事件循环和线程池。这枚构建的 libuv 是 `1.51.0`。
3. **Node 绑定** 实现 `node:fs`、`node:http`、`node:crypto` 等，并负责模块加载。HTTP 客户端 `fetch` 走内置的 undici 6.29.1。

JavaScript 在这个 isolate 的主线程上跑。同一时刻只有一段 JavaScript 在主线程执行。`await` 让出的是调用栈，不是操作系统线程。

## 还有哪些线程

- libuv 线程池。默认 4 个工作线程，可用环境变量 `UV_THREADPOOL_SIZE` 在进程启动时调整。异步的 `fs`、`dns.lookup`、`pbkdf2`、`scrypt`、`crypto.randomBytes` 的异步形式、以及 zlib 的异步压缩，会把阻塞工作交到这个池子。C05 的实验说明：池子被 `pbkdf2` 占满时，`readFile` 会等。
- V8 的垃圾回收可以使用后台线程。这不表示你的 JavaScript 会并行跑在那些线程上。
- `worker_threads` 是另外的 isolate，各自有自己的堆。见 C09。
- 原生插件可以再开线程。那是插件的合同，不是 JavaScript 的合同。

## 事件循环不是“一个队列”

libuv 按阶段从操作系统取事件，再执行对应的 JavaScript 回调。阶段的顺序、以及 `nextTick` 和微任务这两条额外队列，在 C02 和 C03 用断言写死。

## 启动时还做什么

模块加载器解析 ESM 或 CJS，执行顶层代码。顶层如果 `listen()`，句柄会留在事件循环里，进程因此保持运行。顶层如果只是算完一个数，进程就退出。

类型剥离发生在加载 `.ts` 时，见 C14。它不运行 TypeScript 类型检查器。

## 自测

1. 主线程正在跑一个百万次的纯 JavaScript 循环时，同一个进程里的 HTTP 回调什么时候能跑？这段循环结束之后。
2. `await fetch()` 期间主线程空出来了吗？这个函数在等待网络，主线程可以去执行别的已就绪回调。
3. 默认线程池多大？4。由 `UV_THREADPOOL_SIZE` 在启动时决定。
