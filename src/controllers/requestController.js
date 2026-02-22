const requestService = require('../services/requestService');

function getAllRequests(req, res) {
    const { status } = req.query;
    
    try {
        let requests;
        if (status) {
            requests = requestService.getRequestsByStatus(status);
        } else {
            requests = requestService.getAllRequests();
        }
        res.json(requests);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}

function getRequestById(req, res) {
    try {
        const request = requestService.getRequestById(req.params.id);
        res.json(request);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}

function createRequest(req, res) {
    try {
        const request = requestService.createRequest(req.body);
        res.status(201).json(request);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}

function assignMaster(req, res) {
    try {
        const { masterId } = req.body;
        const request = requestService.assignToMaster(req.params.id, masterId, req.user.id);
        res.json(request);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}

function cancelRequest(req, res) {
    try {
        const request = requestService.cancelRequest(req.params.id, req.user.id);
        res.json(request);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}

function takeInWork(req, res) {
    try {
        const { version } = req.body;
        if (version === undefined) {
            return res.status(400).json({ error: 'Требуется поле version для защиты от гонок' });
        }
        const request = requestService.takeInWork(req.params.id, req.user.id, version);
        res.json(request);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}

function completeRequest(req, res) {
    try {
        const request = requestService.completeRequest(req.params.id, req.user.id);
        res.json(request);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}

function getRequestEvents(req, res) {
    try {
        const events = requestService.getRequestEvents(req.params.id);
        res.json(events);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}

module.exports = {
    getAllRequests,
    getRequestById,
    createRequest,
    assignMaster,
    cancelRequest,
    takeInWork,
    completeRequest,
    getRequestEvents
};
