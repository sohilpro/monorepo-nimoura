FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

RUN npm install

RUN npx turbo run build --filter=@vecaro/backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/backend/package*.json ./apps/backend/

RUN npm install --omit=dev

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

WORKDIR /app/apps/backend
EXPOSE 4000
CMD ["node", "dist/main.js"]
