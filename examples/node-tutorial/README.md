# 可运行示例

这些脚本是教程正文的可执行对照。正文在 `docs/node-tutorial/`。

假设：

- Node.js 22.23.x，本仓库机器实测 **22.23.4**
- 不安装额外 npm 依赖
- 示例只访问本机回环地址和临时目录

```bash
node examples/node-tutorial/A/01-hello.mjs
node examples/node-tutorial/run-all.mjs
node --test examples/node-tutorial/B/11-sample.test.mjs
```

`run-all.mjs` 会逐个启动脚本，15 秒无退出则判失败。`node:sqlite` 在 22.23 仍会向 stderr 打实验性警告，退出码为 0 即通过。
