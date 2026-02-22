const requestRepository = require('../repositories/requestRepository');
const userRepository = require('../repositories/userRepository');

class RequestService {
    getAllRequests() {
        return requestRepository.findAll();
    }

    getRequestById(id) {
        const request = requestRepository.findById(id);
        if (!request) {
            const error = new Error('Заявка не найдена');
            error.status = 404;
            throw error;
        }
        return request;
    }

    getRequestsByStatus(status) {
        return requestRepository.findByStatus(status);
    }

    getRequestsByMaster(masterId) {
        return requestRepository.findByAssignedTo(masterId);
    }

    createRequest(data) {
        // Валидация обязательных полей
        const required = ['clientName', 'phone', 'address', 'problemText'];
        for (const field of required) {
            if (!data[field] || data[field].trim() === '') {
                const error = new Error(`Поле ${field} обязательно`);
                error.status = 400;
                throw error;
            }
        }

        const request = requestRepository.create(data);
        requestRepository.addEvent(request.id, 'created', null, 'new', null);
        return request;
    }

    assignToMaster(requestId, masterId, dispatcherId) {
        const request = this.getRequestById(requestId);
        
        if (request.status !== 'new') {
            const error = new Error(`Нельзя назначить мастера: статус заявки "${request.status}"`);
            error.status = 400;
            throw error;
        }

        const master = userRepository.findById(masterId);
        if (!master || master.role !== 'master') {
            const error = new Error('Мастер не найден');
            error.status = 400;
            throw error;
        }

        const updated = requestRepository.updateStatus(requestId, 'assigned', masterId);
        requestRepository.addEvent(requestId, 'assigned', 'new', 'assigned', dispatcherId);
        return updated;
    }

    cancelRequest(requestId, dispatcherId) {
        const request = this.getRequestById(requestId);
        
        if (['done', 'canceled'].includes(request.status)) {
            const error = new Error(`Нельзя отменить заявку со статусом "${request.status}"`);
            error.status = 400;
            throw error;
        }

        const updated = requestRepository.updateStatus(requestId, 'canceled');
        requestRepository.addEvent(requestId, 'canceled', request.status, 'canceled', dispatcherId);
        return updated;
    }

    takeInWork(requestId, masterId, version) {
        const request = this.getRequestById(requestId);
        
        if (request.status !== 'assigned') {
            const error = new Error(`Нельзя взять в работу: статус заявки "${request.status}"`);
            error.status = 400;
            throw error;
        }

        if (request.assigned_to !== masterId) {
            const error = new Error('Заявка назначена другому мастеру');
            error.status = 403;
            throw error;
        }

        // Защита от гонок: проверяем версию
        const updated = requestRepository.updateStatusWithVersion(requestId, 'in_progress', masterId, version);
        if (!updated) {
            const error = new Error('Конфликт: заявка уже была изменена другим запросом');
            error.status = 409;
            throw error;
        }

        requestRepository.addEvent(requestId, 'take_in_work', 'assigned', 'in_progress', masterId);
        return updated;
    }

    completeRequest(requestId, masterId) {
        const request = this.getRequestById(requestId);
        
        if (request.status !== 'in_progress') {
            const error = new Error(`Нельзя завершить: статус заявки "${request.status}"`);
            error.status = 400;
            throw error;
        }

        if (request.assigned_to !== masterId) {
            const error = new Error('Заявка назначена другому мастеру');
            error.status = 403;
            throw error;
        }

        const updated = requestRepository.updateStatus(requestId, 'done');
        requestRepository.addEvent(requestId, 'completed', 'in_progress', 'done', masterId);
        return updated;
    }

    getRequestEvents(requestId) {
        return requestRepository.getEvents(requestId);
    }
}

module.exports = new RequestService();
