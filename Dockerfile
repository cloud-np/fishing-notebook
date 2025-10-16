# Use Node.js 24 Alpine for smaller image size
FROM node:24-alpine AS base
# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build stage - install all dependencies and build
FROM base AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Accept build argument for client-side PUBLIC_ variables
ARG PUBLIC_SITE_URL
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL

# Copy package files
COPY package.json pnpm-lock.yaml ./
# Install all dependencies (including dev) for build
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN pnpm run build

# Production image, copy all the files and run astro
FROM base AS runner
# Install build tools needed for better-sqlite3 native module
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

ENV NODE_ENV=production
ENV ASTRO_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Copy package files and install production dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install only production dependencies plus tsx for migrations (this will rebuild better-sqlite3 for Alpine)
RUN pnpm install --prod --frozen-lockfile && pnpm add tsx

# Copy the built application
COPY --from=builder --chown=astro:nodejs /app/dist ./dist

# Copy migration files and scripts
COPY --from=builder --chown=astro:nodejs /app/src/db/migrations ./src/db/migrations
COPY --from=builder --chown=astro:nodejs /app/scripts ./scripts
COPY --from=builder --chown=astro:nodejs /app/src/db/schema.ts ./src/db/schema.ts
COPY --from=builder --chown=astro:nodejs /app/src/db/index.ts ./src/db/index.ts

# Change ownership after installation
RUN chown -R astro:nodejs /app

# Create directory for SQLite database
RUN mkdir -p /app/data && chown -R astro:nodejs /app

# Create entrypoint script to generate .env from environment variables
RUN echo '#!/bin/sh' > /entrypoint.sh && \
	echo 'set -e' >> /entrypoint.sh && \
	echo '' >> /entrypoint.sh && \
	echo '# Ensure data directory exists and is writable' >> /entrypoint.sh && \
	echo 'if [ ! -w /app/data ]; then' >> /entrypoint.sh && \
	echo '  echo "Warning: /app/data is not writable, attempting to create it..."' >> /entrypoint.sh && \
	echo '  mkdir -p /app/data 2>/dev/null || true' >> /entrypoint.sh && \
	echo 'fi' >> /entrypoint.sh && \
	echo '' >> /entrypoint.sh && \
	echo '# Generate .env file from all environment variables' >> /entrypoint.sh && \
	echo 'printenv | grep -E "^(RESEND_API_KEY|GITHUB_CLIENT_ID|GITHUB_CLIENT_SECRET|DB_FILE_NAME|PROD|BETTER_AUTH_SECRET|BETTER_AUTH_URL|PUBLIC_SITE_URL|NODE_ENV)=" > /app/.env || true' >> /entrypoint.sh && \
	echo '' >> /entrypoint.sh && \
	echo '# Run database migrations' >> /entrypoint.sh && \
	echo 'echo "Running database migrations..."' >> /entrypoint.sh && \
	echo 'node --import tsx/esm /app/scripts/migrate-db.ts || echo "Warning: Migration failed or no migrations to run"' >> /entrypoint.sh && \
	echo '' >> /entrypoint.sh && \
	echo 'exec "$@"' >> /entrypoint.sh && \
	chmod +x /entrypoint.sh

EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321

# Declare volume for SQLite database persistence
VOLUME ["/app/data"]

# Don't switch to astro user yet - let entrypoint handle it
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "--env-file=/app/.env", "./dist/server/entry.mjs"]
