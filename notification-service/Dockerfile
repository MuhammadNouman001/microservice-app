
# Stage 1: Build NestJS TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy dependency manifests and pnpm configuration
COPY package.json pnpm-lock.yaml* package-lock.json* pnpm-workspace.yaml* .npmrc* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application source
COPY . .

# Compile NestJS
RUN pnpm run build


# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm

# Copy dependency manifests and pnpm configuration
COPY package.json pnpm-lock.yaml* package-lock.json* pnpm-workspace.yaml* .npmrc* ./

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy email templates required by EjsAdapter
COPY --from=builder /app/src/notification/templates ./src/notification/templates

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:8002/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/main.js"]
