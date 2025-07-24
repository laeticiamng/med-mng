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
RUN pnpm build

# ---- Production stage ----
FROM node:20-alpine AS release
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile && npm install ts-node
CMD ["node", "--loader", "ts-node/esm", "src/index.ts"]
