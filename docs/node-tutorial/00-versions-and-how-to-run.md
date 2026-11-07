# 版本、事实边界、怎么运行

本文日期按仓库任务当天：**2026-11-07**。发布日期来自 Node.js Release 工作组的公开时间表，该表注明日期可能调整。API 行为来自本仓库这台环境上的 Node **v22.23.4**，不是对 Node 26 的推测。

## 1. 2026-11-07 的版本线

| 版本线 | 代号 | 状态 | 首次发布 | Active LTS | Maintenance | 结束支持 |
| --- | --- | --- | --- | --- | --- | --- |
| 22.x | Jod | Maintenance LTS | 2024-04-24 | 2024-10-29 | 2025-10-21 | 2027-04-30 |
| 24.x | Krypton | Maintenance LTS | 2025-05-06 | 2025-10-28 | 2026-10-20 | 2028-04-30 |
| 26.x | Lithium | Active LTS | 2026-05-05 | 2026-10-28 | 2027-10-20 | 2029-04-30 |
| 27.x | （新节奏的第一条） | Alpha | Current 计划 2027-04-22 | LTS 计划 2027-10-20 | 新节奏不再单列 Maintenance | 计划 2030-04-30 |

22、24、26 仍走旧节奏：偶数版本进入 LTS，奇数版本（如已经结束的 25）不进入 LTS。从 27 开始，公开说明改为每年四月一条主版本，每条都会进入 LTS，并在 Current 之前增加 Alpha。

Node 20 的支持在 2026-04-30 结束。

本仓库 `package.json` 的 `engines.node` 是 `>=22.0.0`。教程示例的契约更窄：**在 22.23.4 上跑通**。`process.release.lts` 在这台机器上是 `"Jod"`。

新系统在 2026 年 11 月更常选 26 Active LTS。那是部署建议，不是本教程已经验证过的运行时。

## 2. 这台 22.23.4 上确认过的事实

运行 `node examples/node-tutorial/A/01-hello.mjs` 会打印：

- `node`: v22.23.4
- `v8`: 12.4.254.21-node.57
- `uv`: 1.51.0
- `openssl`: 3.5.9

同时这枚二进制里还有 undici 6.29.1、sqlite 3.53.4（`node:sqlite` 仍打印 ExperimentalWarning）。

| 项目 | 在 22.23.4 上的结果 |
| --- | --- |
| `process.features.typescript` | `"strip"`。直接 `node file.ts` 会剥掉可擦除类型 |
| `enum` | 默认剥离模式抛 `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`。`--experimental-transform-types` 能跑，并打印实验警告 |
| `process.features.require_module` | `true`。`require()` 可以加载 ESM，得到模块命名空间 |
| `import.meta.dirname` / `filename` | 可用 |
| `fetch`、`WebSocket` 客户端、`crypto.subtle` | 全局存在 |
| `EventSource`、`URLPattern`、`localStorage` | `typeof` 为 `"undefined"` |
| `using` 语法 | `SyntaxError` |
| `Object.groupBy`、`Map.groupBy`、`Promise.withResolvers`、`Array.fromAsync` | 函数存在。示例里跑了 `Object.groupBy` 与 `Promise.withResolvers` |
| 迭代器助手 `map` / `filter` / `take` / `toArray` | 可用，见 `C/07-pipeline.mjs` |
| `Set.prototype.intersection` | 可用 |
| `[].toSorted`、`[].toSpliced`、`[].at` | 函数存在 |
| 私有字段 `#x` | 可用 |
| `node:sqlite` | 能用 `DatabaseSync`，行对象的原型是 `null`，模块仍是实验性的 |
| 未处理的 Promise 拒绝 | 默认使进程以非 0 退出。注册 `unhandledRejection` 监听器后，这次拒绝不再触发该默认退出 |
| `setTimeout(fn, 0)` | 定时器文档规定小于 1 的延迟改成 1。内部字段 `_idleTimeout` 在本机观察到 1。不要把这个字段写进业务代码 |
| 主模块里 `setTimeout(0)` 与 `setImmediate` | 顺序不稳定。本机 20 次里 18 次 immediate 在前，2 次 timeout 在前 |
| I/O 回调里的顺序 | `nextTick` → 微任务 → `setImmediate` → `setTimeout`，见 `C/03-io-order.mjs` |
| 异步 `fs.readFile` 与线程池 | 把线程池用 `pbkdf2` 占满后，`readFile` 会等待。见 `C/05-threadpool.mjs` |
| `process.loadEnvFile` | 不覆盖已经存在的环境变量。未加引号的 `#` 开始注释 |
| 权限模型 | 不加 `--permission` 时 `process.permission` 是 `undefined`。加上之后，越权读文件得到 `ERR_ACCESS_DENIED` |
| `Buffer.poolSize` | 8192 |
| `URLPattern` | 不存在 |

## 3. 运行

需要 Node 22.23 或与之行为兼容的 22 后续补丁。不需要 `pnpm install` 就能运行教程示例。

```bash
node examples/node-tutorial/run-all.mjs
node --test examples/node-tutorial/B/11-sample.test.mjs
```

单个脚本成功时打印 `PASS ...`，失败时断言抛错，进程退出码非 0。

仓库自己的检查（需要先安装开发依赖）：

```bash
pnpm install
pnpm exec biome check examples/node-tutorial
pnpm exec tsc --noEmit
```

`examples/node-tutorial/C/strip-sample.ts` 和 `enum-sample.ts` 会被根目录 `tsconfig.json` 的 `**/*.ts` 扫到。它们是合法的 TypeScript，用来演示运行时剥离和 `enum` 的差别。

## 4. 文档承诺到哪为止

- 写进正文的顺序、错误码、警告，都有示例或本页表格里的一次实测。
- 耗时数字（例如线程池示例里的几十毫秒）会随机器变化。脚本只断言“被堵住的文件读取明显慢于有空闲线程的那次”。
- DNS 的具体 IP、证书链、生产网关行为不写死。
- Node 26 的新 API 没有在本环境执行，正文不把它们写成已验证功能。
