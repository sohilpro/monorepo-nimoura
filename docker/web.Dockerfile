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
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json turbo.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npx turbo run build --filter=@nimoura/web

FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
USER node
COPY --from=builder --chown=node:node /app/apps/web/.output ./apps/web/.output
WORKDIR /app/apps/web
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1
CMD ["node", ".output/server/index.mjs"]
