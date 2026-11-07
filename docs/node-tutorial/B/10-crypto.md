# B10 密码学原语

对应示例：[`examples/node-tutorial/B/10-crypto.mjs`](../../../examples/node-tutorial/B/10-crypto.mjs)

这一章使用 Node 自带的原语。口令存储用慢哈希。令牌用 HMAC。比较用常时间比较。随机用 CSPRNG。

## 哈希

`createHash('sha256').update('abc').digest('hex')` 与 `crypto.subtle.digest('SHA-256', ...)` 在示例里得到同一串 64 个十六进制字符。哈希是单向摘要，不能从摘要恢复原文，也不能当作加密。

`md5` 和裸 `sha1` 不用于安全场景。文件校验如果协议已经规定了 SHA-256，就用 SHA-256。

## HMAC

`createHmac('sha256', secret).update(payload).digest()` 用密钥给消息做认证码。同一密钥、同一消息，两次结果一致。密钥不同或消息被改过，认证码就对不上。

JWT 那一章用的就是 HMAC-SHA256。认证码证明“持有密钥的人生成过这段字节”，它不隐藏正文。

## 常时间比较

`timingSafeEqual(a, b)` 要求两块缓冲的字节长度相同。示例用短缓冲去比，抛出 `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH`。长度不同要当成验证失败，不要为了调用这个函数而去掉长度检查之后的分支差异——先判断长度，长度不同直接失败；长度相同再用 `timingSafeEqual`。

普通的 `===` 或 `Buffer.compare` 可能在第一个不同字节就返回。攻击者通过耗时猜测秘密时，这种提前返回会泄露信息。秘密、令牌、HMAC 用 `timingSafeEqual`。

## 口令

`scrypt` 是慢哈希，22.23.4 有同步和回调形式。示例用 `promisify` 包回调，同一口令、同一盐、同一参数得到相同的 32 字节。盐用 `randomBytes(16)`，每个口令独立的盐，盐和结果一起存储。

这个版本没有 `argon2` 函数。要用 Argon2 需要额外的、经过审查的库。不要自己实现口令哈希。

`pbkdf2` 同样在 `node:crypto` 里，C05 用它占用线程池。这些函数的异步形式会使用 libuv 线程池，因为它们是耗 CPU 的。

## 随机

`randomBytes` 和 `crypto.randomUUID()` 来自密码学随机源。`Math.random()` 不用于令牌、重置码、会话 ID。

## 自测

1. SHA-256 为什么不能用来存口令？它太快，泄露数据库后可以被大量猜测。口令用 scrypt 或 Argon2。
2. HMAC 隐藏了正文吗？没有。它只做认证。
3. `timingSafeEqual` 长度不同会怎样？抛 `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH`。
