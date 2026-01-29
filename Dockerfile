FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./ 
COPY templates/sen-bot/package.json templates/sen-bot/package-lock.json ./templates/sen-bot/

# Install dependencies including the template dependencies
RUN npm ci
cd templates/sen-bot && npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/templates/sen-bot/node_modules ./templates/sen-bot/node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install production dependencies for system (if needed for bots)
RUN apk add --no-cache git

# Copy public folder and built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma schema and migrations for deployment
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy templates and ensure instances directory exists
COPY --from=builder --chown=nextjs:nodejs /app/templates ./templates
RUN mkdir -p /app/instances && chown nextjs:nodejs /app/instances

# Create data directory for SQLite persistence
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Copy cron script
COPY --from=builder --chown=nextjs:nodejs /app/cron.js ./cron.js

# Copy entrypoint script
COPY --chown=nextjs:nodejs entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["./entrypoint.sh"]
