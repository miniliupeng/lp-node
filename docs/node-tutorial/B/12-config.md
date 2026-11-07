# B12 配置与环境变量

对应示例：[`examples/node-tutorial/B/12-env.mjs`](../../../examples/node-tutorial/B/12-env.mjs)

## 环境变量都是字符串

`process.env.PORT` 要么是字符串，要么是 `undefined`。数字要 `Number` 之后再检查 `Number.isInteger`。布尔值约定 `'1'` / `'true'` 时要写明，不要把非空字符串都当成 true——那会让 `'false'` 变成真。

缺失的配置在启动时失败。请求处理到一半才发现没有数据库地址，进程会带着半初始化的状态继续跑。

## loadEnvFile

Node 22 有 `process.loadEnvFile(path)`。示例写一个临时文件：

```text
APP_PORT=4321
APP_NAME="demo app"
HASH=a#b
QUOTED="a#b"
```

读到的结果：

- `APP_PORT` 是 `4321`（字符串）
- `APP_NAME` 是 `demo app`，引号被去掉
- `HASH` 是 `a`，未加引号的 `#` 开始注释
- `QUOTED` 是 `a#b`

在本机另一次检查里，如果 `process.env.APP_PORT` 已经是 `1111`，`loadEnvFile` **不会覆盖**它，只会填上原来没有的键。示例因此在结束后恢复调用前的值，避免把测试进程的环境弄脏。

这和“文件里写的应该赢”不是同一条规则。十二要素应用里，真正的环境（部署系统注入的）应当优先于开发用的 dotenv 文件。`loadEnvFile` 的不覆盖行为符合这个方向。需要覆盖时你要自己明确赋值，并写在文档里。

## 不要把秘密写进仓库

`.env` 放本地，加入 `.gitignore`。本仓库已经忽略 `.env`。示例把文件写到 `os.tmpdir()`，读完就删。

生产秘密来自部署系统或秘密管理服务，通过环境变量注入。日志里不要打印 `process.env`。

## 校验

读完之后立刻检查类型和范围。端口不在 1 到 65535 就退出。本教程的 [D06 校验示例](../../../examples/node-tutorial/D/06-validation.mjs) 是手写的。仓库另一条实验线使用 Zod，适合应用代码；教程示例保持零依赖。

## 自测

1. `HASH=a#b` 为什么变成 `a`？`#` 在未加引号时是注释。
2. 已存在的环境变量会被文件覆盖吗？在 22.23.4 的 `loadEnvFile` 上不会。
3. 为什么启动时就要检查配置？避免带着缺失配置进入服务循环。
