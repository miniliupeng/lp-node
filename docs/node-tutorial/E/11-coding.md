# E11 手写题

每题都有可运行文件。先讲不变量，再写代码。

### Q1. 并发池 `mapLimit`

- 难度：中级
- 文件：[`E/01-pool.mjs`](../../../examples/node-tutorial/E/01-pool.mjs)
- 参考答案：下标 `cursor` 只在同步段自增，所以多个 worker 不会领到同一个下标。`active` 在 `await` 前加一、在 `finally` 里减一，`peak` 记录最大值。Worker 数量是 `min(limit, items.length)`。示例对五个元素、上限 2，结果是 `[10,20,30,40,50]`，峰值不超过 2。
- 易错点：在 `await` 之后才自增下标，或者用 `Promise.all(items.map(...))` 却以为自己限制了并发。
- 追问：某一项失败？示例让它抛出去。若要收集错误，改成 `allSettled` 的形状，并仍然在 `finally` 里减少 `active`。

### Q2. LRU

- 难度：中级
- 文件：[`E/02-lru.mjs`](../../../examples/node-tutorial/E/02-lru.mjs)
- 参考答案：`Map` 按插入顺序迭代。`get` 时删除再插入，把键挪到最新。`set` 超过容量时删除 `keys().next()` 的最旧键。容量 2：插入 `a`、`b`，访问 `a`，再插入 `c`，`b` 消失。
- 易错点：`get` 不更新顺序，退化成先进先出。
- 追问：需要过期时间时？条目上存时间，`get` 时如果过期就删除并返回 `undefined`。容量和 TTL 是两件事。

### Q3. 带退避的重试

- 难度：中级
- 文件：[`E/03-retry.mjs`](../../../examples/node-tutorial/E/03-retry.mjs)
- 参考答案：最多 `attempts` 次。失败且还有次数时 `sleep(delayMs * 2 ** attempt)`。示例注入 `sleep`，记录到 `[10, 20]`，第三次成功。全部失败则抛出最后一次错误。
- 易错点：捕获之后不抛出，调用方以为成功。也要避免重试非幂等操作。
- 追问：抖动？在延迟上加一个有界随机量，避免同步重试。随机源用 `crypto.randomInt`，测试里注入。

### Q4. 尾部防抖

- 难度：中级
- 文件：[`E/04-debounce.mjs`](../../../examples/node-tutorial/E/04-debounce.mjs)
- 参考答案：每次调用先取消上一次定时器，再登记新的。只有最后一次在等待结束后执行。示例注入 `{ set, clear }`，连续调用两次，只在手动执行保存下来的回调后增加一次计数。
- 易错点：清掉定时器的同时也丢掉了这一次应该保留的回调。顺序必须是先 clear 再 set。
- 追问：头部防抖？第一次立即执行，之后的窗口内忽略。两者不要混在一个没写清的函数里。

### Q5. 令牌桶

- 难度：中级
- 文件：[`D/01-token-bucket.mjs`](../../../examples/node-tutorial/D/01-token-bucket.mjs)
- 参考答案：按经过的毫秒补充 `refillPerSecond / 1000`，不超过容量。够才扣。时间由参数传入。容量 2、每秒 1 个时，时刻 0 只能成功两次，时刻 1000 再成功一次。
- 易错点：用 `setInterval` 补充，测试和暂停都会漂。
- 追问：多进程？这个实现只在一个进程里正确。全局限流把扣减移到共享存储。

### Q6. HMAC 令牌

- 难度：高级
- 文件：[`D/02-jwt.mjs`](../../../examples/node-tutorial/D/02-jwt.mjs)
- 参考答案：头固定 `HS256`。载荷含 `exp`。签名覆盖 `header.payload`。验证时重算 HMAC，等长才 `timingSafeEqual`，并检查 `exp` 与 `alg`。示例拒绝错误密钥、过期、篡改载荷和 `none`。
- 易错点：用 `===` 比较签名，或相信头里的算法字段。
- 追问：时钟？`exp` 的单位和 `nowSeconds` 一致，比较时把允许的时钟偏差写成明确的秒数，而不是省略检查。

### Q7. 内存队列的可见性

- 难度：高级
- 文件：[`D/03-queue.mjs`](../../../examples/node-tutorial/D/03-queue.mjs)
- 参考答案：`pull` 把 `visibleAt` 推到 `now + visibilityMs`。窗口内第二次 `pull` 为空。过期后同一 id 再次出现。`ack` 删除。这表达至少一次，不表达持久化。
- 易错点：`pull` 时就 `splice` 掉，崩溃即丢失。
- 追问：两个调用者同时 `pull`？在一个 JavaScript 线程上，同步段不会交错。换到多进程就必须用原子领取。
