# Multi-stage build pentru optimizare
FROM node:22-alpine AS base

# Instalare dependințe necesare pentru native modules
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Regenerare Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Development stage
FROM base AS dev
WORKDIR /app
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
WORKDIR /app

# Copy all source files
COPY . .

# Install all dependencies including dev
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy package.json pentru prisma commands
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Install Prisma CLI pentru migrări
RUN npm install prisma @prisma/client

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node --eval "fetch('http://localhost:3000/api/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Use dumb-init pentru proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start command cu database migration
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]