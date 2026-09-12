# 阶段 00: 现代工程工具链与开发基石

工欲善其事，必先利其器。在深入 Node.js 底层与业务架构之前，必须先理清现代 Node.js 后端工程的工具链基石：**如何以最轻量、最现代、最高效的方式构建、运行与测试 TypeScript 代码**。

---

## 💡 核心工程心智与工具演进

1. **Node.js LTS 现代运行时**：
   - 基于 Google V8 引擎与 libuv 异步事件驱动架构。
   - 现代版本（Node.js 22+）全面支持 Pure ESM、Top-Level Await、内置 `.env` 文件加载及类型擦除运行。
2. **pnpm 内容寻址与硬链接模型**：
   - 基于全局内容寻址存储（Content-Addressable Store）与操作系统硬链接（Hard Link），解决传统 npm/yarn 的磁盘重复占用问题；
   - 采用严格的非扁平化目录树（Symlink），从机制根源杜绝“幽灵依赖（Phantom Dependencies）”。
3. **TypeScript + tsx 极速转译生态**：
   - 现代工程推崇**“代码运行（Execution）”与“类型质检（Type Checking）”职责解耦**；
   - 开发与运行环境采用基于 Go 编写的 `tsx`（esbuild 驱动），实现毫秒级冷启动与原生 ESM 解析；
   - 质量门禁层通过 `tsc --noEmit` 确保静态类型 100% 安全。
4. **原生测试运行器 (Native Test Runner)**：
   - 摆脱历史笨重的外部测试框架全家桶（如 Jest/Babel），拥抱 Node.js 内置的 `node:test` 与 `node:assert/strict`，实现零外部依赖、极低资源开销的单元测试体系。
5. **配置与环境变量安全治理**：
   - 遵循十二要素应用规范（12-Factor App），将配置与代码物理分离；
   - 结合 Zod 模式校验，在服务启动初始阶段（Fail-Fast）拦截缺失与类型错误，输出强类型配置对象。

---

## 🗺️ 阶段专题导航

| 专题目录 | 核心原语 | 关键掌握目标 |
| :--- | :--- | :--- |
| **[01-node-runtime-and-pnpm](./01-node-runtime-and-pnpm)** | Node.js 运行时与依赖拓扑 | 掌握 LTS 关键特性、进程状态探针与 pnpm 硬链接节省空间的本质 |
| **[02-modern-typescript-setup](./02-modern-typescript-setup)** | NodeNext 模块规范与轻量运行 | 搞懂 ESM 相对导入后缀规则，使用 tsx 实现 0 编译极速执行 |
| **[03-native-test-runner](./03-native-test-runner)** | 原生零依赖测试与断言 | 摆脱 Jest 笨重依赖，掌握 `node:test` 与 `node:assert/strict` |
| **[04-env-and-configuration](./04-env-and-configuration)** | 现代环境变量治理 | 学习 Node 20.6+ 内置 `.env` 加载，配合 Zod 实现配置安全强校验 |

---

## 🚀 统一运行指令

```bash
make run-00
```
