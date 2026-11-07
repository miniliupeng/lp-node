# A07 包、语义化版本、锁文件

对应示例：[`examples/node-tutorial/A/07-semver.mjs`](../../../examples/node-tutorial/A/07-semver.mjs)。示例只实现 major ≥ 1 时的 `^` 和 `~`，用来把规则跑通。它不是 npm 的完整 semver 实现，`^0.2.3` 会直接抛错，提醒你 0.x 的插入符规则不同。

## package.json 里先看懂的字段

| 字段 | 作用 |
| --- | --- |
| `name` / `version` | 包的身份。私有应用也建议写上，方便日志和发布物识别 |
| `private: true` | 防止被误发布到注册表。本仓库就是这样 |
| `type` | `"module"` 时，该目录下的 `.js` 按 ESM 解析 |
| `engines` | 声明运行时。本仓库是 `"node": ">=22.0.0"`。npm/pnpm 是否强制执行取决于配置 |
| `scripts` | `pnpm run` / `npm run` 执行的命令 |
| `dependencies` | 运行应用需要的包 |
| `devDependencies` | 开发、测试、类型检查需要的包。生产安装可以选择不装 |
| `exports` | 对外暴露哪些入口。比旧的 `main` 更精确，可以按 `import` 和 `require` 给不同文件 |

`exports` 示例形状：

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

有了 `exports` 之后，包外的代码不能再随意深路径引用未导出的文件。这是封装边界。

## 语义化版本

`MAJOR.MINOR.PATCH`：

- PATCH：修复，调用方不需要改代码
- MINOR：向后兼容的新能力
- MAJOR：有不兼容的改动

范围（只讨论 major ≥ 1，与示例一致）：

- `1.2.3`：恰好这个版本
- `~1.2.3`：≥1.2.3 且 <1.3.0，也就是允许更高的补丁
- `^1.2.3`：≥1.2.3 且 <2.0.0，允许更高的次版本和补丁

示例断言：`^1.2.3` 接受 `1.9.0`，拒绝 `2.0.0` 和 `1.2.2`；`~1.2.3` 接受 `1.2.9`，拒绝 `1.3.0`。

0.x 在 npm 的插入符规则里更严格：`^0.2.3` 只允许补丁升级。升级 0.x 依赖时要读该包的更新说明，不要套用上面的 major ≥ 1 口诀。

## 锁文件

`package.json` 里的范围在下一次安装时可能解出新的补丁。锁文件（npm 的 `package-lock.json`，pnpm 的 `pnpm-lock.yaml`）记下这一次实际安装的版本和完整性校验。

应用仓库提交锁文件，这样同事和 CI 安装到同一棵依赖树。库在发布时由使用方生成自己的锁文件；库作者仍然要提交锁文件来固定自己的 CI。

本仓库使用 pnpm。pnpm 把包内容放在内容寻址的存储里，项目 `node_modules` 通过链接指向它。依赖不能悄悄引用未声明的包（幽灵依赖更难发生）。教程示例本身不 import 这些依赖。

## 安装与脚本

```bash
pnpm install
pnpm exec tsc --noEmit
```

`pnpm exec` 使用本仓库安装的工具。全局随意安装的 `tsc` 可能是另一个主版本。

不要把 `node_modules` 提交进 git。本仓库 `.gitignore` 已经忽略它。

## 自测

1. `^1.4.0` 允许 `1.9.2` 吗？允许。允许 `2.0.0` 吗？不允许。
2. 锁文件解决什么问题？把“范围”变成“这一次安装的具体版本”。
3. `"type": "module"` 影响哪些文件？该 `package.json` 覆盖范围内的 `.js`。`.mjs` 始终是 ESM，`.cjs` 始终是 CJS。
