# B13 node:sqlite

对应示例：[`examples/node-tutorial/B/13-sqlite.mjs`](../../../examples/node-tutorial/B/13-sqlite.mjs)

## 状态

22.23.4 可以 `import { DatabaseSync } from 'node:sqlite'`。导入时进程打印：

```text
ExperimentalWarning: SQLite is an experimental feature and might change at any time
```

API 以后还可能改。教程用它学习 SQL 访问的形状：预编译、参数、事务。生产如果要稳定支持窗口，确认你锁定的 Node 版本是否仍把该模块标成实验，或使用维护中的驱动。

`DatabaseSync` 的方法包括 `exec`、`prepare`、`close`、`function`。语句上有 `run`、`get`、`all`、`iterate`。

## 预编译

示例建表 `users(id, name)`，准备两条语句：

```javascript
const insert = db.prepare('INSERT INTO users (name) VALUES (?)');
const select = db.prepare('SELECT id, name FROM users WHERE name = ?');
```

`?` 是参数位。值用 `run` / `get` 传入，不会被拼进 SQL 文本。

示例传入 `ada' OR '1'='1`。如果这是字符串拼接，它会改变 SQL 的结构；作为参数，它只是一个要查找的名字，`get` 返回 `undefined`。真正的 `ada` 能查到 `id === 1`、`name === 'ada'`。

`get` 返回的行是原型为 `null` 的对象。示例断言了 `Object.getPrototypeOf(row) === null`。这种对象上没有 `Object.prototype` 的方法。把它放进只信字段的代码路径，不要假设有 `toString` 之外的继承行为。`assert.deepEqual` 对原型敏感，所以示例逐字段比较。

`name = '%'` 也只匹配字面量百分号，因为语句用的是 `=`，不是 `LIKE`。

## 事务

```javascript
db.exec('BEGIN');
insert.run('ada');
insert.run('lin');
db.exec('COMMIT');
```

两行要么都在，要么你在失败时 `ROLLBACK`。示例的路径会提交。一个请求里的多次写入，用事务包住，避免留下半套数据。

`exec` 执行不带参数的 SQL。任何来自请求的文本都不要拼进 `exec`。

## 自定义函数

`db.function('double', (value) => Number(value) * 2)` 之后，`SELECT double(21)` 得到 42。这是演示 SQLite 与 JavaScript 的边界。不要把不可信 SQL 放进来调用你的函数。

## 自测

1. 为什么用 `?` 而不是模板字符串？参数不会被当成 SQL 语法。
2. 行对象和普通对象有什么可见差别？原型是 `null`。
3. 这个模块在 22.23.4 上是稳定 API 吗？不是，运行时仍给出实验警告。
