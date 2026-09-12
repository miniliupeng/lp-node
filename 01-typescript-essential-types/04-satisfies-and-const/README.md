# 04-satisfies-and-const: satisfies 运算符与 as const 强类型推断

在 TypeScript 4.9 之前，开发者面临一个两难困境：**要类型安全检查，还是保留精确的字面量推断与自动补全？** `satisfies` 运算符的诞生终结了这个世纪痛点。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`as const` (常量断言)**：将对象属性收窄为只读（`readonly`），并将原始字面量（如 `"GET"`、`404`）固化为字面量类型，而不是宽泛的 `string` 或 `number`。
- **`satisfies` 运算符**：检查表达式是否符合某种类型契约，**但不会改变表达式本身的推断类型**。

### 2. 为什么需要它？
- **痛点场景：类型变宽（Type Widening）**
  - 如果我们显式声明 `const config: Record<string, string | number> = { host: "localhost", port: 8080 }`，TypeScript 会认为每个属性的值都是 `string | number`。
  - 此时当你写 `config.host.toLowerCase()` 时，TS 会报错提示“number 类型上没有 toLowerCase 方法”，因为精准的 `string` 类型被抹平变宽了！
- **`satisfies` 的救赎**：
  - 改写为 `const config = { host: "localhost", port: 8080 } satisfies Record<string, string | number>`；
  - 既能保证对象完全符合 Record 规范（写错字段立即报错），又能保留 `host` 是 `string`、`port` 是 `number` 的精准推断！

### 3. 日常工作中怎么用？
- 全局路由表、配色主题字典、权限常量映射。

---

## 🔬 核心代码切片

```typescript
type Palette = Record<string, string | [number, number, number]>;

// 使用 satisfies：既校验契约，又保留字面量特征
const theme = {
  primary: "#3b82f6",
  rgb: [59, 130, 246],
} satisfies Palette;

// 正确推断为 string，安全调用字符串方法！
theme.primary.toUpperCase();
// 正确推断为元组，安全调用数组方法！
theme.rgb.map((val) => val * 2);
```

---

## 🖥️ 控制台预期输出快照

```text
=== satisfies 与 as const 实战演示 ===
1. as const 常量断言推导:
   - 支持的方法列表 (只读元组): ["GET", "POST", "PUT", "DELETE"]
2. satisfies 运算符校验与精准推断保留:
   - 主题色 primary: "#3B82F6" (保留 string 属性与方法调用)
   - 强调色 rgb: "rgb(59, 130, 246)" (保留 Array 元组索引访问)
======================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 01-typescript-essential-types/04-satisfies-and-const/main.ts
```
