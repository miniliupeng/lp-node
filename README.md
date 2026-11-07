# Node.js 教程（2026）

从零基础到能独立做服务，再到能讲清运行时和系统设计。正文是中文。示例只使用 Node 自带模块。

这是一条**独立分支**上的教程，不包含其他专题目录。它用来预览，**不要合并进 `main`**。

## 版本

示例在 **Node.js 22.23.4** 上编写并跑通（V8 `12.4.254.21-node.57`，libuv `1.51.0`，OpenSSL `3.5.9`）。需要 Node 22.23 或行为兼容的后续 22 补丁。

2026-11-07 的发布线：22（Jod）与 24（Krypton）处于 Maintenance，26（Lithium）是 Active LTS。本教程没有在 26 上重跑。换版本后请重新执行下面的命令。

细节见 [docs/node-tutorial/00-版本.md](docs/node-tutorial/00-版本.md)。

章节目录和 Markdown 文件名是中文，对应 A 入门到 E 面试题库。每一章都写了机制、会出事的写法和问答。示例脚本仍用英文文件名。

## 阅读顺序

```text
01-入门            A
02-进阶            B
03-运行时          C
04-工程与系统设计  D
05-面试题库        E
```

目录：[docs/node-tutorial/README.md](docs/node-tutorial/README.md)

## 运行

```bash
node examples/run-all.mjs
node --test examples/B/11-sample.test.mjs
```

成功的脚本打印 `PASS`。`node:sqlite` 在 22.23 仍会向 stderr 打实验性警告，退出码为 0 即通过。
