# 01-fs-and-path-basics: 现代文件与路径操作最佳实践

在服务端操作文件，必须考虑**跨平台路径兼容性**与**并发读写的原子安全性**。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`node:path`**：提供跨平台（Windows `\` 与 POSIX `/`）的路径处理实用工具。
  - `path.join(...)`：纯粹的路径片段字符串拼接与规范化。
  - `path.resolve(...)`：从当前工作目录（CWD）开始逐层解析，最终**返回绝对路径**。
- **`node:fs/promises`**：Node.js 官方内置的基于 Promise 的非阻塞异步文件系统模块。
- **原子写入 (Atomic File Write)**：先将数据写入同一个分区下的临时文件（`file.json.tmp`），写入完全成功后，再调用操作系统的 `rename()` 系统调用进行重命名覆盖。

### 2. 为什么需要搞透它？
- **防文件损坏与半写状态 (Torn Writes)**：如果直接使用 `writeFile` 写大文件，在写入完成前服务器突然宕机或被强杀，文件就会变成只有一半内容的损坏坏文件！而在 POSIX 文件系统中，`rename` 是系统级**原子操作**，要么旧文件完好无损，要么新文件瞬间替换，绝不会出现中间损坏态。
- **绝对禁止 `readFileSync`**：同步读取大文件会把 Node.js 的单线程彻底阻塞几百毫秒甚至数秒，期间没有任何网络请求能得到响应！

### 3. 日常工作中怎么用？
- 操作相对路径时务必结合 `import.meta.dirname` 构建绝对路径；
- 目录创建时开启 `{ recursive: true }`，写入重要配置文件使用“写入临时文件+重命名”原子模式。

---

## 🔬 核心代码切片

```typescript
import { writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";

// 原子写入：绝不直接覆写目标文件
const target = resolve(import.meta.dirname, "data.json");
const temp = `${target}.tmp.${Date.now()}`;

await writeFile(temp, JSON.stringify({ version: "2.0" }), "utf-8");
await rename(temp, target); // 瞬间原子替换
```

---

## 🖥️ 控制台预期输出快照

```text
=== 现代文件与路径操作最佳实践 ===
1. 路径解析差异比对:
   - path.join: "a/b/c.json" (相对路径片段规范化)
   - path.resolve: "/Users/.../c.json" (绝对路径定位)
2. 递归目录与文件原子写入实战:
   - 步骤 1: 确保多级目录创建成功: ./scratch/logs/2026
   - 步骤 2: 写入安全临时文件: log.tmp.177...
   - 步骤 3: 触发原子重命名覆盖 (rename) -> 目标已安全落地
3. 清理演示临时文件完毕 (保持工作区整洁)
=================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 03-fs-buffer-and-streams/01-fs-and-path-basics/main.ts
```
