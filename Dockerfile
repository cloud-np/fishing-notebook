# Use Node.js 20 Alpine for smaller image size
FROM node:24-alpine AS base
# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Fix Node.js v20+ Happy Eyeballs networking issues that cause ETIMEDOUT errors
# Particularly important for Astro Server Islands which make multiple HTTP requests
# --no-network-family-autoselection: Disables broken dual-stack connection handling
# --dns-result-order=ipv4first: Prioritizes IPv4 to avoid IPv6 timeout delays
# ENV NODE_OPTIONS="--no-network-family-autoselection --dns-result-order=ipv4first"
RUN corepack enable

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
# Install all dependencies (including dev) for build
RUN pnpm install --frozen-lockfile
COPY . .
# Build the application
RUN pnpm run build

# Production image, copy all the files and run astro
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Disable telemetry during runtime.
ENV ASTRO_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Create entrypoint script to generate .env from environment variables
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'echo "GMAIL_USER=$GMAIL_USER" > .env' >> /entrypoint.sh && \
    echo 'echo "GMAIL_PASS=$GMAIL_PASS" >> .env' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Copy the built application
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=deps --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json

# Give astro user ownership of the entire /app directory
RUN chown -R astro:nodejs /app

USER astro
EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "./dist/server/entry.mjs"]
