const db = require('./database');
const fs = require('fs');
const path = require('path');

function runMigrations() {
    const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    // Создаём таблицу для отслеживания применённых миграций
    db.exec(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    for (const file of files) {
        if (!file.endsWith('.sql')) continue;

        const exists = db.prepare('SELECT 1 FROM _migrations WHERE name = ?').get(file);
        if (exists) continue;

        console.log(`Applying migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        db.exec(sql);
        db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
    }

    console.log('Migrations completed');
}

module.exports = { runMigrations };
