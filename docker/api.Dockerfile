FROM docker.arvancloud.ir/node:22-alpine AS base
RUN sed -i 's/dl-cdn.alpinelinux.org/mirror.arvancloud.ir/g' /etc/apk/repositories && \
    apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
ARG NPM_REGISTRY=https://registry.npmjs.org
RUN npm config set registry ${NPM_REGISTRY}
COPY package.json turbo.json ./
COPY packages/ ./packages/
COPY apps/api/package.json ./apps/api/
COPY apps/admin/package.json ./apps/admin/
COPY apps/web/package.json ./apps/web/
RUN npm install && npm install --os=linux --libc=musl --cpu=x64 sharp

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json turbo.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
RUN npx turbo run build --filter=@nimoura/api

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4000

RUN mkdir -p /app/apps/api/uploads && chown -R node:node /app

USER node

COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/packages/ ./packages/
COPY --from=builder --chown=node:node /app/apps/api/package.json ./apps/api/
COPY --from=builder --chown=node:node /app/apps/api/tsconfig*.json ./apps/api/
COPY --from=builder --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=node:node /app/apps/api/src ./apps/api/src
COPY --from=builder --chown=node:node /app/apps/api/scripts ./apps/api/scripts
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

WORKDIR /app/apps/api
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
