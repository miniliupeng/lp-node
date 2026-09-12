# 阶段 06: 数据治理与安全身份认证

在业务系统的核心，**数据**是资产，而**鉴权**是护城河。本阶段我们将掌握如何建立严密的数据输入防御层、如何使用 Node.js 原生嵌入式数据库完成持久化，以及如何搞透现代 Web 认证的两大基石：Cookie/Session 与 JWT 无状态令牌。

---

## ☕ 生活化心智：银行金库与通行证

1. **Zod 运行时校验**：
   - 就像**银行门口的安检机与身份证扫描仪**。外面的入参数据无论怎么声明，进入系统前必须过安检。一旦发现缺损、越界或格式不对，立即在安检闸口报警拦截，绝不放进内网污染数据库。
2. **node:sqlite (原生嵌入式数据库)**：
   - 就像**办公室抽屉里的加密离线账本**。不再需要为本地测试启动笨重的 MySQL/PostgreSQL 容器，Node.js 22.5+ 原生内置了 SQLite 支持，支持毫秒级内存建表、预编译语句与事务回滚。
3. **Cookie / Session vs JWT**：
   - **Cookie / Session** 就像**健身房的存包柜手牌**：前台（服务端）在总台记账你的名字，只给你一把写着编号的手牌（SessionID）。每次来前台核对账本，服务端能随时单方面把你的手牌注销拉黑。
   - **JWT (JSON Web Token)** 就像**盖了防伪钢印的纸质火车票**：车票上印着你的车次、身份证号（Payload）和防伪印章（Signature）。列车员（分布式微服务网关）只要摸一下钢印是否属实，不需要打电话回车站总机查账本，就能确认你合法登车。

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
