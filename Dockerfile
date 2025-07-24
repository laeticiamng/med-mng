# Build stage
ARG NODE_ENV=production
FROM node:20 AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
COPY .env.$NODE_ENV ./.env
RUN pnpm build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json ./
RUN npm install --omit=dev && npm install ts-node
ENV NODE_ENV=$NODE_ENV
CMD ["node", "--loader", "ts-node/esm", "src/index.ts"]
