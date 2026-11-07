# C14 能力边界：权限、类型剥离、扩展方式

对应示例：

- [`C/14-permission.mjs`](../../../examples/node-tutorial/C/14-permission.mjs)
- [`C/15-types-strip.mjs`](../../../examples/node-tutorial/C/15-types-strip.mjs)
- [`C/16-message-channel.cjs`](../../../examples/node-tutorial/C/16-message-channel.cjs)

## 权限模型

不加旗标时，`process.permission` 是 `undefined`，进程按普通用户权限访问系统。

```bash
node --permission --allow-fs-read=/tmp -e "require('node:fs').readFileSync('/etc/hostname')"
```

示例断言这次失败，stderr 含 `ERR_ACCESS_DENIED`。把 `--allow-fs-read` 改成 `/etc/hostname` 之后，读取成功并打印 `ok`。

这是进程自己的限制，用来收紧脚本、插件或测试运行器。它不代替操作系统用户和容器的文件系统权限。两条一起用。

还有 `--allow-fs-write`、网络相关的允许项。旗标以 `node --help` 里这一版的说明为准。

## 直接运行 TypeScript

`process.features.typescript` 在 22.23.4 上是 `"strip"`。`strip-sample.ts` 只有类型注解：

```typescript
const left: number = 2;
const right: number = 3;
console.log(left + right);
```

`node strip-sample.ts` 打印 `5`。运行时把类型擦掉，**不做类型检查**。错误的类型标注只要擦掉后仍是合法 JavaScript，进程就会执行。`tsc --noEmit` 仍然需要。

`enum` 不是可擦除语法。直接运行 `enum-sample.ts` 得到 `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`。加上 `--experimental-transform-types` 后打印 `1`，同时有实验警告。参数属性、命名空间这类需要改写的语法也在这条边界上。

新代码在 Node 22 的剥离模式下使用函数、`interface`、类型别名、`as const` 这类能擦掉的写法。需要 `enum` 时，改成字符串联合，或在构建步骤里编译。

## 扩展一个服务的手段

按代价从低到高：

1. 异步 I/O，避免同步 API 和长循环占住主线程
2. 缓存与限流，减少重复工作和过载
3. 把 CPU 重的函数放进少量 Worker
4. 多进程（cluster 或容器副本）处理更多并发连接
5. 把状态放到数据库和队列，使进程可以随时替换

每一步都先有 C11 的测量。连接数上去了但 CPU 很低，多半是在等数据库，加 Worker 没有用。

## 自测

1. 类型剥离会捕获 `number` 传成 `string` 吗？不会。那是 `tsc` 的工作。
2. 为什么默认跑不了 `enum`？剥离器不改写语法，`enum` 需要变换。
3. `--permission` 和容器用户的差别？一个是 Node 进程内的允许列表，一个是操作系统隔离。
