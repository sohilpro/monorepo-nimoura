# Dockerfile
# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
# --ignore-scripts: postinstall (nuxt prepare) به سورس نیاز دارد که هنوز کپی نشده
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm build

FROM node:22-bookworm-slim AS run
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]