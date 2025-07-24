# Build stage
ARG NODE_ENV=production
FROM node:20 AS builder
# ---- Dependencies stage ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# ---- Test stage ----
FROM deps AS test
COPY . .
RUN pnpm lint && pnpm test

# ---- Build stage ----
FROM deps AS build
COPY . .
COPY .env.$NODE_ENV ./.env
RUN pnpm build

# ---- Production stage ----
FROM node:20-alpine AS release
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json ./
RUN npm install --omit=dev && npm install ts-node
ENV NODE_ENV=$NODE_ENV
CMD ["node", "--loader", "ts-node/esm", "src/index.ts"]
