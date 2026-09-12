# 大厂高频面试题精讲 (03-native-test-runner)

---

### Q1: 为什么在现代 Node.js 测试中强烈推荐导入 `node:assert/strict`，而不是直接使用旧版 `node:assert`？

#### 🎯 面试官考点
- 考察对 JavaScript 类型隐式转换（Type Coercion）与断言安全性的敏感度。

#### 💡 满分回答模板
1. **传统 `assert.equal()` 存在隐式转换隐患**：
   - 旧版非严格模式下的 `assert.equal(1, '1')` 是**通过（Pass）**的，因为它底层使用的是双等号宽松比对（`==`）。这在 TypeScript 项目中是极大的逻辑漏洞，容易漏掉类型不一致导致的线上 Bug。
2. **`node:assert/strict` 强制全等三等号比对**：
   - 导入严格模式后，`assert.equal(1, '1')` 会立即抛出 `AssertionError`。
   - 深度比对方法 `assert.deepEqual` 也会自动映射为 `assert.deepStrictEqual`，严格检查对象的原型链（Prototype）和不可枚举属性，避免因原型污染或浅层误判而造成漏测。

---

### Q2: Node.js 原生 `node:test` 相比传统测试框架 `Jest` / `Vitest` 有何优劣？企业选型如何权衡？

#### 🎯 面试官考点
- 技术选型架构思维、启动性能 vs 生态丰富度的权衡能力。

#### 💡 满分回答模板
| 维度 | Node.js 原生 `node:test` | Jest / Vitest |
| :--- | :--- | :--- |
| **安装体积** | **0 KB (内置运行时)** | 数百 MB (包含庞大的依赖树) |
| **冷启动性能** | **极速 (数毫秒)** | 较慢 (尤其是 Jest 的 VM 沙盒初始化) |
| **ESM / TS 兼容**| 原生遵循 Node 标准，零配置 | Vitest 优秀；Jest 配置 ESM 常引发各种诡异问题 |
| **生态成熟度** | 覆盖基础 `describe`/`it`/`mock`，无快照高级 UI | 拥有极丰富的生态插件、快照测试、覆盖率可视化报告等 |

- **选型建议**：
  - **基础工具库、微服务、CLI 脚本**：首选 `node:test`，免受臃肿依赖拖累，秒级运行；
  - **大型全栈单体应用 / 复杂 React SSR 项目**：如需深度 DOM 模拟与丰富的快照/可视化报告，可考虑 `Vitest`。

---

### Q3: 在原生 `node:test` 中，如果需要对网络请求或第三方函数进行 Mock/Spy，该如何实现？

#### 🎯 面试官考点
- 考察对 `node:test` 内置 Mock API (`t.mock` / `test.mock`) 的了解。

#### 💡 满分回答模板
- Node.js 在 `node:test` 中内置了强大的 `mock` 对象，无需安装 Sinon 或 Jest Mock：
  ```typescript
  import test from "node:test";
  import assert from "node:assert/strict";

  test("验证函数调用次数与参数", (t) => {
    // 1. 创建 Spy 包装函数
    const fn = t.mock.fn((x: number) => x * 2);

    fn(5);
    fn(10);

    // 2. 断言调用次数
    assert.equal(fn.mock.callCount(), 2);
    // 3. 断言某次调用的入参与返回值
    assert.deepEqual(fn.mock.calls[0].arguments, [5]);
    assert.equal(fn.mock.calls[0].result, 10);
  });
  ```
- 此外还支持 `t.mock.method(obj, 'methodName')` 拦截已有对象方法并在测试结束后自动还原（Restore），避免单测之间互相污染。
