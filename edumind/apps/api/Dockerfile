FROM node:22-alpine
RUN npm install -g pnpm

WORKDIR /app

# Copy monorepo root config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# Install all deps
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/database ./packages/database
COPY packages/types ./packages/types
COPY apps/api ./apps/api

# Generate Prisma client and build
RUN pnpm --filter @edumind/database db:generate
RUN pnpm --filter @edumind/api build

EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
