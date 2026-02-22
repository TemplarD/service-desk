FROM node:20-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходники
COPY . .

# Создаём директорию для БД
RUN mkdir -p /app/db

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"]
