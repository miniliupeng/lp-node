# 02-sqlite-embedded-database: 原生轻量嵌入式数据库操作

从 Node.js 22.5.0 开始，官方做出了一个里程碑式的改动：**原生内置了 `node:sqlite` 模块**。这意味着开发者无需安装任何需要本地 C++ 编译的第三方驱动（如 `better-sqlite3`），即可直接使用轻量、高效的嵌入式关系型数据库。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`node:sqlite.DatabaseSync`**：Node.js 原生提供的同步 SQLite 数据库连接类。支持磁盘文件持久化或纯内存模式（`:memory:`）。
- **预编译语句 (Prepared Statements)**：通过 `db.prepare(sql)` 预先让数据库编译 SQL 抽象语法树（AST），后续多次执行只需传递不同参数，性能极高。
- **参数化查询 (Parameterized Queries)**：使用占位符（如 `?` 或 `:name`）分离 SQL 语法逻辑与用户数据。

### 2. 为什么需要搞透它？
- **彻底消灭 SQL 注入 (SQL Injection)**：很多新手喜欢用字符串拼接 SQL：`"SELECT * FROM users WHERE name = '" + name + "'"`。如果用户输入 `' OR '1'='1`，整张表的数据就被全部拖库窃取！参数化查询由数据库引擎将参数严格视为字面量值，绝不可能被当作 SQL 指令执行。
- **极简本地开发与测试**：单元测试时，直接在内存数据库 `:memory:` 里跑建表和测试，毫秒级执行且单测跑完内存自动释放，零残留。

### 3. 日常工作中怎么用？
- 本地微服务缓存、边缘计算持久化、单元测试 Mock 数据库、轻量离线桌面应用（Electron）。

---

## 🔬 核心代码切片

```typescript
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(":memory:");

// 1. 建表
db.exec("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT)");

// 2. 预编译与参数化写入 (防 SQL 注入)
const insertStmt = db.prepare("INSERT INTO users (username) VALUES (?)");
insertStmt.run("Alice");

// 3. 查询
const queryStmt = db.prepare("SELECT * FROM users WHERE id = ?");
const user = queryStmt.get(1);
```

---

## 🖥️ 控制台预期输出快照

```text
=== Node.js 原生 node:sqlite 数据库实战 ===
1. 内存数据库初始化成功 (:memory: 毫秒级就绪)
2. 执行 DDL 建表: users (id, name, score)
3. 预编译语句 (prepare) 批量参数化写入:
   ✔ 成功插入用户: "Alex" (得分: 98)
   ✔ 成功插入用户: "Bob" (得分: 85)
4. 参数化安全查询验证:
   ✔ 查询到目标记录: {"id":1,"name":"Alex","score":98}
5. 验证防 SQL 注入能力:
   - 尝试注入特殊字符 "Alex' OR 1=1 --" 
   ✔ 数据库将其作为纯文本字面量安全查找 (未引发逻辑逃逸)
===========================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 06-data-layer-and-auth/02-sqlite-embedded-database/main.ts
```
