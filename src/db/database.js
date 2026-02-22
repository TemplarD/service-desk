const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'repair.db');
const db = new Database(dbPath);

// Включаем WAL режим для лучшей конкурентности
db.pragma('journal_mode = WAL');

module.exports = db;
