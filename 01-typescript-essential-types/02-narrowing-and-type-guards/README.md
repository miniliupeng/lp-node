# 02-narrowing-and-type-guards: 类型收窄与自定义类型守卫

在处理接口入参、RPC 响应或第三方返回的混合类型数据时，TypeScript 需要我们通过逻辑判断，把宽泛的宽类型（如 `unknown` 或联合类型）一步步精确“过滤”成可安全操作的具体类型，这就是**类型收窄（Narrowing）**。

---

## 💡 核心原理三段式

### 1. 是什么？
- **类型收窄 (Type Narrowing)**：根据代码中的条件分支逻辑，TypeScript 控制流分析器（Control Flow Analysis）自动在特定代码块内推导出更小、更具体的子类型。
- **自定义类型守卫 (Type Guard)**：返回值形式为 `arg is SpecificType` 的函数。当该函数返回 `true` 时，编译器会在后续上下文中将变量判定为 `SpecificType`。
- **可辨识联合 (Discriminated Union)**：拥有一个共有单例字面量字段（如 `status` 或 `type`）的联合类型。

### 2. 为什么需要它？
- **告别不安全的类型断言（`as SpecificType`）**：强行使用 `as` 欺骗编译器，一旦运行时数据与断言不符，就会直接抛出 `Cannot read properties of undefined` 导致线上崩溃。
- **穷举性检查 (Exhaustiveness Checking)**：结合 `never` 类型，确保未来新增类型分支时，遗漏处理会在编译期立即爆红提醒。

### 3. 日常工作中怎么用？
- 解析 HTTP Body 请求时，结合类型守卫确认字段是否存在；
- 状态机设计（如支付状态：`pending | success | failed`）采用可辨识联合。

---

## 🔬 核心代码切片

```typescript
// 1. 自定义类型守卫
function isAxiosError(err: unknown): err is { response: { status: number } } {
  return typeof err === "object" && err !== null && "response" in err;
}

// 2. 可辨识联合与穷举检查
type Result = { kind: "ok"; data: string } | { kind: "fail"; error: string };

function handleResult(res: Result) {
  if (res.kind === "ok") console.log(res.data);
  else console.error(res.error);
}
```

---

## 🖥️ 控制台预期输出快照

```text
=== 类型收窄与类型守卫实战 ===
1. 自定义类型守卫 (Type Guard) 验证:
   - 捕获并识别 API 业务错误: 状态码 403, 权限不足
2. 可辨识联合与状态机穷举处理:
   - 正在处理 SUCCESS: 订单支付成功, 金额: 199.9 元
   - 正在处理 REFUND: 订单全额退款, 原因: "用户主动取消"
===============================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 01-typescript-essential-types/02-narrowing-and-type-guards/main.ts
```
