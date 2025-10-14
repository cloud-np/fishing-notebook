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
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV ASTRO_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Copy package files and install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy the built application
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json

# Create directory for SQLite database
RUN mkdir -p /app/data && chown -R astro:nodejs /app

# Create entrypoint script to generate .env from environment variables
RUN echo '#!/bin/sh' > /entrypoint.sh && \
	echo 'echo "RESEND_API_KEY=$RESEND_API_KEY" > .env' >> /entrypoint.sh && \
	echo 'echo "GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID" >> .env' >> /entrypoint.sh && \
	echo 'echo "GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET" >> .env' >> /entrypoint.sh && \
	echo 'echo "DB_FILE_NAME=$DB_FILE_NAME" >> .env' >> /entrypoint.sh && \
	echo 'echo "PROD=$PROD" >> .env' >> /entrypoint.sh && \
	echo 'echo "BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET" >> .env' >> /entrypoint.sh && \
	echo 'exec "$@"' >> /entrypoint.sh && \
	chmod +x /entrypoint.sh

USER astro
EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "./dist/server/entry.mjs"]
