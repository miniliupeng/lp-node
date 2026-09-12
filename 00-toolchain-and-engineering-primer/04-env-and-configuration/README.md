# 04-env-and-configuration: 现代环境变量治理与类型安全

在实际开发中，数据库密码、API Token、端口号等配置绝不能硬编码在代码里。Node.js 20.6+ 官方新增了内置环境变量加载机制，再结合模式验证库（如 Zod），构成了现代企业级配置治理的最佳实践。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`process.loadEnvFile([path])`**：Node.js 20.6+ 内置的读取 `.env` 文件的原生 API，彻底无需第三方 `dotenv` 库。
- **运行时类型校验 (Runtime Validation)**：`process.env` 获取的所有值**默认全是 `string | undefined`**。即使写了 `PORT=8080`，取出来的也是字符串 `"8080"`，如果直接传给需要数字的 API 会引发隐蔽 Bug。因此需要结合 Zod 进行强转与校验。

### 2. 为什么需要它？
- **十二要素应用规范 (The Twelve-Factor App)**：推荐将配置严格与代码分离。同一份镜像/代码可以在本地、测试、预发、生产环境运行，仅通过环境变量切换不同外部资源。
- **快速失败 (Fail-Fast)**：如果某个关键环境变量漏配了（例如忘记配 `DATABASE_URL`），应该在应用启动的第 1 毫秒立即崩溃并清晰告警，而不是等到几小时后用户触发某条业务请求时才抛出奇怪的 NullPointerException。

### 3. 日常工作中怎么用？
- 创建 `.env.example` 提交给 Git 作为配置模板；
- 本地开发新建 `.env` 填入真实凭据（添加到 `.gitignore`）；
- 应用入口初始化时立即执行类型验证函数，验证通过后暴露为全局只读配置对象。

---

## 🔬 核心代码切片

```typescript
import { z } from "zod";

// 定义严格模式契约：确保类型正确且必填项不为空
const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url(),
});

// 验证并导出经过类型转化的配置对象
export const config = EnvSchema.parse(process.env);
```

---

## 🖥️ 控制台预期输出快照

```text
=== 现代环境变量治理演示 ===
1. 正在尝试加载环境配置文件...
   ✔ 成功读取环境变量配置
2. 经过 Zod 强类型校验与类型转换:
   - 监听端口 PORT: 8080 (类型: number)
   - 运行环境 NODE_ENV: "development"
   - 数据库 DATABASE_URL: "postgres://user:secret@localhost:5432/app_db"
   - 指标采集开关: true (类型: boolean)
3. 验证防御机制: 故意篡改非法端口 (如 "abc")...
   ✔ 捕获到预期的启动拦截: Expected number, received nan
============================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 00-toolchain-and-engineering-primer/04-env-and-configuration/main.ts
```
