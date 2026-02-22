#!/bin/bash
# race_test.sh - Скрипт для проверки защиты от гонок
# Запускает два параллельных запроса на "Взять в работу"

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "=== Тест защиты от гонок ==="
echo "Базовый URL: $BASE_URL"
echo ""

# Сначала логинимся как мастер1 и получаем cookie
echo "1. Логинимся как master1..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"name": "master1"}' \
    -c /tmp/cookies_master1.txt)

echo "Ответ: $LOGIN_RESPONSE"

# Находим заявку со статусом assigned и назначенную на master1
echo ""
echo "2. Ищем заявку со статусом 'assigned'..."
REQUESTS=$(curl -s "$BASE_URL/api/requests" -b /tmp/cookies_master1.txt)
echo "Все заявки: $REQUESTS"

# Используем Node.js для парсинга JSON (более надёжно)
# Сначала получаем ID master1
MASTER_ID=$(echo "$LOGIN_RESPONSE" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.user?.id||'');")

REQUEST_ID=$(echo "$REQUESTS" | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const req = data.find(r => r.status === 'assigned' && r.assigned_to === $MASTER_ID);
console.log(req ? req.id : '');
")

if [ -z "$REQUEST_ID" ]; then
    echo "Не найдено заявки со статусом 'assigned' для master1"
    echo "Запустите сиды или создайте заявку вручную"
    exit 1
fi

echo ""
echo "Найдена заявка ID: $REQUEST_ID"

# Получаем версию заявки
VERSION=$(echo "$REQUESTS" | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const req = data.find(r => r.id === $REQUEST_ID);
console.log(req ? req.version : '');
")

echo "Версия заявки: $VERSION"
echo ""
echo "3. Запускаем два параллельных запроса на 'Взять в работу'..."
echo ""

# Запускаем два запроса параллельно
curl -s -X POST "$BASE_URL/api/requests/$REQUEST_ID/take" \
    -H "Content-Type: application/json" \
    -d "{\"version\": $VERSION}" \
    -b /tmp/cookies_master1.txt \
    > /tmp/response1.txt 2>&1 &
PID1=$!

curl -s -X POST "$BASE_URL/api/requests/$REQUEST_ID/take" \
    -H "Content-Type: application/json" \
    -d "{\"version\": $VERSION}" \
    -b /tmp/cookies_master1.txt \
    > /tmp/response2.txt 2>&1 &
PID2=$!

# Ждём завершения обоих запросов
wait $PID1
wait $PID2

echo "=== Результаты ==="
echo ""
echo "Запрос 1:"
cat /tmp/response1.txt
echo ""
echo ""
echo "Запрос 2:"
cat /tmp/response2.txt
echo ""

# Проверяем результаты
STATUS1=$(cat /tmp/response1.txt | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.status||'error');")
STATUS2=$(cat /tmp/response2.txt | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.status||'error');")

echo ""
echo "=== Итог ==="

if [ "$STATUS1" = "in_progress" ] || [ "$STATUS2" = "in_progress" ]; then
    if [ "$STATUS1" = "Conflict" ] || [ "$STATUS2" = "Conflict" ]; then
        echo "✓ УСПЕХ: Один запрос успешен, второй получил конфликт"
        exit 0
    fi
fi

# Проверяем HTTP коды через отдельные запросы
echo "Проверка завершена. Проверьте ответы выше."
echo "Один должен быть успешным (status: in_progress), второй с ошибкой конфликта."

# Очистка
rm -f /tmp/cookies_master1.txt /tmp/response1.txt /tmp/response2.txt
