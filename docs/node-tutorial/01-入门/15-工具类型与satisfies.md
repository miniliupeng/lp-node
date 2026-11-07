# 工具类型与 satisfies

这一章是编译期的。Node 22.23.4 的类型剥离会把这些语法擦掉或直接拒绝，不会根据它们报类型错误。要检查，用 `tsc --noEmit`。下面的代码块给阅读和面试，不在 `run-all` 里执行。

## 是什么

工具类型从已有类型算出新类型，避免把同一组字段写两遍。

| 类型 | 得到 |
| --- | --- |
| `Partial<T>` | 所有字段可选 |
| `Required<T>` | 所有字段必填 |
| `Pick<T, K>` | 只留这些键 |
| `Omit<T, K>` | 去掉这些键 |
| `Record<K, V>` | 一组键都是 `V` |
| `Readonly<T>` | 字段只读 |
| `ReturnType<F>` | 函数返回值 |
| `Parameters<F>` | 参数元组 |
| `Awaited<T>` | 剥掉 Promise 的包装 |

`Partial` 适合补丁对象。把它当成「创建用户」的入参，就会让必填字段也变成可缺。创建用原类型，更新用 `Partial`。

## satisfies 解决什么

`const routes = { health: () => 'ok' } as const` 会把值收得很窄。`const routes: Record<string, Handler> = { health: () => 'ok' }` 又宽到丢掉 `health` 这个键。`satisfies Record<string, Handler>` 检查值符合 `Handler`，同时保留键的字面量，后面可以写 `routes.health`，拼错键会在编译期失败。

```typescript
type Handler = (id: string) => string;

const routes = {
  health: () => 'ok',
} satisfies Record<string, Handler>;
```

这里的 `health` 不接收 `id`，和 `Handler` 的参数列表并不矛盾：少声明参数是允许的。返回值若不是 `string`，`satisfies` 会失败。`as Record<string, Handler>` 在返回值错误时也可能被你强行按过去，取决于断言怎么写。优先 `satisfies`，少用 `as`。

## 和运行时的距离

`ReturnType` 不会在运行时存在。队列消息、HTTP 正文仍要校验。工具类型让你自己的函数之间少写重复字段，不让网络上的字节变安全。

`enum` 不是工具类型。它有运行时对象，22.23.4 的剥离不接受，见[权限与类型剥离](../03-运行时/14-权限与类型剥离.md)。字符串联合比 `enum` 更适合被剥离。

## 本章问答

### 1. Partial 用在更新还是创建？

**考点：** 可选字段会放宽契约。

**回答：** 更新。创建若用 `Partial`，调用方可以一个字段都不传，编译期仍然通过。运行时再去补默认值，就会把「没传」和「传了空」混在一起。

### 2. satisfies 和 as 差在哪？

**考点：** 检查并保留窄类型。

**回答：** `satisfies` 要求值符合目标类型，表达式的类型仍是原来的窄类型。`as` 把类型改成你写的那个，错误的值也能被按过去。配置对象、路由表用 `satisfies`。

### 3. 这些类型能在 node file.ts 里查错吗？

**考点：** 剥离。

**回答：** 不能。它们被擦掉。查错是 `tsc` 的工作。把「文件能执行」当成「类型是对的」，会漏掉整章的内容。

## 事故复盘

创建用户的参数类型用了 `Partial<User>`，调用方可以不传 `email`。编译通过，数据库非空约束失败，错误变成 500。`Partial` 只给更新用。创建用必填类型，更新再选字段。

路由表写成 `as Record<string, Handler>`，拼错的键 `helth` 被断言按过去，运行时 404。`satisfies` 会在键和值不符合时失败，同时留下具体的键名。

有人用 `node routes.ts` 通过当成类型检查通过。剥离不看 `satisfies`。检查命令是 `tsc --noEmit`，和运行命令分开写进仓库说明。
