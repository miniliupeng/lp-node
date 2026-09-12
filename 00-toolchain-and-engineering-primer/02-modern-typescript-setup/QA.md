# 大厂高频面试题精讲 (02-modern-typescript-setup)

---

### Q1: 在 NodeNext / ESM 模块规范下，为什么相对路径导入必须写文件扩展名（如 `.ts` 或 `.js`），而不能像以前那样省略？

#### 🎯 面试官考点
- 考察对浏览器与 Node.js 官方标准 ESM 规范的理解，以及旧打包工具“黑魔法”与标准的差异。

#### 💡 满分回答模板
1. **对齐浏览器与 URL 标准**：
   - 官方 ECMAScript 模块规范要求导入标识符（Specifier）必须是一个确定的 URL 或绝对/相对路径。在浏览器环境中，网络请求不会像操作系统文件查找一样自动去尝试 `.js`、`.ts`、`.json` 或 `/index.js`，这种猜测会导致巨大的网络往返开销。
2. **避免歧义与隐式性能损耗**：
   - 如果省略扩展名，运行时在解析 `import "./foo"` 时，需要连续调用操作系统的 `stat` 系统调用去按序尝试 `foo.js`、`foo.json`、`foo/index.js` 等，带来巨大的文件系统 I/O 开销。
3. **现代 TypeScript 5.0+ 演进**：
   - 过去必须写转译后的 `.js`（即使源文件是 `.ts`），经常反直觉。现在配置 `"allowImportingTsExtensions": true` 与 `"noEmit": true` 后，可以直接显式书写 `import "./calc.ts"`，完全符合直觉并兼容 NodeNext 标准。

---

### Q2: 既然现代 Node.js (如 Node 22.6+ 的 `--experimental-strip-types`) 可以直接执行 TypeScript 文件了，为什么我们在企业级项目中仍然需要配置 `tsc`？

#### 🎯 面试官考点
- 澄清“代码执行（Execution）”与“类型检查（Type Checking）”的核心边界。

#### 💡 满分回答模板
1. **Node.js 原生执行 TS 的本质是“类型擦除（Type Stripping）”**：
   - Node.js 底层的 V8 引擎永远只认 JavaScript 语法。Node 22+ 的原生 TS 支持只是在内存中通过极简词法分析**直接剔除类型注解**，然后把纯 JS 丢给 V8 执行，**它根本不做任何静态类型合规性校验**！
2. **潜在风险**：
   - 如果一段 TS 代码写着 `const num: number = "hello world";`，Node 原生运行**不会抛出任何错误**，它只是把 `: number` 抹掉了。
3. **企业级双轨制实践**：
   - **执行层**：追求极致速度，使用 `tsx` 或 Node 原生类型剥离，极速冷启动；
   - **质检层**：在 IDE 编码阶段或 Git Commit / CI 流水线中，必须运行 `tsc --noEmit`。一旦发现类型不兼容立即阻断，确保“类型安全”这一 TS 核心价值生效。

---

### Q3: 为什么现代工程大多放弃 `ts-node` 而转向 `tsx` (基于 esbuild)？二者底层原理有何不同？

#### 🎯 面试官考点
- 构建工具链演进、JIT 转译开销与开发体验优化。

#### 💡 满分回答模板
1. **底层转译引擎的代际差**：
   - `ts-node` 默认调用官方 `tsc` 编译器（纯 JavaScript 编写，单线程 AST 全量遍历分析），在大型项目中冷启动与单次运行常耗时数秒甚至数十秒，CPU 占用极高。
   - `tsx` 基于 Go 语言编写的高性能编译器 **esbuild**，利用 Go 原生多线程与精炼的词法转换，转译速度比官方 tsc 快 10~100 倍，完全是毫秒级响应。
2. **ESM 兼容性体验**：
   - `ts-node` 在处理现代 Node.js Pure ESM 时需要配置复杂的 Loader 钩子 (`--loader ts-node/esm`)，极易出现模块找不到或扩展名解析冲突；而 `tsx` 开箱即用支持完整的 NodeNext ESM 解析与 Top-Level Await。
