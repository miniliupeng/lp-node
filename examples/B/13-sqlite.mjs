import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
try {
  db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)');
  const insert = db.prepare('INSERT INTO users (name) VALUES (?)');
  const select = db.prepare('SELECT id, name FROM users WHERE name = ?');
  db.exec('BEGIN');
  insert.run('ada');
  insert.run('lin');
  db.exec('COMMIT');
  assert.equal(select.get("ada' OR '1'='1"), undefined);
  const ada = select.get('ada');
  assert.equal(Object.getPrototypeOf(ada), null);
  assert.equal(ada.id, 1);
  assert.equal(ada.name, 'ada');
  db.function('double', (value) => Number(value) * 2);
  assert.equal(db.prepare('SELECT double(21) AS n').get().n, 42);
} finally {
  db.close();
}

console.log('PASS B/13-sqlite');
