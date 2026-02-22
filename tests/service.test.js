/**
 * Тесты для API заявок
 * Запускаются: npm test
 */

describe('Request Service', () => {
    
    // Тест 1: Валидация создания заявки
    test('должен отклонить заявку без обязательных полей', () => {
        const validateRequest = (data) => {
            const required = ['clientName', 'phone', 'address', 'problemText'];
            for (const field of required) {
                if (!data[field] || data[field].trim() === '') {
                    throw new Error(`Поле ${field} обязательно`);
                }
            }
            return true;
        };
        
        // Пустые данные
        expect(() => validateRequest({})).toThrow('Поле clientName обязательно');
        
        // Отсутствует телефон
        expect(() => validateRequest({ clientName: 'Тест' })).toThrow('Поле phone обязательно');
        
        // Валидные данные
        expect(() => validateRequest({
            clientName: 'Тест',
            phone: '+7-000-000-00-00',
            address: 'Адрес',
            problemText: 'Проблема'
        })).not.toThrow();
    });
    
    // Тест 2: Проверка логики optimistic locking
    test('должен обнаружить конфликт версий', () => {
        // Симуляция проверки версии
        const updateWithVersion = (currentVersion, expectedVersion, newData) => {
            if (currentVersion !== expectedVersion) {
                return { success: false, error: 'Конфликт версии' };
            }
            return { success: true, newVersion: currentVersion + 1, data: newData };
        };
        
        // Успешное обновление
        const result1 = updateWithVersion(5, 5, { status: 'in_progress' });
        expect(result1.success).toBe(true);
        expect(result1.newVersion).toBe(6);
        
        // Конфликт (устаревшая версия)
        const result2 = updateWithVersion(6, 5, { status: 'in_progress' });
        expect(result2.success).toBe(false);
        expect(result2.error).toBe('Конфликт версии');
        
        // Конфликт (версия обновилась другим запросом)
        const result3 = updateWithVersion(10, 5, { status: 'done' });
        expect(result3.success).toBe(false);
    });
    
    // Тест 3: Проверка статусов заявки
    test('должен проверять допустимые переходы статусов', () => {
        const validTransitions = {
            'new': ['assigned', 'canceled'],
            'assigned': ['in_progress', 'canceled'],
            'in_progress': ['done', 'canceled'],
            'done': [],
            'canceled': []
        };
        
        const canTransition = (from, to) => {
            return validTransitions[from]?.includes(to) || false;
        };
        
        // Валидные переходы
        expect(canTransition('new', 'assigned')).toBe(true);
        expect(canTransition('assigned', 'in_progress')).toBe(true);
        expect(canTransition('in_progress', 'done')).toBe(true);
        expect(canTransition('new', 'canceled')).toBe(true);
        
        // Невалидные переходы
        expect(canTransition('new', 'done')).toBe(false);
        expect(canTransition('done', 'in_progress')).toBe(false);
        expect(canTransition('canceled', 'new')).toBe(false);
    });
});
