import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
try {
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);
  const insert = db.prepare('INSERT INTO users (name) VALUES (?)');
  const select = db.prepare('SELECT id, name FROM users WHERE name = ?');
  db.exec('BEGIN');
  insert.run('ada');
  insert.run('lin');
  db.exec('COMMIT');

  const injected = "ada' OR '1'='1";
  assert.equal(select.get(injected), undefined);
  const ada = select.get('ada');
  assert.equal(Object.getPrototypeOf(ada), null);
  assert.equal(ada.id, 1);
  assert.equal(ada.name, 'ada');
  assert.equal(select.all('%').length, 0);

  db.function('double', (value) => Number(value) * 2);
  const doubled = db.prepare('SELECT double(21) AS n').get();
  assert.equal(doubled.n, 42);
} finally {
  db.close();
}

console.log('PASS B/13-sqlite');
