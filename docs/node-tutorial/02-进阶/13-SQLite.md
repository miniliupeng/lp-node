# SQLite

示例：`examples/B/13-sqlite.mjs`

`node:sqlite` 在 22.23.4 可用，导入时打印 ExperimentalWarning。示例使用 `DatabaseSync`：

```javascript
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
const insert = db.prepare('INSERT INTO users (name) VALUES (?)');
insert.run('ada');
```

查询参数用 `?` 占位。示例把字符串 `ada' OR '1'='1` 当参数传入，匹配行数是 0。把用户输入拼进 SQL 文本才会改变语句结构。

`stmt.get()` 返回的行是原型为 `null` 的对象。`assert.deepEqual` 拿它和普通对象比会失败。示例检查 `Object.getPrototypeOf(row) === null`，再比较字段。

`db.function('double', (n) => n * 2)` 注册 SQL 函数。`BEGIN` / `COMMIT` 包住多条写入。中途抛错就 `ROLLBACK`。示例在事务里插入并读回。

`close()` 放在 `finally`。这套 API 是同步的，大查询会占住主线程。请求路径上的大库要另选驱动或放到 Worker。


## 是什么

`node:sqlite` 的 `DatabaseSync` 在 22.23.4 能建表、预编译和事务，导入时仍打印 ExperimentalWarning。这是同步 API。大查询占住主线程。不要把它写成永久的生产契约。请求路径上的大库用异步驱动，或把同步调用放进 Worker，并接受序列化成本。

## 注入和行对象

查询参数用 `?`。示例把 `ada' OR '1'='1` 当参数传入，匹配行数是 0。拼进 SQL 文本才会改变语句结构。

`stmt.get()` 返回的行是原型为 `null` 的对象。`deepEqual` 拿它和普通对象比会失败。比较字段，或断言 `Object.getPrototypeOf(row) === null`。不要把这种行递归合并进别的对象。

`db.function` 可以注册 SQL 函数。示例的 `double(21)` 得到 42。多条写入放在 `BEGIN` / `COMMIT`。失败就 `ROLLBACK`。`close()` 放在 `finally`。

`:memory:` 数据库随连接关闭消失。文件数据库才有持久化，并且仍然要考虑崩溃时的日志模式。教学示例用内存库，避免在仓库里留下数据库文件。

## 本章问答

### 1. 参数化查询为什么能挡住那段 OR 字符串？

**考点：** 语句结构和值。

**回答：** 占位符的值不会变成 SQL 语法。数据库看到的语句仍是 `WHERE name = ?`，问号的位置是一个字符串。只有拼接才会把引号变成语法。自己转义引号依赖方言，不要做。

### 2. 为什么 deepEqual 对 sqlite 行失败？

**考点：** 原型。

**回答：** 行对象的原型是 `null`，不是 `Object.prototype`。结构断言会把原型算进去。取出 `id` 和 `name` 再比，或显式断言原型是 `null`。

### 3. 这个模块能当生产数据库吗？

**考点：** 实验标记和同步。

**回答：** 22.23.4 上它仍是实验特性，API 可能变，而且调用是同步的。教学和嵌入式小工具可以用来理解 SQL。对外服务的主库选择有异步驱动、有备份和迁移的数据库，并继续使用占位符。

## 事故复盘

把用户输入拼进 `WHERE name = '${name}'`。`name` 为 `ada' OR '1'='1` 时返回了全部行。占位符下匹配数是 0。示例断言了这一点。

`deepEqual` 比较查询结果和普通对象，测试失败，因为行的原型是 `null`。比较字段。

在每个 HTTP 请求里同步查询一个大表。事件循环延迟上涨，健康检查失败。`DatabaseSync` 仍是实验 API，热路径不要押在它上面。
