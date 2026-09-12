# 大厂高频面试题精讲 (03-utility-types-practical)

---

### Q1: `Partial<T>` 和 `Readonly<T>` 的底层实现原理是什么？请手写它们的 TypeScript 实现。

#### 🎯 面试官考点
- 映射类型（Mapped Types）、索引类型查询操作符 `keyof` 与修饰符语法。

#### 💡 满分回答模板
1. **手写实现**：
   ```typescript
   // 1. Partial: 将所有属性遍历并添加可选修饰符 ?
   type MyPartial<T> = {
     [K in keyof T]?: T[K];
   };

   // 2. Readonly: 将所有属性遍历并添加 readonly 修饰符
   type MyReadonly<T> = {
     readonly [K in keyof T]: T[K];
   };
   ```
2. **底层原理剖析**：
   - `keyof T`：获取类型 `T` 的所有公共属性名，组成一个字符串/字面量联合类型；
   - `[K in keyof T]`：映射类型语法，相当于在类型层面进行 `for...in` 遍历；
   - `?` 或 `readonly`：属于属性修饰符，在映射时赋予对应的新能力。同理，如果要移除可选修饰符（实现 `Required<T>`），只需写 `-?` 即可。

---

### Q2: `Pick<T, K>` 与 `Omit<T, K>` 有什么区别？`Omit` 底层是如何利用 `Exclude` 实现的？

#### 🎯 面试官考点
- 条件类型（Conditional Types）、分布式条件类型与属性过滤。

#### 💡 满分回答模板
1. **区别**：
   - `Pick<T, K>` 是**正向挑选**：从 `T` 中挑选出属性名在联合类型 `K` 中的子集；
   - `Omit<T, K>` 是**逆向剔除**：从 `T` 中剔除属性名在联合类型 `K` 中的字段，保留其余全部字段。
2. **手写底层实现**：
   ```typescript
   // 1. Pick 实现：约束 K 必须继承于 keyof T
   type MyPick<T, K extends keyof T> = {
     [P in K]: T[P];
   };

   // 2. Exclude 实现：如果 T 继承自 U 则返回 never，否则保留
   type MyExclude<T, U> = T extends U ? never : T;

   // 3. Omit 实现：先用 Exclude 剔除键名，再用 Pick 挑选剩下的键名
   type MyOmit<T, K extends keyof any> = MyPick<T, MyExclude<keyof T, K>>;
   ```

---

### Q3: `ReturnType<T>` 的底层原理是什么？`infer` 关键字在其中扮演了什么角色？

#### 🎯 面试官考点
- 条件类型中的类型推断关键字 `infer`（Type Inference in Conditional Types）。

#### 💡 满分回答模板
1. **手写实现**：
   ```typescript
   type MyReturnType<T extends (...args: any[]) => any> = T extends (
     ...args: any[]
   ) => infer R
     ? R
     : any;
   ```
2. **`infer` 的核心作用**：
   - `infer` 只能在条件类型的 `extends` 子句中使用。它相当于在类型系统层面**声明一个“待推断的临时类型变量占位符”**。
   - 当传入一个具体函数类型（如 `() => { id: number }`）时，TypeScript 会将实际的函数返回值类型自动捕获并赋给变量 `R`，随后在条件为真（三元运算符的前半部分）时直接返回 `R`。
   - 同理，`Parameters<T>` 也是利用 `(...args: infer P) => any` 来提取参数元组类型的。
