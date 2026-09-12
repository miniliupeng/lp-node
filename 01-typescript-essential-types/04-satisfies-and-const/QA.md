# 大厂高频面试题精讲 (04-satisfies-and-const)

---

### Q1: 为什么有了显式类型注解（`const obj: Type = ...`），TypeScript 4.9 还要引入 `satisfies` 运算符？它到底解决了什么痛点？

#### 🎯 面试官考点
- 类型变宽（Type Widening）、字面量丢失与类型系统演进洞察。

#### 💡 满分回答模板
1. **传统类型注解的致命缺点：类型变宽导致丢失精准推断**：
   - 假设有接口 `type Colors = Record<string, string | number[]>`。
   - 当使用传统注解 `const palette: Colors = { red: "#ff0000", rgb: [255, 0, 0] }` 时，编译器会将每一个属性强制变宽为 `string | number[]`。
   - 结果：后续写 `palette.red.toUpperCase()` 时直接报错，因为 TS 认为 `red` 也可能是数组；写 `palette.rgb.slice()` 也报错。必须手动做强制断言或收窄，非常繁琐。
2. **`satisfies` 的完美平衡**：
   - 语法：`const palette = { ... } satisfies Colors;`
   - **双重保障**：
     1. **契约校验**：如果多写或少写了不符合 `Colors` 规范的字段，立即在编译期报错；
     2. **保留精准类型**：`red` 依然精准保留为字面量 `string`，`rgb` 依然精准保留为数字数组，完美享受代码自动补全与原生方法调用。

---

### Q2: `as const`（常量断言）的核心作用是什么？它与 JavaScript 原生 `Object.freeze()` 有何本质区别？

#### 🎯 面试官考点
- 编译期类型推断 vs 运行时对象防篡改的边界。

#### 💡 满分回答模板
1. **`as const` 的三层作用（完全发生在编译期）**：
   - 将字面量类型（如 `"admin"`、`123`）固化，防止被宽化为 `string`、`number`；
   - 将对象属性递归标记为 `readonly`；
   - 将数组字面量推断为固定长度的只读元组（Tuple）。
2. **与 `Object.freeze()` 的对比表**：
| 维度 | `as const` | `Object.freeze()` |
| :--- | :--- | :--- |
| **生效时机** | **仅 TypeScript 编译期**（运行时被完全擦除） | **JavaScript 运行时**（由 V8 引擎底层拦截） |
| **运行时拦截** | 编译后是普通对象，运行时仍可被非法修改 | 运行时如果修改属性，严格模式下抛出 TypeError |
| **递归深度** | **默认深度只读**（嵌套子属性也是 readonly） | **仅浅层冻结**（嵌套对象依然可被修改） |

---

### Q3: `value as Type`（类型断言）与 `value satisfies Type` 有什么根本差异？

#### 🎯 面试官考点
- 类型安全防御意识，避免用 `as` 掩耳盗铃。

#### 💡 满分回答模板
1. **`as` 是“强行单向覆盖（欺骗编译器）”**：
   - `const user = { name: "Tom" } as FullUser;`
   - 即使对象缺少了 `FullUser` 要求的关键字段（如 `id`、`role`），编译器也会选择**信任开发者并彻底闭嘴**。一旦运行时调用 `user.id`，直接抛出 `undefined`，是典型的隐蔽 Bug 来源。
2. **`satisfies` 是“严密合规校验”**：
   - `const user = { name: "Tom" } satisfies FullUser;`
   - 如果对象缺少字段，编译器会立即报错，绝不妥协；同时在此基础上保留对象现有的推断类型，保障全流程的类型安全。
