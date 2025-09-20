# syntax=docker/dockerfile:1

# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Generate Prisma client with retry logic
RUN npx prisma generate || (sleep 5 && npx prisma generate)

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies for Prisma
RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
## Optional: copy public assets if present (remove if not used)
# COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/app/data ./app/data

# Default port for Next.js
EXPOSE 3000

# Run database migrations on startup then start the app
CMD sh -c "npx prisma migrate deploy && npm run start -- -p 3000"



