# Шаг 1: Сборка приложения
FROM node:20-alpine AS builder

# Устанавливаем зависимости (поддержка yarn, npm, pnpm)
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Копируем исходный код и env-файлы
COPY . .

# Собираем приложение (с standalone)
RUN npm run build

# Шаг 2: Продакшен образ
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Копируем только необходимые файлы из builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Для кастомного сервера (если используется)
# COPY --from=builder /app/server.js ./

# Оптимизация образа
RUN apk add --no-cache curl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:3000 || exit 1

CMD ["node", "server.js"]