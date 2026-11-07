# D05 运行时校验

对应示例：[`examples/node-tutorial/D/06-validation.mjs`](../../../examples/node-tutorial/D/06-validation.mjs)

## 类型标注不够

TypeScript 的类型在剥离或编译后就没有了。HTTP 正文、环境变量、文件，到运行时都是 `unknown`。在边界上收紧，边界内再当成可信结构。

示例 `parseUser`：

- 不是对象、是 `null`、或是数组：抛 `TypeError`
- `name` 必须是长度 1 到 40 的字符串
- `age` 必须是 0 到 130 的整数。`1.5` 和 `'36'` 都拒绝
- 返回新对象 `{ name, age }`，调用方改返回值不会改到输入，输入上的 `extra` 也不会留下来

最后一条让“多出来的字段”不会被存进数据库。白名单比黑名单稳。

## 放在哪

路由读完 JSON 后立刻 `parseUser`。领域函数可以声明参数类型为 `{ name: string, age: number }`，因为不经过解析它就不会被路由调用。

失败变成 400 和稳定错误码。不要把 `TypeError` 的默认文案直接当最终 API，可以在路由层映射成 `E_NAME` / `E_AGE`。

## 和 Zod 的关系

仓库里 `06-data-layer-and-auth/01-zod-runtime-validation` 用 Zod 做同样的事，并推出静态类型。应用里用它或类似库，少写样板。本教程的手写函数是为了把规则露出来：整数检查用 `Number.isInteger`，范围要写死，返回值要收窄。

## 自测

1. 为什么数组不能当成 user？`typeof [] === 'object'`，但字段语义不成立。示例专门拒绝数组。
2. `'36'` 为什么不是合法年龄？类型是字符串。不要在校验里偷偷 `Number()` 把坏输入变合法，除非 API 合同写了“接受数字字符串”。
3. 为什么返回新对象？避免多余字段和共享引用。
