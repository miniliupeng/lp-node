# 03-auth-cookie-session-jwt: 身份鉴权基石与轻量 JWT 验签

身份验证（Authentication）与授权（Authorization）是所有后端系统的命门。理解“有状态的 Session”与“无状态的 JWT”的权衡，是架构选型的必修课。

---

## 💡 核心原理三段式

### 1. 是什么？
- **Cookie / Session (有状态认证)**：
  - 用户登录成功后，服务端在 Redis 或内存中保存一份会话对象，向客户端下发一个随机的 `sessionId` 写入 Cookie；
  - 必须配置安全属性：`HttpOnly`（禁止前端 JS 脚本读取防 XSS）、`SameSite=Lax/Strict`（防跨站伪造请求 CSRF）。
- **JWT (JSON Web Token, 无状态认证)**：
  - 格式为标准的三段式：`Header.Payload.Signature`；
  - 服务端用私钥/秘钥对前两段进行加密签名；后续验证时，只需比对签名合法性，**服务端无需查询任何数据库即可知道用户身份**。

### 2. 为什么需要搞透它们？
- **微服务架构下 Session 的痛点**：用户量达到千万级时，上千台微服务实例如果每次请求都要远程查询一次集中式 Redis 验证 Session，Redis 会成为整个系统的单点性能瓶颈与脆弱点；
- **JWT 的痛点**：JWT 签发后就像泼出去的水，在过期之前无法被轻易单方面注销（除非维护黑名单）。因此生产环境通常结合 **短期 Access Token (如 15 分钟) + 长期 Refresh Token (如 7 天)** 实现平衡。

### 3. 日常工作中怎么用？
- 传统管理后台优先用成熟的 Session；移动端 App、对外开放开放平台 OpenAPI、跨域分布式微服务首选 JWT。

---

## 🔬 核心代码切片 (纯原生 30 行搞透 JWT 签名)

```typescript
import { createHmac } from "node:crypto";

function signJwt(payload: object, secret: string): string {
  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64(payload);
  const sig = createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}
```

---

## 🖥️ 控制台预期输出快照

```text
=== 身份鉴权基石与轻量 JWT 验签实战 ===
1. 签发原生轻量 JWT 令牌:
   - 载荷: {"sub":"usr_9981","name":"Alex","role":"admin"}
   - 完整 Token: eyJhbGci...eyJzdWIi...5xN3m...
2. 正向验证合法 Token:
   ✔ 验签成功！合法用户: Alex (角色: admin)
3. 逆向防篡改测试 (黑客偷偷把 role 改为 superadmin):
   ❌ 验签失败: 签名不匹配！检测到数据已被恶意篡改！
4. 安全 Cookie 关键防御属性心智:
   - HttpOnly: 拦截 XSS 盗取 Cookie
   - SameSite=Strict: 拦截第三方网站携带触发 CSRF 攻击
========================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 06-data-layer-and-auth/03-auth-cookie-session-jwt/main.ts
```
