const userRepository = require('../repositories/userRepository');

// Простая авторизация: выбор пользователя по имени
function login(req, res) {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Имя обязательно' });
    }

    const user = userRepository.findByName(name.trim());
    if (!user) {
        return res.status(401).json({ error: 'Пользователь не найден' });
    }

    // Устанавливаем cookie с userId
    res.cookie('userId', user.id, { 
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000, // 24 часа
        sameSite: 'lax'
    });

    res.json({ success: true, user });
}

function logout(req, res) {
    res.clearCookie('userId');
    res.json({ success: true });
}

function getCurrentUser(req, res) {
    const userId = req.cookies?.userId;
    
    if (!userId) {
        return res.json({ authenticated: false });
    }

    const user = userRepository.findById(parseInt(userId));
    if (!user) {
        res.clearCookie('userId');
        return res.json({ authenticated: false });
    }

    res.json({ authenticated: true, user });
}

function getUsers(req, res) {
    const users = userRepository.findAll();
    res.json(users);
}

function getMasters(req, res) {
    const masters = userRepository.findByRole('master');
    res.json(masters);
}

module.exports = { login, logout, getCurrentUser, getUsers, getMasters };
