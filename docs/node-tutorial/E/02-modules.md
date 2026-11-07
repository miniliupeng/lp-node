# E02 模块与包

示例：[A06](../../../examples/node-tutorial/A/06-modules.mjs)、[A07](../../../examples/node-tutorial/A/07-semver.mjs)、[C12](../../../examples/node-tutorial/C/12-circular-main.mjs)。

### Q1. `.mjs`、`.cjs` 和 `"type": "module"` 怎样决定模块种类？

- 难度：初级
- 考察点：解析规则
- 参考答案：`.mjs` 始终是 ESM，`.cjs` 始终是 CJS。`.js` 看最近的 `package.json`：`"type": "module"` 时是 ESM，否则是 CJS。本仓库根文件是 `"module"`，所以 `.js` 是 ESM。教程示例用扩展名写死种类。
- 易错点：说 Node 看文件内容里有没有 `import` 再决定。种类由扩展名和 `package.json` 决定，内容不对就直接语法错误。
- 追问：顶层 `await` 能写在 CJS 里吗？不能。

### Q2. ESM 里怎样得到当前文件目录？

- 难度：初级
- 考察点：`import.meta`
- 参考答案：22.23.4 有 `import.meta.dirname` 和 `import.meta.filename`。`import.meta.url` 是 `file:` URL。没有 `__dirname` 这个绑定。示例断言 `pathToFileURL(import.meta.filename).href` 等于 `import.meta.url`。
- 易错点：在 ESM 里写 `__dirname`，运行时 `ReferenceError`。
- 追问：相对 `fs.readFile('./a.txt')` 相对谁？相对 `process.cwd()`，不是相对模块文件。

### Q3. Node 22 能 `require()` ESM 吗？

- 难度：中级
- 考察点：`require_module`
- 参考答案：22.23.4 上 `process.features.require_module === true`。示例 `require('./06-local.mjs')` 得到模块命名空间，`mul(2, 6)` 为 12。这是同步加载。模块若含顶层 `await`，同步 `require` 不能等待它。那种模块用动态 `import()`。
- 易错点：说 ESM 永远不能被 `require`。要看版本和模块里有没有顶层 await。
- 追问：`createRequire` 做什么？在 ESM 里按给定 URL 的位置做 CJS `require`，用来加载 `.cjs`。

### Q4. ESM 循环依赖和 CJS 循环依赖有何不同？

- 难度：高级
- 考察点：活绑定与半成品 exports
- 参考答案：ESM 导出是活绑定。初始化期间去读对方尚未初始化的 `const`，得到 `ReferenceError`（`12-tdz-*.mjs`）。把读取放进函数，等两边评价完再调用，能读到最终值（`fromB()` 得到 `module-a`）。CJS 导出的是对象。循环中途 `require` 到的是已存在但还没写完的 `exports`。示例里 b 初始化时看到 `a.done === false`，a 继续执行时看到 `b.done === true`。
- 易错点：说循环依赖一定会抛错，或者说两边行为一样。
- 追问：怎样消除循环？把共享常量挪到第三个模块。

### Q5. `^1.2.3` 允许哪些版本？

- 难度：初级
- 考察点：semver
- 参考答案：在 major ≥ 1 时，允许 ≥1.2.3 且 <2.0.0。`1.9.0` 可以，`2.0.0` 和 `1.2.2` 不行。`~1.2.3` 允许 ≥1.2.3 且 <1.3.0。示例把 `^0.2.3` 直接抛错，因为 npm 对 0.x 的插入符只放行补丁，不能套用这句口诀。
- 易错点：背“插入符就是次版本随便升”，忘了 0.x。
- 追问：锁文件做什么？把范围固定成一次安装的具体版本和完整性校验。

### Q6. 模块会被执行几次？

- 难度：中级
- 考察点：缓存
- 参考答案：同一进程里，同一个 ESM URL 或同一个 CJS 解析路径只评价一次。再次导入得到同一份导出。评价失败的 ESM 会把失败缓存下来，再次 `import()` 仍是那次拒绝。测试要隔离顶层副作用时，用新进程。
- 易错点：说 `require.cache` 对 ESM 同样公开可删。ESM 没有对等的公开缓存表。
- 追问：动态 `import()` 和静态 `import` 的差别？动态返回 Promise，路径可以在运行时计算；静态在加载时解析，编辑器能看见依赖。

### Q7. `exports` 字段解决什么问题？

- 难度：中级
- 考察点：封装
- 参考答案：声明包的公共入口，可以给 `import` 和 `require` 不同文件。未列出的深路径不能从包外引用。它比只写一个 `main` 更明确。
- 易错点：说 `main` 会在有 `exports` 时仍然暴露所有文件。
- 追问：条件导出里 `import` 和 `require` 指什么？分别对应 ESM 加载和 CJS 加载。
