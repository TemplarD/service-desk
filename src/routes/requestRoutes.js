const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// POST /api/requests - создать заявку (публичный, без авторизации)
router.post('/', requestController.createRequest);

// Все остальные маршруты требуют авторизации
router.use(authMiddleware);

// GET /api/requests - получить все заявки (диспетчер) или свои (мастер)
router.get('/', requestController.getAllRequests);

// GET /api/requests/:id - получить заявку по ID
router.get('/:id', requestController.getRequestById);

// POST /api/requests/:id/assign - назначить мастера (диспетчер)
router.post('/:id/assign', requireRole('dispatcher'), requestController.assignMaster);

// POST /api/requests/:id/cancel - отменить заявку (диспетчер)
router.post('/:id/cancel', requireRole('dispatcher'), requestController.cancelRequest);

// POST /api/requests/:id/take - взять в работу (мастер)
router.post('/:id/take', requireRole('master'), requestController.takeInWork);

// POST /api/requests/:id/complete - завершить заявку (мастер)
router.post('/:id/complete', requireRole('master'), requestController.completeRequest);

// GET /api/requests/:id/events - история изменений
router.get('/:id/events', requestController.getRequestEvents);

module.exports = router;
