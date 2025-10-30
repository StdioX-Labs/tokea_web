# --- Base dependencies layer ---
FROM node:20-alpine AS deps
WORKDIR /app

# Ensure compatibility for native modules if used by Next/Image, etc.
RUN apk add --no-cache libc6-compat

COPY package*.json ./
# Use npm ci for reproducible installs and better layer caching
RUN npm ci


# --- Build layer ---
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js app
RUN npm run build


# --- Production runtime layer ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Align container port with Kubernetes manifest (containerPort: 80)
ENV PORT=80

RUN apk add --no-cache libc6-compat

# Create non-root user for security
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Only copy the minimal runtime assets
# Note: skipping public/ because this project does not have it
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 80
USER nextjs

# Use next start; PORT is set to 80 for k8s service compatibility
CMD ["npm", "start"]


