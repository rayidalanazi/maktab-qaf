# syntax=docker/dockerfile:1.7
# =============================================================================
# قاف — Multi-stage Docker build for Next.js 16 (standalone output)
# =============================================================================
# Build order:
#   1. deps     — install only production dependencies (cached layer)
#   2. builder  — full install + Next.js build with standalone output
#   3. runner   — minimal Alpine + only the standalone server
# Final image: ~150-200 MB.
# =============================================================================

# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
# libc6-compat needed for native Node modules (sharp, etc) on Alpine
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts && npm cache clean --force

# ─── Stage 2: builder ────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build (Turbopack default in Next 16)
RUN npm run build

# ─── Stage 3: runner ─────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets and standalone server output
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Healthcheck — Traefik also has its own, this is for compose-level checks
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget --quiet --spider http://localhost:3000/api/health || exit 1

# Next.js standalone server entry
CMD ["node", "server.js"]
