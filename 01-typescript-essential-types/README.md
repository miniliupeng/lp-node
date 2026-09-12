# 阶段 01: TypeScript 核心类型系统进阶

在 Node.js 服务端开发中，TypeScript 绝不仅仅是简单的变量类型注解。缺乏扎实的类型心智会导致 TS 退化为难以维护的 `anyScript`。本阶段将彻底夯实日常高频与面试必考的四大类型原语。

---

## 💡 核心工程心智与类型设计

1. **原始类型 vs 引用内存模型**：
   - 原始类型（number, string, boolean 等）固定分配于调用栈（Stack），传参及赋值遵循纯粹的值拷贝（Pass-by-Value）；
   - 引用类型（Object, Array 等）实体存放在堆内存（Heap），栈中仅保存物理指针引用；
   - 掌握浅拷贝（展开运算符）的共享引用副作用，全面采用现代标准 `structuredClone()` 实现深度物理隔离。
2. **类型收窄 (Narrowing) 与类型守卫 (Type Guards)**：
   - 依据控制流分析（Control Flow Analysis），通过 `typeof`、`instanceof`、`in` 操作符将宽泛联合类型缩减为具体子类型；
   - 编写自定义类型谓词函数（`arg is TargetType`），避免危险的不安全强制类型断言（`as`）；
   - 利用可辨识联合（Discriminated Unions）与 `never` 类型实现编译期穷尽性检查（Exhaustiveness Checking）。
3. **工具类型 (Utility Types) 派生体系**：
   - 基于单一基准实体（Single Source of Truth），通过 `Partial`、`Required`、`Readonly`、`Pick`、`Omit`、`Record` 实现业务 DTO（数据传输对象）的按需动态派生，杜绝重复手写冗余接口；
   - 掌握 `ReturnType` 与 `Parameters` 利用 `infer` 关键字反向提取函数签名的底层原理。
4. **satisfies 运算符与常量断言 (as const)**：
   - `as const` 将变量递归收窄为只读字面量类型，消除自动类型宽化（Type Widening）；
   - `satisfies` 在验证表达式完全符合指定类型契约的同时，**保留变量原本精确的字面量推导与智能补全**，完美解决类型安全与开发体验的矛盾。

---

## 🗺️ 阶段专题导航

| 专题目录 | 核心原语 | 关键掌握目标 |
| :--- | :--- | :--- |
| **[01-primitive-and-reference](./01-primitive-and-reference)** | 内存模型与引用传递 | 搞透栈内存/堆内存区别、对象引用副作用与现代 `structuredClone` 深拷贝 |
| **[02-narrowing-and-type-guards](./02-narrowing-and-type-guards)** | 类型收窄与自定义守卫 | 掌握可辨识联合（Discriminated Union）与自定义类型谓词 `val is T` |
| **[03-utility-types-practical](./03-utility-types-practical)** | 实用工具类型企业实战 | 熟练组合 `Partial`、`Pick`、`Omit`、`Record` 等实现业务 DTO 派生 |
| **[04-satisfies-and-const](./04-satisfies-and-const)** | 精确推断与契约校验 | 掌握 TS 4.9+ `satisfies` 与 `as const` 的最佳搭配与推断保留 |

---

## 🚀 统一运行指令

```bash
make run-01
```
