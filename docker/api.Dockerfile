# ── Base ──────────────────────────────────────
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ── Dependencies ──────────────────────────────
FROM base AS deps
COPY package*.json turbo.json ./
COPY packages/ ./packages/
COPY apps/api/package*.json ./apps/api/

RUN npm install

# ── Builder ───────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json turbo.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN npx turbo run build --filter=@nimoura/api

# ── Runner ────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4000

# Security: non-root user
USER node

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/packages/ ./packages/
COPY --from=builder --chown=node:node /app/apps/api/package*.json ./apps/api/
COPY --from=builder --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

WORKDIR /app/apps/api
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
