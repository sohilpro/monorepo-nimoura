# Stage 1: Build
FROM docker.arvancloud.ir/node:20-alpine AS builder
WORKDIR /app

# در صورت بیلد روی سرور ایران، رجیستری npm را روی میرور داخلی ست می‌کند
ARG NPM_REGISTRY=https://registry.npmjs.org
RUN npm config set registry ${NPM_REGISTRY}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM docker.arvancloud.ir/node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

ARG NPM_REGISTRY=https://registry.npmjs.org
RUN npm config set registry ${NPM_REGISTRY}

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

# ساخت پوشه آپلودها با دسترسی مناسب
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node
EXPOSE 4000

CMD ["node", "dist/main.js"]