# A01 Node.js 是什么

对应示例：[`examples/node-tutorial/A/01-hello.mjs`](../../../examples/node-tutorial/A/01-hello.mjs)

## 它在机器上扮演的角色

JavaScript 语言规范描述语法和内置对象。浏览器另外提供 DOM、`document`、页面存储。Node.js 提供另一组宿主能力：读文件、听端口、起子进程、做密码学运算、管理自己的进程。

同一次 `node` 进程里大致有三块：

1. **V8**：执行 JavaScript，管理 JS 堆，做垃圾回收。
2. **libuv**：事件循环、线程池、TCP/UDP、文件操作的跨平台层。
3. **Node 自己的绑定**：把 `fs`、`http`、`crypto` 这些模块接到上面两层，并加上模块加载器。

所以“Node 是单线程”只说对了 JavaScript 执行这一句：同一时刻，一个 V8 isolate 的主线程只跑一段 JavaScript。文件和部分加密会把阻塞工作交给 libuv 线程池。这部分在 [C05](../C/05-threadpool.md) 用实验说明。

## 安装后先看版本

```bash
node -v
node -p "process.versions"
node -p "process.release.lts"
```

教程假设主版本至少 22。示例在 22.23.4 上运行，`process.release.lts` 为 `Jod`。版本线的支持窗口见 [版本说明](../00-versions-and-how-to-run.md)。

同时装一个和 Node 主版本匹配的阅读方式即可。本教程的示例不依赖 npm 包，用系统里的 `node` 直接跑。

## REPL

不带文件参数时，`node` 进入交互提示符：

```text
Welcome to Node.js v22.23.4.
>
```

适合确认一个表达式。例如 `1 + 2`、`typeof null`、`Buffer.from('ab')`。退出用 Ctrl+D，或输入 `.exit`。

REPL 里的 `this`、未声明赋值和模块语义都和正式文件不同。能跑的程序写成文件，用 `node 文件名` 执行。

## 第一个程序

`A/01-hello.mjs` 读取进程自己的版本信息并断言主版本不小于 22。`.mjs` 表示这个文件一定按 ECMAScript 模块执行，不受周围 `package.json` 里 `"type"` 的影响。本仓库根目录的 `package.json` 已经是 `"type": "module"`，因此 `.js` 也会被当成 ESM；教程仍使用 `.mjs` / `.cjs`，把模块种类写在扩展名上。

```bash
node examples/node-tutorial/A/01-hello.mjs
```

成功时 stdout 有一行 JSON，然后是 `PASS A/01-hello`。

## 命令行参数

`process.argv` 是字符串数组。`argv[0]` 是 `node` 可执行文件，`argv[1]` 是脚本路径，从 `argv[2]` 起才是你传的参数。所有参数都是字符串，`"42"` 不会自动变成数字。

`process.execPath` 是当前这个 `node` 二进制的路径。教程里启动子进程时用它，避免 PATH 上另有一个旧的 `node`。

## 进程怎么结束

主模块执行完，并且事件循环里没有还在等待的句柄（服务器、未 `unref` 的定时器、打开的套接字）时，进程以码 0 退出。未捕获异常或以默认行为发生的未处理拒绝会使退出码非 0。退出码的细节在 [C13](../C/13-failure.md)。

## 自测

1. 说出 V8 和 libuv 各自负责的一件事。
2. `node -v` 和 `process.version` 是什么关系？后者多一个 `v` 前缀，内容来自同一次构建。
3. 为什么教程用 `.mjs`？因为扩展名固定为 ESM，不依赖目录里的 `package.json`。
