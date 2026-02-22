const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Публичные маршруты
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.get('/users', authController.getUsers);
router.get('/masters', authController.getMasters);

module.exports = router;
