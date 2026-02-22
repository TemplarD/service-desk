const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Статика
app.use(express.static(path.join(__dirname, '..', 'public')));

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Страницы
app.get('/dispatcher', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'dispatcher.html'));
});

app.get('/master', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'master.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Внутренняя ошибка сервера' });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
