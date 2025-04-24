# Базовый образ для Node.js (этап сборки)
FROM node:18

# Устанавливаем рабочую директорию
WORKDIR /campify_front

# Копируем package.json и package-lock.json
COPY . .

# Устанавливаем зависимости
RUN npm install

# Сборка проекта
CMD ["npm", "start"]

# Открываем порт 80
EXPOSE 3000