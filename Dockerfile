# syntax=docker.io/docker/dockerfile:1

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Устанавливаем corepack для pnpm (если нужно)
RUN corepack enable

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Устанавливаем зависимости, включая типы для TypeScript
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm install react-redux @reduxjs/toolkit @types/react-redux; \
    elif [ -f pnpm-lock.yaml ]; then pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Устанавливаем TypeScript глобально для проверки типов
RUN npm install -g typescript

# Проверяем типы перед сборкой
RUN npx tsc --noEmit

RUN \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Проверяем тип сборки (standalone или нет)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]