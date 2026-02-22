const db = require('../db/database');

class RequestRepository {
    findAll() {
        return db.prepare(`
            SELECT r.*, u.name as assigned_to_name
            FROM requests r
            LEFT JOIN users u ON r.assigned_to = u.id
            ORDER BY r.created_at DESC
        `).all();
    }

    findById(id) {
        return db.prepare(`
            SELECT r.*, u.name as assigned_to_name
            FROM requests r
            LEFT JOIN users u ON r.assigned_to = u.id
            WHERE r.id = ?
        `).get(id);
    }

    findByStatus(status) {
        return db.prepare(`
            SELECT r.*, u.name as assigned_to_name
            FROM requests r
            LEFT JOIN users u ON r.assigned_to = u.id
            WHERE r.status = ?
            ORDER BY r.created_at DESC
        `).all(status);
    }

    findByAssignedTo(masterId) {
        return db.prepare(`
            SELECT r.*, u.name as assigned_to_name
            FROM requests r
            LEFT JOIN users u ON r.assigned_to = u.id
            WHERE r.assigned_to = ?
            ORDER BY r.created_at DESC
        `).all(masterId);
    }

    create(data) {
        const stmt = db.prepare(`
            INSERT INTO requests (client_name, phone, address, problem_text, status)
            VALUES (?, ?, ?, ?, 'new')
        `);
        const result = stmt.run(data.clientName, data.phone, data.address, data.problemText);
        return this.findById(result.lastInsertRowid);
    }

    updateStatus(id, newStatus, assignedTo = null) {
        const stmt = db.prepare(`
            UPDATE requests 
            SET status = ?, assigned_to = COALESCE(?, assigned_to), version = version + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(newStatus, assignedTo, id);
        return this.findById(id);
    }

    // Обновление с проверкой версии (для защиты от гонок)
    updateStatusWithVersion(id, newStatus, assignedTo, expectedVersion) {
        const stmt = db.prepare(`
            UPDATE requests 
            SET status = ?, assigned_to = COALESCE(?, assigned_to), version = version + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND version = ?
        `);
        const result = stmt.run(newStatus, assignedTo, id, expectedVersion);
        if (result.changes === 0) {
            return null; // Конфликт: версия не совпала
        }
        return this.findById(id);
    }

    addEvent(requestId, eventType, oldStatus, newStatus, userId) {
        const stmt = db.prepare(`
            INSERT INTO request_events (request_id, event_type, old_status, new_status, user_id)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(requestId, eventType, oldStatus, newStatus, userId);
    }

    getEvents(requestId) {
        return db.prepare(`
            SELECT e.*, u.name as user_name
            FROM request_events e
            LEFT JOIN users u ON e.user_id = u.id
            WHERE e.request_id = ?
            ORDER BY e.created_at DESC
        `).all(requestId);
    }
}

module.exports = new RequestRepository();
