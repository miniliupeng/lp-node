/**
 * 02-sqlite-embedded-database
 * 演示 Node.js 22.5+ 原生 node:sqlite 模块：内存建表、预编译参数化写入与防注入查询
 */

import { DatabaseSync } from 'node:sqlite';

interface UserRecord {
  id: number;
  name: string;
  score: number;
}

function run(): void {
  console.log('=== Node.js 原生 node:sqlite 数据库实战 ===');

  // 1. 创建纯内存轻量数据库 (适合单测与缓存，零磁盘残留)
  const db = new DatabaseSync(':memory:');
  console.log('1. 内存数据库已就绪 (:memory:)');

  // 2. 执行 DDL 建表
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      score INTEGER NOT NULL
    )
  `);
  console.log('2. 成功创建数据表: users (id, name, score)');

  // 3. 预编译语句 (Prepared Statement) 与参数化写入 (天然防 SQL 注入)
  const insertStmt = db.prepare('INSERT INTO users (name, score) VALUES (?, ?)');
  insertStmt.run('Alex', 98);
  insertStmt.run('Bob', 85);
  console.log('3. 预编译安全写入两条用户数据: Alex(98), Bob(85)');

  // 4. 参数化单条精准查询
  const querySingle = db.prepare('SELECT id, name, score FROM users WHERE name = ?');
  const foundUser = querySingle.get('Alex') as UserRecord | undefined;
  console.log(`4. 参数化精准查询结果: ${JSON.stringify(foundUser)}`);

  // 5. 验证防 SQL 注入能力
  console.log('5. 模拟黑客 SQL 注入攻击测试:');
  const maliciousInput = "' OR 1=1 --";
  // 注入攻击被参数化严格当作纯字面量字符串比对，绝不逃逸
  const attackResult = querySingle.get(maliciousInput);
  console.log(
    `   - 针对输入 "${maliciousInput}" 的查询结果: ${attackResult ?? 'null (未匹配到任何用户)'}`
  );
  console.log('   ✔ 防御验证通过: 参数化查询从底层消除了 SQL 拼接命令逃逸隐患');

  // 6. 关闭数据库连接
  db.close();
  console.log('===========================================');
}

run();
