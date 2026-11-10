# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* package-lock.json* pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Support build-time variables for Next.js public APIs
ARG NEXT_PUBLIC_AUTH_SERVICE_URL
ARG NEXT_PUBLIC_REQUEST_SERVICE_URL
ENV NEXT_PUBLIC_AUTH_SERVICE_URL=$NEXT_PUBLIC_AUTH_SERVICE_URL
ENV NEXT_PUBLIC_REQUEST_SERVICE_URL=$NEXT_PUBLIC_REQUEST_SERVICE_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm run build

# Stage 3: Minimal Standalone Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public static assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Setup .next directory permissions for runtime caching
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Leverage output traces to reduce image size (~120MB vs ~1GB)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://localhost:3000').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
