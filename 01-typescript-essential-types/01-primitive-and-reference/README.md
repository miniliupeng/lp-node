# 01-primitive-and-reference: 原始类型与对象引用模型

在 JavaScript / TypeScript 中，理解变量在内存中的存储形式是避免产生诡异数据篡改 Bug 的第一前提。

---

## 💡 核心原理三段式

### 1. 是什么？
- **原始类型 (Primitives)**：`number`, `string`, `boolean`, `null`, `undefined`, `symbol`, `bigint`。在 V8 引擎中通常直接分配在**调用栈（Stack）**中，存储的是纯粹的具体数值。
- **引用类型 (References)**：`Object`, `Array`, `Function`, `Map`, `Set` 等。实际数据存放在**堆内存（Heap）**中，栈内存中只存储指向该堆内存地址的指针引用。

### 2. 为什么需要搞透它？
- **引用篡改陷阱**：在服务端业务中，如果你把一个全局缓存配置对象直接赋值给一个变量并修改某个嵌套属性，实际上所有并发请求引用的配置都会被瞬间污染！
- **深浅拷贝的代际更迭**：传统展开运算符 `{ ...obj }` 只是浅拷贝（嵌套对象依然共享引用）；而现代 Node.js 17+ 原生内置了 **`structuredClone()`**，彻底取代了脆弱的 `JSON.parse(JSON.stringify())`。

### 3. 日常工作中怎么用？
- 在处理状态变更、防数据突变（Immutability）时，优先使用 `structuredClone()` 进行隔离；
- 在 TypeScript 中使用 `readonly` 修饰符防止意料之外的属性被赋新值。

---

## 🔬 核心代码切片

```typescript
// 浅拷贝陷阱：嵌套层级仍被共享
const original = { user: { name: "Alice" } };
const shallow = { ...original };
shallow.user.name = "Bob"; 
// original.user.name 也变成了 "Bob"！

// 现代解决方案：原生 structuredClone
const deep = structuredClone(original);
deep.user.name = "Charlie"; // original 保持不变
```

---

## 🖥️ 控制台预期输出快照

```text
=== 原始类型 vs 引用模型演示 ===
1. 原始值按值传递验证:
   - 原值: 10, 函数内自增后原值保持: 10 (无副作用)
2. 引用传递与浅拷贝陷阱:
   - 浅拷贝修改嵌套属性后，原对象已被污染: "Bob"
3. 原生 structuredClone 深拷贝隔离验证:
   - 深拷贝独立修改后，原对象属性安全保持: "Bob" (新对象: "Charlie")
================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 01-typescript-essential-types/01-primitive-and-reference/main.ts
```
