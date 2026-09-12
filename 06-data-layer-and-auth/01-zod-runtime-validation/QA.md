# 大厂高频面试题精讲 (01-zod-runtime-validation)

---

### Q1: 既然整个项目已经使用 TypeScript 进行了严格的类型声明，为什么在接口入口依然必须引入类似 Zod 的运行时校验？

#### 🎯 面试官考点
- 澄清“编译期静态类型擦除”与“不可信外部输入（Untrusted Input）”的边界。

#### 💡 满分回答模板
1. **TypeScript 类型在运行时彻底消失（Type Erasure）**：
   - TypeScript 代码经过编译/转译后，所有 `interface`、`type`、泛型都会被 100% 抹掉，生产运行的只是纯 JavaScript 代码。
2. **外部网络输入是不可信的（Boundary Problem）**：
   - 用户通过 Postman、前端表单发送过来的 JSON 请求体，其内容本质上是未经任何信任背书的动态数据（`unknown` 类型）。
   - 如果你在代码中写 `const body = req.body as CreateUserDto`，这只是**自欺欺人的“断言欺骗”**。一旦客户端传了一个 `null`、或者把本该是数组的字段传成了字符串，后续执行 `body.tags.map(...)` 就会瞬间爆出未捕获异常导致接口挂掉。
3. **Zod 的双重价值**：
   - **防御式安检**：在运行时层面对输入做格式合法性校验并剥离未声明的恶意字段；
   - **单一数据源（Single Source of Truth）**：通过 `z.infer` 自动从 Schema 生成静态类型，让运行时代码与编译期类型 100% 永远同步。

---

### Q2: `schema.parse()` 与 `schema.safeParse()` 有何本质区别？在 Web 开发中推荐哪种方式？

#### 🎯 面试官考点
- 控制流异常开销（Exception Handling Performance）与 RESTful 错误响应优雅度。

#### 💡 满分回答模板
1. **`schema.parse(data)`：抛出式设计**
   - 校验成功返回解析后的数据；校验失败会直接抛出一个 `ZodError` 异常。
   - *缺点*：在控制器里调用时，如果忘记套 `try/catch`，会导致整个 HTTP 请求变成 500 内部服务器错误崩溃；即使套了 `try/catch`，在 JS 中频繁依靠 `throw/catch` 来驱动常规业务逻辑不仅代码冗长，而且会产生额外的调用栈回溯性能开销。
2. **`schema.safeParse(data)`：结果对象模式（Result Pattern，强烈推荐！）**
   - 绝不主动抛出异常。始终返回一个标准化对象：
     - 成功时返回 `{ success: true, data: T }`；
     - 失败时返回 `{ success: false, error: ZodError }`。
   - *优势*：配合 TypeScript 的类型收窄，通过 `if (!result.success)` 可以极其干净地提取错误字段并直接返回 HTTP 400 Bad Request 给前端，代码扁平优雅，符合现代工程最佳实践。

---

### Q3: 在 Zod 中，如何实现跨字段的联动校验（例如：注册时“确认密码必须等于原密码”）？

#### 🎯 面试官考点
- 掌握 Zod 高级特性 `.refine()` 与自定义错误路径指向（path mapping）。

#### 💡 满分回答模板
- 使用 `.refine()` 方法对整个对象施加自定义逻辑：
  ```typescript
  import { z } from "zod";

  export const RegisterSchema = z
    .object({
      password: z.string().min(8),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "两次输入的密码不一致",
      path: ["confirmPassword"], // 将错误精准绑定到 confirmPassword 字段上
    });
  ```
- **核心要点**：如果不传 `path` 参数，错误会被挂载在对象根层级上；传入 `path: ["confirmPassword"]` 后，前端在解析表单错误时就能精准高亮“确认密码”输入框并展示提示文本。
