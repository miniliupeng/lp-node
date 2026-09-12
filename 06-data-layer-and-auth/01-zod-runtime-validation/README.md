# 01-zod-runtime-validation: Zod 运行时数据验证与 TS 类型双向同步

TypeScript 的类型只在编译期起作用，打包成 JS 运行在生产服务器上后，外部请求发过来的任何畸形数据都可能穿透系统。**Zod** 是现代全栈（Node / Next.js / tRPC）生态中事实上的标准数据校验库。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`z.object({ ... })`**：以声明式语法定义数据模式（Schema）。
- **`z.infer<typeof Schema>`**：从运行时 Schema 中自动反向提取出 100% 准确对齐的 TypeScript 静态类型，彻底解决“写一份 Schema，又得重复手写一份 Interface”的冗余双重维护问题。
- **`schema.safeParse(data)`**：非抛出式解析，返回包含 `{ success: true, data }` 或 `{ success: false, error }` 的可辨识联合对象。

### 2. 为什么需要它？
- **告别 `try/catch` 解析地狱**：传统的校验如果遇到错误直接 `throw`，会导致异常冒泡打断业务流程。`safeParse` 让你能以最优雅的代码结构收集并返回给前端清晰友好的字段级错误清单（如：“邮箱格式不正确”、“密码至少 8 位”）。
- **类型自动净化 (Stripping)**：默认情况下，如果黑客在请求 Body 中恶意塞入 `isAdmin: true` 等隐藏字段，Zod 会自动将其剥离抹除，只保留 Schema 中明确声明的安全字段。

### 3. 日常工作中怎么用？
- 作为 API 网关或 Controller 入口的第一道拦截器，校验 HTTP Body、Query 参数及系统环境变量。

---

## 🔬 核心代码切片

```typescript
import { z } from "zod";

// 1. 契约定义
const UserRegisterSchema = z.object({
  email: z.string().email(),
  age: z.coerce.number().min(18),
});

// 2. 自动反推 TS 类型
type UserRegisterDto = z.infer<typeof UserRegisterSchema>;

// 3. 安全解析
const result = UserRegisterSchema.safeParse(req.body);
if (!result.success) return res.status(400).json(result.error.flatten());
```

---

## 🖥️ 控制台预期输出快照

```text
=== Zod 运行时数据验证实战 ===
1. 正向用例校验测试:
   ✔ 校验成功，获得强类型净化数据:
     - 用户名: "alex_2026", 邮箱: "alex@company.com", 年龄: 25
2. 逆向异常用例拦截测试 (非法邮箱与未成年):
   ✔ 成功拦截非法输入，提取结构化字段错误:
     - email: ["Invalid email"]
     - age: ["Number must be greater than or equal to 18"]
==============================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 06-data-layer-and-auth/01-zod-runtime-validation/main.ts
```
