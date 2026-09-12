# 大厂高频面试题精讲 (02-narrowing-and-type-guards)

---

### Q1: 什么是 TypeScript 中的类型收窄（Type Narrowing）？有哪些常见的类型收窄方式？

#### 🎯 面试官考点
- 控制流分析（Control Flow Analysis）与各种运行时类型检查操作符在 TS 编译期的映射。

#### 💡 满分回答模板
1. **定义**：类型收窄是 TypeScript 编译器通过分析代码中的控制流逻辑（如 `if`、`switch`、三元表达式），在特定作用域分支内将宽泛类型推导并缩减为更明确具体的子类型的过程。
2. **5 大常见收窄手段**：
   - **`typeof` 守卫**：用于收窄原始类型（如 `typeof x === "string"` 收窄为 string）；
   - **`instanceof` 守卫**：用于收窄类实例（如 `err instanceof Error`）；
   - **`in` 操作符**：用于判断对象是否具有某个特征属性（如 `"data" in response`）；
   - **真值检查 (Truthiness)**：通过 `if (val)` 排除 `null` 和 `undefined`；
   - **可辨识联合 (Discriminated Union)**：利用共有的字面量标签字段（如 `switch (action.type)`）。

---

### Q2: 自定义类型谓词 `arg is Type` 与普通返回 `boolean` 的函数有什么本质区别？

#### 🎯 面试官考点
- 自定义类型守卫（User-Defined Type Guards）的类型系统契约与类型引导能力。

#### 💡 满分回答模板
1. **普通返回 `boolean` 的局限**：
   - 如果函数签名写成 `function isString(val: unknown): boolean`，编译器只知道它返回一个布尔值，但在外部调用者的 `if (isString(val))` 分支内部，`val` 的类型**依然是 `unknown`**，无法直接调用任何 string 方法。
2. **类型谓词 `val is Type` 的增强**：
   - 告诉 TypeScript 编译器的控制流分析器：**一旦当前函数运行时返回 `true`，请立即在当前条件分支块内将入参 `val` 的类型强制认定为 `Type`**。
   - 这样在后续代码中即可直接享受完整的属性提示与类型安全检查，完全摆脱粗暴且危险的 `as` 强制类型断言。

---

### Q3: 什么是可辨识联合（Discriminated Union）？为什么企业级大型项目推荐配合 `never` 类型做穷举检查？

#### 🎯 面试官考点
- 状态机健壮性设计与编译期防御（Exhaustiveness Checking）。

#### 💡 满分回答模板
1. **可辨识联合核心要素**：
   - 多个对象类型组成联合类型；
   - 每个子类型都包含一个同名的、不可重叠的**字面量属性**（如 `kind: "circle" | "square"` 或 `type: "SUCCESS" | "FAILED"`）作为“辨识标签”。
2. **配合 `never` 进行穷举检查（Exhaustiveness Checking）的威力**：
   - 在 `switch (status)` 的 `default` 分支中，编写：
     ```typescript
     default: {
       const _exhaustiveCheck: never = status;
       throw new Error(`未处理的状态: ${_exhaustiveCheck}`);
     }
     ```
   - **防御价值**：如果半年后同事在 `status` 联合类型中新增了一个状态（例如 `PENDING`），但忘记在这个 switch 处理函数中添加 `case "PENDING":`，那么 `status` 在进入 `default` 时的实际类型是 `"PENDING"`，而 `"PENDING"` 无法赋值给 `never` 类型，**TypeScript 编译器会在编译期立即爆红阻断构建**！彻底杜绝上线后漏写分支引发线上 Bug。
