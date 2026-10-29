# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# کش بهتر
COPY package.json package-lock.json* ./
RUN npm ci

# سورس
COPY . .

ENV NODE_ENV=production
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app

# گاهی لازم می‌شود
RUN apk add --no-cache libc6-compat

# فقط خروجی Nitro
COPY --from=builder /app/.output ./.output

# اگر Nuxt 4 در .output/server/package.json دیپندنسی runtime ساخت:
# WORKDIR /app/.output/server
# RUN [ -f package.json ] && npm ci --omit=dev || true
# WORKDIR /app

RUN chmod -R 755 .output/public

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
