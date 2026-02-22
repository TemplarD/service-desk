const db = require('../src/db/database');

function runSeeds() {
    // Проверяем, есть ли уже пользователи
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount > 0) {
        console.log('Users already exist, skipping seeds');
        return;
    }

    console.log('Seeding users...');
    
    // Создаём пользователей
    const users = [
        { name: 'dispatcher1', role: 'dispatcher' },
        { name: 'master1', role: 'master' },
        { name: 'master2', role: 'master' }
    ];

    const insertUser = db.prepare('INSERT INTO users (name, role) VALUES (?, ?)');
    for (const user of users) {
        insertUser.run(user.name, user.role);
    }

    console.log('Seeding requests...');
    
    // Создаём тестовые заявки
    const requests = [
        { clientName: 'Иван Петров', phone: '+7-900-111-22-33', address: 'ул. Ленина, 10, кв. 5', problemText: 'Не работает розетка на кухне', status: 'new' },
        { clientName: 'Мария Сидорова', phone: '+7-900-444-55-66', address: 'пр. Мира, 25, кв. 12', problemText: 'Протекает кран в ванной', status: 'new' },
        { clientName: 'Алексей Смирнов', phone: '+7-900-777-88-99', address: 'ул. Гагарина, 5, кв. 30', problemText: 'Сломался дверной замок', status: 'assigned', assignedTo: 2 },
        { clientName: 'Елена Козлова', phone: '+7-900-123-45-67', address: 'ул. Пушкина, 15, кв. 8', problemText: 'Не греет батарея', status: 'in_progress', assignedTo: 2 },
        { clientName: 'Дмитрий Волков', phone: '+7-900-987-65-43', address: 'ул. Советская, 30, кв. 45', problemText: 'Коротит проводка', status: 'done', assignedTo: 3 },
        { clientName: 'Ольга Морозова', phone: '+7-900-555-12-34', address: 'ул. Кирова, 8, кв. 22', problemText: 'Забилась раковина', status: 'canceled' }
    ];

    const insertRequest = db.prepare(`
        INSERT INTO requests (client_name, phone, address, problem_text, status, assigned_to)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const req of requests) {
        insertRequest.run(req.clientName, req.phone, req.address, req.problemText, req.status, req.assignedTo || null);
    }

    console.log('Seeds completed');
    console.log('Test users:');
    console.log('  - dispatcher1 (диспетчер)');
    console.log('  - master1 (мастер)');
    console.log('  - master2 (мастер)');
}

module.exports = { runSeeds };
