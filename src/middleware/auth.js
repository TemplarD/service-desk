const userRepository = require('../repositories/userRepository');

function authMiddleware(req, res, next) {
    const userId = req.cookies?.userId;
    
    if (!userId) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const user = userRepository.findById(parseInt(userId));
    if (!user) {
        res.clearCookie('userId');
        return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = user;
    next();
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }
        
        next();
    };
}

module.exports = { authMiddleware, requireRole };
