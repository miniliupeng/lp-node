# C12 模块图与循环依赖

对应示例：

- ESM 活绑定：[`C/12-circular-main.mjs`](../../../examples/node-tutorial/C/12-circular-main.mjs) 及 `12-circular-a.mjs`、`12-circular-b.mjs`
- ESM 初始化期间读取：`12-tdz-a.mjs`、`12-tdz-b.mjs`
- CJS 半成品导出：[`C/12-cjs-main.cjs`](../../../examples/node-tutorial/C/12-cjs-main.cjs)

## ESM

`a` 导入 `b`，`b` 导入 `a`。`b` 在顶层不读取 `aName`，只在函数 `readADuringCall` 里读。两边都评价完之后，`fromB()` 得到 `{ bName: 'module-b', seen: 'module-a' }`。导出是活绑定，函数调用时 `aName` 已经初始化。

`12-tdz-b.mjs` 在顶层执行 `export const early = aName`。这时 `a` 还停在评价中途，`aName` 处于暂时性死区。动态 `import('./12-tdz-a.mjs')` 拒绝，错误是 `ReferenceError`。示例断言了类型。

把读取放进函数，等模块图评价完再调用，循环依赖可以工作。更好的做法是拆出第三个文件放共享常量，让依赖变成单向的。

## CJS

`12-cjs-a.cjs` 先把 `exports.done = false`，再 `require` b。b 反过来 `require` a 时，拿到的是尚未完成的 `exports`，所以 `a.done` 仍是 `false`。b 把自己的 `done` 设为 `true` 之后返回。a 再读 `b.done`，得到 `true`。

示例断言：

- `b.aDoneWhileBInit === false`
- `a.bDoneWhileAInit === true`

CJS 不会因为“绑定还没初始化”抛 `ReferenceError`，它给你一个缺字段的对象。缺字段后面可能被补上。这是许多“循环依赖时导出是 `undefined`，多调用一次又有了”的来源。

## 缓存

评价失败的 ESM 会被缓存为失败。同一进程里再次 `import()` 同一 URL，得到的仍是那次拒绝，顶层不会重跑。测试需要新状态时，用新进程，或把状态放进函数而不是顶层。

## 自测

1. ESM 循环依赖在初始化期间读取对方的 `const` 会怎样？`ReferenceError`。
2. CJS 在同一时机看到什么？已经存在的 `exports` 对象，上面的字段可能还是默认值。
3. 怎样避免循环？把两边都要的值放到第三个模块。
