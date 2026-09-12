/**
 * 03-auth-cookie-session-jwt
 * 演示纯原生 node:crypto 实现的 JWT 签发与验签逻辑，以及防数据篡改检测
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET_KEY = 'company_super_secret_signing_key_2026';

// 1. 生成基于 HMAC-SHA256 的标准 Base64Url JWT
function signJwt(payload: Record<string, unknown>, secret: string): string {
  const toBase64Url = (data: string) => Buffer.from(data).toString('base64url');
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = toBase64Url(JSON.stringify(payload));
  // 对 header.body 计算防篡改签名
  const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

// 2. 验证并解析 JWT 令牌 (使用 timingSafeEqual 防止时序侧信道攻击)
function verifyJwt(token: string, secret: string): { valid: boolean; payload?: unknown } {
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false };

  const [headB64, bodyB64, sigB64] = parts;
  if (!headB64 || !bodyB64 || !sigB64) return { valid: false };

  const expectedSig = createHmac('sha256', secret)
    .update(`${headB64}.${bodyB64}`)
    .digest('base64url');

  // 常数时间对比两个签名，杜绝 Timing Attack
  const bufA = Buffer.from(sigB64);
  const bufB = Buffer.from(expectedSig);
  if (bufA.length !== bufB.length || !timingSafeEqual(bufA, bufB)) {
    return { valid: false };
  }

  const payload = JSON.parse(Buffer.from(bodyB64, 'base64url').toString('utf-8'));
  return { valid: true, payload };
}

function run(): void {
  console.log('=== 身份鉴权基石与轻量 JWT 验签实战 ===');

  // 1. 签发合法 JWT
  const userClaim = { sub: 'usr_8832', username: 'alex', role: 'developer' };
  const token = signJwt(userClaim, SECRET_KEY);
  console.log('1. 签发轻量无状态 JWT 令牌 (三段式结构 Header.Payload.Signature):');
  console.log(`   - 完整 Token: ${token.slice(0, 45)}...[截断]`);

  // 2. 正向验证合法 Token
  const verifyValid = verifyJwt(token, SECRET_KEY);
  console.log('2. 校验正常 Token 结果:');
  console.log(
    `   ✔ 验签通过: ${verifyValid.valid}, 提取载荷: ${JSON.stringify(verifyValid.payload)}`
  );

  // 3. 逆向攻击模拟：黑客偷偷将 Payload 里的 role 从 developer 改成 admin
  console.log('3. 模拟黑客中间人篡改 Payload 数据:');
  const parts = token.split('.');
  const tamperedPayload = Buffer.from(JSON.stringify({ sub: 'usr_8832', role: 'admin' })).toString(
    'base64url'
  );
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

  const verifyTampered = verifyJwt(tamperedToken, SECRET_KEY);
  console.log(`   ❌ 验签被拦截: valid = ${verifyTampered.valid} (签名匹配失败，篡改无所遁形)`);

  console.log('========================================');
}

run();
