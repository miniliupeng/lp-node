# 阶段 06: 数据治理与安全身份认证

在业务系统的核心，数据完整性与权限边界是不可动摇的底线。本阶段我们将掌握如何建立严密的数据输入防御层、如何使用 Node.js 原生嵌入式数据库完成持久化，以及如何搞透现代 Web 认证的两大基石：Cookie/Session 与 JWT 无状态令牌。

---

## 💡 核心工程心智与安全防御

1. **运行时数据模式校验 (Runtime Schema Validation)**：
   - 明确 TypeScript 静态类型在编译后被完全擦除（Type Erasure）的事实；
   - 利用 Zod 进行运行时边界数据拦截与自动清洗，杜绝非法或恶意伪造字段穿透；
   - 掌握 `safeParse` 结果模式提取结构化错误，配合 `z.infer` 实现运行时 Schema 与编译期静态类型双向无缝同步。
2. **原生嵌入式数据库 (node:sqlite)**：
   - Node.js 22.5+ 原生内置 `node:sqlite`（`DatabaseSync`），彻底终结第三方驱动的本地 C++ 编译（`node-gyp`）痛点；
   - 掌握预编译语句（Prepared Statements）将 SQL 结构编译与参数插槽物理分离的本质，从根本上杜绝 SQL 注入；
   - 理解 WAL（Write-Ahead Logging）预写日志模式在并发读写场景下的不互斥吞吐优势。
3. **身份鉴权基石：Session vs JWT**：
   - **Cookie / Session（有状态认证）**：服务端维护会话，配置 `HttpOnly` 防范 XSS 窃取，配置 `SameSite=Lax/Strict` 拦截 CSRF 跨站伪造；
   - **JWT（无状态令牌）**：标准三段式（Header.Payload.Signature），采用 HMAC-SHA256 与 `timingSafeEqual` 防范篡改与时序侧信道攻击；
   - 掌握双 Token（短期 Access Token + 长期 Refresh Token）在保障微服务无状态高性能的同时实现主动吊销。

---

## 🗺️ 阶段专题导航

| 专题目录 | 核心原语 | 关键掌握目标 |
| :--- | :--- | :--- |
| **[01-zod-runtime-validation](./01-zod-runtime-validation)** | 运行时契约与自动类型推导 | 掌握 Zod 严格模式、错误格式化、数据清洗与 `z.infer` 静态类型双向绑定 |
| **[02-sqlite-embedded-database](./02-sqlite-embedded-database)** | 原生轻量嵌入式数据库操作 | 掌握 Node 22.5+ 原生 `node:sqlite`、预编译语句 `prepare` 与参数化防 SQL 注入 |
| **[03-auth-cookie-session-jwt](./03-auth-cookie-session-jwt)** | 身份鉴权基石与轻量 JWT 验签 | 掌握 Cookie 安全属性（HttpOnly/SameSite）与原生手写轻量 HMAC-SHA256 JWT 签发验证 |

---

## 🚀 统一运行指令

```bash
make run-06
```
