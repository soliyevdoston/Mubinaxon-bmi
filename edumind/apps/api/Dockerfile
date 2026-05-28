FROM node:22-alpine AS builder
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configs first (layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/database ./packages/database
COPY packages/types ./packages/types
COPY apps/api ./apps/api

# Generate Prisma client and compile TypeScript
RUN pnpm --filter @edumind/database db:generate
RUN pnpm --filter @edumind/api build

# ---- Production image ----
FROM node:22-alpine AS runner
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/packages/database/generated ./packages/database/generated
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "apps/api/dist/index.js"]
