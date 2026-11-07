# A08 进程、路径、操作系统

对应示例：[`examples/node-tutorial/A/08-path-process.mjs`](../../../examples/node-tutorial/A/08-path-process.mjs)

## process 上每天会用的字段

| 字段 | 含义 |
| --- | --- |
| `process.pid` | 当前进程号 |
| `process.cwd()` | 进程的当前工作目录，取决于你在哪个目录启动 `node` |
| `process.argv` / `process.execPath` | 见 A01 |
| `process.env` | 环境变量，值都是字符串。没有的键是 `undefined` |
| `process.exitCode = 1` | 建议的失败方式：设置退出码，让事件循环把剩余工作做完再退出 |
| `process.exit(1)` | 立刻退出。还在排队的回调不会再跑，适合在已经决定放弃进程的时候 |

工作目录和模块文件所在目录不是一回事。读相对路径 `fs.readFile('data.json')` 时，相对的是 `cwd`，不是源文件旁边。库代码里要表达“模块旁边的文件”，用 `import.meta.dirname` 再 `path.join`。

## path

`node:path` 按当前操作系统的规则拼接路径。在 Linux 上分隔符是 `/`。

- `path.basename('/tmp/demo/app.mjs')` → `app.mjs`
- `path.extname('app.test.mjs')` → `.mjs`（最后一个点之后）
- `path.join('/var', 'app', 'a', '..', 'b')` 会规范化为 `/var/app/b`
- `path.resolve('/var/app', 'file.txt')` → `/var/app/file.txt`
- 第二个参数是绝对路径时，`path.resolve` 会丢掉前面的片段。`path.resolve('/var/app', '/etc/passwd')` 是 `/etc/passwd`

最后这一条就是路径穿越的入口。用户输入 `../` 或绝对路径时，不能直接拼到上传目录后面。

示例里的 `insideRoot`：

1. `path.resolve(root, userPath)` 得到绝对路径
2. `path.relative(root, resolved)` 看结果还在不在 root 下面
3. 相对路径以 `..` 开头，或变成绝对路径，就抛错

断言覆盖了 `a/b.txt`、`../etc/passwd` 和 `/etc/passwd`。这是 POSIX 路径上的检查。Windows 设备路径、NTFS 备用数据流需要额外规则，本教程的示例在 Linux 上运行。

生产代码还要决定符号链接算不算逃逸：攻击者可能在允许的目录里放一个指向外部的链接。需要时对打开操作使用 `O_NOFOLLOW`，或在打开后用 `fs.realpath` 再检查一次。示例把逻辑留在字符串检查这一层，方便读懂。

## os

`os.platform()`、`os.arch()`、`os.tmpdir()`、`os.cpus().length`。临时文件放在 `os.tmpdir()`，用 `fs.mkdtemp` 创建独占目录，用完删除。不要把临时文件写到仓库目录里。

CPU 数量是调度 Worker 或 cluster 时的参考，不是“把线程数设成这个就最快”的答案。

## 自测

1. `fs.readFile('a.txt')` 相对谁？相对 `process.cwd()`。
2. 为什么 `path.join(root, userInput)` 不安全？用户可以传入 `..` 段，join 会按路径语义向上走。
3. `process.exit` 和设置 `process.exitCode` 的差别？前者立即结束进程。
