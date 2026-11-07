# B09 子进程

对应示例：[`examples/node-tutorial/B/09-child-process.mjs`](../../../examples/node-tutorial/B/09-child-process.mjs)

## 三个入口

| API | 用途 |
| --- | --- |
| `spawn` | 启动进程，标准流是流。适合长时间输出 |
| `execFile` | 不经过 shell，收集输出。有 `maxBuffer`，超出则失败 |
| `exec` | 经过 shell。用户输入进到命令字符串里就会变成命令注入 |
| `fork` | 启动另一个 Node 进程，并带一个 IPC 通道。适合跑 Node 脚本 |

示例用 `spawn(process.execPath, ['-e', '...', literal])`。参数数组的每一项是一个 argv，shell 不会解释其中的分号。

传入的字符串是 `hello; touch /tmp/lp-node-should-not-exist`。子进程把它打印出来。父进程断言输出就是这串字符，并且 `/tmp/lp-node-should-not-exist` 没有被创建。分号没有变成“再执行一条命令”。

## shell: true 的位置

`spawn(cmd, { shell: true })` 或 `exec` 会把字符串交给 shell。用户输入里的 `;`、`|`、`$()` 会按 shell 语法生效。需要固定命令时，使用参数数组，并且不开启 shell。

必须经过 shell 时（例如要展开通配符），命令模板保持常量，用户数据只走环境变量或标准输入，并做白名单。

## 收输出

示例监听 `stdout` 和 `stderr`，在 `exit` 时一并返回。不读子进程的输出流，子进程可能因为管道缓冲写满而停住。`execFile` 的 `maxBuffer` 就是这个缓冲的上限；超过会杀掉子进程。长时间输出用 `spawn` 边读边处理。

`exit` 的 `code` 为 `null` 时，进程是被信号结束的，看 `signal`。

## 自测

1. 为什么示例用 `process.execPath` 而不是字符串 `'node'`？保证用的是当前这个二进制。
2. 参数数组如何避免分号被执行？没有 shell 时，分号只是参数里的字符。
3. 不读 `stdout` 会怎样？管道写满后子进程可能阻塞。
