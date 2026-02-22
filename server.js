const { runMigrations } = require('./src/db/migrate');
const { runSeeds } = require('./seeds/run_seeds');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// Инициализация БД
runMigrations();
runSeeds();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Test users: dispatcher1, master1, master2');
});
