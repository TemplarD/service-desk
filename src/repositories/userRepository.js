const db = require('../db/database');

class UserRepository {
    findAll() {
        return db.prepare('SELECT id, name, role FROM users ORDER BY name').all();
    }

    findById(id) {
        return db.prepare('SELECT id, name, role FROM users WHERE id = ?').get(id);
    }

    findByName(name) {
        return db.prepare('SELECT id, name, role FROM users WHERE name = ?').get(name);
    }

    findByRole(role) {
        return db.prepare('SELECT id, name, role FROM users WHERE role = ?').all(role);
    }
}

module.exports = new UserRepository();
