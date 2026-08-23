# syntax=docker/dockerfile:1

############################################
# Stage 1: dependencies
############################################
FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

############################################
# Stage 2: build
############################################
FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# This app prerenders every page with getStaticProps (see lib/laravel.ts), so
# `next build` calls the Laravel API directly, from inside this build stage.
# That has two consequences:
#
#   1. NEXT_PUBLIC_API_URL must be reachable from wherever `docker build` runs
#      (Coolify's host), not just from inside the eventual runtime container.
#      Point it at the backend's public URL, e.g. https://api.example.com/api
#      (routes/api.php is served under /api).
#   2. Deploy order matters: the backend must already be up and migrated
#      *before* this image is built, or getProjects()/getProjectsByStatus()
#      throw and the build fails. On first deploy, ship the backend first.
#
# In Coolify, set this as a "Build Variable" (build arg), not only a runtime
# env var — a runtime-only NEXT_PUBLIC_* is inlined as an empty string here.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

############################################
# Stage 3: runtime
############################################
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
