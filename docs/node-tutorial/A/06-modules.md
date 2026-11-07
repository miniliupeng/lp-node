# A06 模块

对应示例：[`A/06-modules.mjs`](../../../examples/node-tutorial/A/06-modules.mjs)、[`A/06-local.mjs`](../../../examples/node-tutorial/A/06-local.mjs)、[`A/06-math.cjs`](../../../examples/node-tutorial/A/06-math.cjs)。循环依赖在 [C12](../C/12-module-graph.md)。

## 两种模块

| | ESM | CJS |
| --- | --- | --- |
| 扩展名 | `.mjs`，或 `"type": "module"` 下的 `.js` | `.cjs`，或没有 `"type": "module"` 时的 `.js` |
| 导出 | `export` | `module.exports` |
| 导入 | `import`，静态导入会提升 | `require()`，执行到那一行才加载 |
| 顶层 `await` | 可以 | 语法错误 |
| `__dirname` | 没有这个绑定 | 有 |
| 本版本直接执行 `.ts` | 类型剥离后按模块规则运行 | 同左，看文件如何被分类 |

本仓库根 `package.json` 含 `"type": "module"`，所以仓库里的 `.js` 是 ESM。教程示例用扩展名把种类写死。

## ESM 里取路径

`import.meta.url` 是 `file://` URL。22.23.4 提供 `import.meta.dirname` 和 `import.meta.filename`。示例断言 `pathToFileURL(import.meta.filename).href === import.meta.url`。

更老的写法是 `fileURLToPath(import.meta.url)` 再 `path.dirname`。新代码在 Node 22 上可以直接用 `import.meta.dirname`。

## 在 ESM 里加载 CJS

```javascript
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const math = require('./06-math.cjs');
```

`createRequire` 的参数用来决定相对路径从哪解析。示例里的 CJS 导出 `{ add }`，`math.add(3, 4)` 为 7。

## 在 CJS 里加载 ESM

22.23.4 上 `process.features.require_module === true`。示例用 `require('./06-local.mjs')` 得到命名空间，`requiredEsm.mul(2, 6)` 为 12。

这是同步加载：被加载的 ESM 不能依赖顶层 `await` 去等待异步工作，否则 `require` 会失败。有顶层 `await` 的模块继续用动态 `import()`。

动态 `import()` 返回 Promise，在 ESM 和 CJS 里都能用。示例 `await import('./06-local.mjs')` 得到同一个 `mul`。

## 缓存

同一个模块 URL（ESM）或同一个解析后的文件名（CJS）在一个进程里只评价一次。再导入得到的是同一份导出绑定。测试里要替换依赖时，不要假设删掉 `require.cache` 对 ESM 同样有效。ESM 没有对等的公开缓存表。

## 导出是绑定

ESM 的 `export const name = ...` 是活绑定。导入方读到的是当前值。CJS 的 `module.exports.foo = 1` 导出的是当时对象上的属性，调用方拿到对象引用后，后续改属性也能看见，因为改的是同一个对象。

循环依赖时这两者差别很大，见 C12 的可运行例子。那里 ESM 在初始化期间读取尚未初始化的绑定会得到 `ReferenceError`，CJS 会看到一份还没写完的 `exports`。

## 内置模块

使用 `node:` 前缀：`node:fs`、`node:path`、`node:http`。前缀明确表示内置模块，不会被同名的 npm 包挡住。`process.getBuiltinModule('fs')` 在本版本可用。

## 自测

1. 为什么 ESM 里没有 `__dirname`？ESM 的模块标识是 URL，路径用 `import.meta.filename` / `dirname` 取。
2. `require()` 一个含顶层 `await` 的 ESM 会怎样？同步 `require` 无法等待它，加载失败。改用 `import()`。
3. 同一文件被导入两次，顶层代码跑几次？一次。
