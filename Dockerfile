# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package files
COPY package.json package-lock.json ./
RUN npm ci

# Copia source code
COPY . .

# Build Next.js app
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app

# Copia solo i file necessari da stage 1
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Setup per Prisma
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
