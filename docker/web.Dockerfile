# ── Base ──────────────────────────────────────
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ── Dependencies ──────────────────────────────
FROM base AS deps
COPY package*.json turbo.json ./
COPY packages/ ./packages/
COPY apps/web/package*.json ./apps/web/

RUN npm install

# ── Builder ───────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json turbo.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npx turbo run build --filter=@nimoura/web

# ── Runner ────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Security: non-root user
USER node

COPY --from=builder --chown=node:node /app/apps/web/.output ./apps/web/.output

WORKDIR /app/apps/web
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", ".output/server/index.mjs"]
