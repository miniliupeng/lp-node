# 02-modern-typescript-setup: 现代 NodeNext 模块规范与轻量运行方案

过去开发 Node.js + TypeScript 往往需要配置繁重的 Babel/Webpack 打包流程，或者忍受 `ts-node` 缓慢的冷启动与复杂的 ESM 报错。在现代工程中，我们推荐 **`NodeNext` 模块规范 + `tsx` (基于 esbuild) 零构建方案**。

---

## 💡 核心原理三段式

### 1. 是什么？
- **NodeNext (`moduleResolution: "nodenext"`)**：TypeScript 官方完全对齐现代 Node.js 原生 ESM 模块解析规则的配置项。在此模式下，相对路径导入必须写显式扩展名（在 TS 5.0+ 配合 `allowImportingTsExtensions: true` 可以直接导入 `.ts`）。
- **tsx**：基于 `esbuild` 实现的极速 TypeScript 执行引擎，不做昂贵的类型检查，直接将 TS 剥离类型转译为原生 JS 并在 Node.js 中执行，秒级冷启动。

### 2. 为什么需要它？
- **告别旧时代黑魔法**：以前打包工具（如 Webpack/CRA）纵容开发者书写省略扩展名或目录隐式 `index.js` 的导入语法。这违反了 Web 原生与 Node.js 原生 ESM 的规范标准，导致项目一旦升级或跨端就频繁报 `ERR_MODULE_NOT_FOUND`。
- **职责分离**：现代最佳实践是将**类型检查**（交给 `tsc --noEmit` 或 IDE 语言服务器）与**代码运行/打包**（交给 `tsx`/`esbuild`）彻底解耦，开发体验提升数倍。

### 3. 日常工作中怎么用？
- 开发环境：使用 `tsx watch main.ts` 极速热重载开发；
- CI/CD 阶段：执行 `tsc --noEmit` 作为门禁，100% 拦截静态类型错误；
- 生产环境：如果是微服务/Serverless，可预编译为单文件或者直接使用经过验证的容器环境运行。

---

## 🔬 核心代码切片

```typescript
// calc.ts
export function add(a: number, b: number): number {
  return a + b;
}

// main.ts
// NodeNext 规范：显式书写 .ts 扩展名
import { add } from "./calc.ts";

console.log(`计算结果: ${add(10, 20)}`);
```

---

## 🖥️ 控制台预期输出快照

```text
=== Modern TypeScript NodeNext 演示 ===
导入模块成功: ./calc.ts
计算函数运算验证: 10 + 25 = 35
模块顶层元信息 (import.meta.url): file:///.../main.ts
=======================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 00-toolchain-and-engineering-primer/02-modern-typescript-setup/main.ts
```
