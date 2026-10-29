# ── Base ──────────────────────────────────────
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ── Dependencies ──────────────────────────────
FROM base AS deps
COPY package*.json turbo.json ./
COPY packages/ ./packages/
COPY apps/admin/package*.json ./apps/admin/

RUN npm install

# ── Builder ───────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json turbo.json ./
COPY packages/ ./packages/
COPY apps/admin/ ./apps/admin/

RUN npx turbo run build --filter=@nimoura/admin

# ── Runner ────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

# Security: non-root user
USER node

COPY --from=builder --chown=node:node /app/apps/admin/.output ./apps/admin/.output

WORKDIR /app/apps/admin
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/ || exit 1

CMD ["node", ".output/server/index.mjs"]
