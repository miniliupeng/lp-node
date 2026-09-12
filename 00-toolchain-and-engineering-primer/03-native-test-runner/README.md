# 03-native-test-runner: 原生零依赖单元测试与断言机制

从 Node.js 18 开始，官方内置了原生测试套件 `node:test` 与 `node:assert`，并在 Node.js 20/22 中趋于成熟稳定。这意味着我们不再需要为了跑几个单测而安装体积高达数百兆的 Jest、Babel 和各种 preset。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`node:test`**：Node.js 内置的测试运行器，原生提供 `describe`、`it`、`test`、`beforeEach` 等标准测试套件 API。
- **`node:assert/strict`**：Node.js 原生严格断言模块，支持 `assert.equal`、`assert.deepStrictEqual`、`assert.rejects` 等。

### 2. 为什么需要它？
- **零安装体积与极速启动**：传统 Jest 自带一套极其复杂的 VM 沙盒模拟与编译流程，大型项目中仅启动测试框架就需要几秒；而 `node:test` 零外部依赖，毫秒级执行完毕。
- **天然契合 ESM 与现代 Web 标准**：无需配置复杂的 `babel-jest` 或 `ts-jest`，直接搭配 Node 原生模块加载即可运行。

### 3. 日常工作中怎么用？
- 在公共库开发、轻量微服务或日常工具编写中，直接在 `package.json` 中配置 `"test": "node --test"` 即可；
- 配合 `assert.rejects()` 针对异步异常与边界场景做严密防护。

---

## 🔬 核心代码切片

```typescript
import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("业务数学模块", () => {
  it("应该正确计算两数之和", () => {
    assert.equal(1 + 2, 3);
  });

  it("当除数为 0 时应该抛出异常", async () => {
    await assert.rejects(async () => {
      throw new Error("除数不能为零");
    }, /除数不能为零/);
  });
});
```

---

## 🖥️ 控制台预期输出快照

```text
▶ 核心业务计算模块测试
  ✔ 正向测试: 正常两数相除应该返回正确商 (1.2ms)
  ✔ 逆向测试: 除数为 0 时应该抛出显式业务异常 (0.8ms)
  ✔ 异步测试: 模拟网络延迟计算应该正确兑现 (5.4ms)
✔ 核心业务计算模块测试 (8.1ms)

ℹ tests 3
ℹ suites 1
ℹ pass 3
ℹ fail 0
```

---

## 🏃 运行方式

```bash
# 方式一：直接运行主测试引导脚本
pnpm exec tsx 00-toolchain-and-engineering-primer/03-native-test-runner/main.ts

# 方式二：使用 Node.js 原生 --test 命令
node --test 00-toolchain-and-engineering-primer/03-native-test-runner/main.test.ts
```
