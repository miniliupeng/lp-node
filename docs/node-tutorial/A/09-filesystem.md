# A09 文件系统入门

对应示例：[`examples/node-tutorial/A/09-fs.mjs`](../../../examples/node-tutorial/A/09-fs.mjs)

## 用 promises API

新代码用 `node:fs/promises`，配合 `async/await`。回调风格的 `fs.readFile` 仍然存在，运行时章节里用它观察事件循环。

```javascript
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = await mkdtemp(join(tmpdir(), 'lp-node-fs-'));
const file = join(dir, 'note.txt');
await writeFile(file, 'hello\n', 'utf8');
const text = await readFile(file, 'utf8');
await rm(dir, { recursive: true, force: true });
```

`writeFile` 的字符串默认按 UTF-8 编码。读的时候不传 `'utf8'` 会得到 `Buffer`。两边要一致，否则你会把缓冲区对象写进字符串拼接里。

`mkdtemp` 要求前缀以分隔符结尾的目录加上前缀；`join(tmpdir(), 'lp-node-fs-')` 会生成唯一目录。`rm(..., { recursive: true, force: true })` 用来清理。示例放在 `try/finally` 里，断言失败也会删目录。

## 错误码

文件不存在时，`readFile` 拒绝的错误 `code` 为 `ENOENT`。权限不足常见 `EACCES`。调用方根据 `code` 分支，而不是根据 `message`。

## 中止一次读取

`readFile` 接受 `{ signal }`。示例在调用前就 `abort()`，拒绝的错误是 `name: 'AbortError'`、`code: 'ABORT_ERR'`。

已经发出去的读取会在信号中止时停止等待。请求被客户端取消时，把同一个 `AbortSignal` 传给文件和网络操作，避免工作还在后台跑完。

## 同步 API 的位置

`readFileSync` 会挡住主线程，直到读取结束。进程启动时读一份小配置，这种用法说得通。在 HTTP 请求路径上读大文件，同步 API 会让同一进程里的其他请求都等着。请求路径用 promises API。

大文件不要一次性 `readFile` 进内存。用流，见 [B02](../B/02-streams.md)。

## 自测

1. 为什么示例把临时目录放在 `os.tmpdir()`？避免污染仓库，也避免测试并行时互相覆盖固定文件名。
2. 省略 `'utf8'` 时 `readFile` 返回什么？`Buffer`。
3. 怎样取消一次读取？传入 `AbortSignal`，中止后得到 `ABORT_ERR`。
