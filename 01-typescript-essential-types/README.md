# 阶段 01: TypeScript 核心类型系统进阶

在 Node.js 服务端开发中，TypeScript 绝不仅仅是“在 JS 变量后面随便写个 `: string` 或 `: any`”。如果缺乏扎实的类型心智，TS 就会退化成毫无安全感可言的 `anyScript`。本阶段将彻底夯实日常高频与面试必问的四大类型原语。

---

## ☕ 生活化心智：图纸与实体物品

1. **原始类型 vs 引用模型**：
   - 原始类型（number, string, boolean）像**印章盖印**：你印一份给我，我在我的纸上涂改，绝不会影响你原版纸上的字。
   - 引用类型（Object, Array）像**共享云文档链接**：我发一个链接给你，你在里面删掉一行字，我电脑屏幕上的文档内容瞬间同步被删！
2. **类型收窄 (Narrowing) 与守卫 (Guards)**：
   - 就像海关安检通道。当一个包裹被标记为 `unknown` 或包含多种可能时，通过 `typeof`、`instanceof` 或自定义安检员（`is` 谓词函数），逐层过滤排除疑点，直到在安全区内拿到百分之百确定的类型。
3. **工具类型 (Utility Types)**：
   - 就像工业级乐高模具。我们不需要为“创建用户”、“更新用户”、“公开用户详情”分别重复手写 3 套结构几乎相同的接口，而是通过 `Partial`、`Pick`、`Omit` 快速基于基类派生。
4. **satisfies 运算符与 as const**：
   - 就像验金石。`as const` 把变量冻结为不可篡改的常量字面量；而 `satisfies` 既确保对象满足特定规约，又**保留自身最精确的字面量推断**，彻底解决声明类型丢失属性自动补全的世纪痛点。

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
