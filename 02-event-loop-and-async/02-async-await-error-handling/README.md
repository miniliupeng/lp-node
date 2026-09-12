# 02-async-await-error-handling: 异步异常优雅治理与并发容灾

`async/await` 让异步代码具备了同步的阅读体验，但如果异常处理不当，很容易引发全流程崩溃或满屏难看的嵌套 `try/catch`。

---

## 💡 核心原理三段式

### 1. 是什么？
- **异步异常冒泡**：`async` 函数隐式返回一个 Promise。在函数内部 `throw` 的任何错误，都等同于将该 Promise 转为 `rejected` 状态。
- **Go 语言风格元组包装 (Safe Await Pattern)**：将 `Promise<T>` 转换为返回 `Promise<[null, T] | [Error, null]>` 的安全包装函数，彻底消灭层层缩进的 `try/catch`。
- **`Promise.allSettled`**：接收多个 Promise，无论成功还是失败均全部等待结束，返回包含状态 `fulfilled` / `rejected` 的明细数组。

### 2. 为什么需要它？
- **`Promise.all` 的“一损俱损”缺陷**：如果并发请求 5 个外部微服务，其中只有 1 个非关键服务超时失败，`Promise.all` 会立即整体 Reject，把另外 4 个成功的结果也全部丢弃！
- **`Promise.allSettled` 的弹性容灾**：即使个别子任务失败，仍然可以提取成功的数据做降级兜底渲染。

### 3. 日常工作中怎么用？
- 批量扇出异步任务（如批量请求微服务接口）优先用 `Promise.allSettled`；
- 复杂串行流程使用安全的 Safe Await 工具函数。

---

## 🔬 核心代码切片

```typescript
// Go 风格轻量安全包装器
async function toSafe<T>(promise: Promise<T>): Promise<[Error, null] | [null, T]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), null];
  }
}

// 扁平直观、零深层嵌套
const [err, user] = await toSafe(fetchUser(userId));
if (err) return handleUserError(err);
```

---

## 🖥️ 控制台预期输出快照

```text
=== 异步异常治理与并发容灾实战 ===
1. Go 风格 Safe Await 元组错误处理:
   - 成功路径: 获取到用户 [usr_101] Alex
   - 失败路径: 优雅捕获已知业务异常: "数据库连接超时" (进程平稳无奔溃)
2. Promise.allSettled 并发聚合与容灾降级:
   - 任务总数: 3, 成功: 2, 失败降级: 1
   - 成功数据摘要: ["用户画像数据", "订单历史数据"]
   - 降级服务报警: "推荐算法服务不可用 (降级为默认热门列表)"
=================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 02-event-loop-and-async/02-async-await-error-handling/main.ts
```
