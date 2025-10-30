############################################################
# Multi-stage Dockerfile: build inside Docker and serve on 80
############################################################

# Stage 1: install base build tools and dependencies cache
FROM --platform=linux/amd64 node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: build the Next.js app
FROM --platform=linux/amd64 node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: production runner
FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80

# Create non-root user (Node image includes 'node', but we harden with explicit user)
USER node

# Copy only the necessary runtime assets
COPY --chown=node:node package.json package-lock.json* ./
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/public ./public 2>/dev/null || true

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Listen on port 80 to align with Kubernetes Service/Deployment
EXPOSE 80

# Start Next.js bound to 0.0.0.0 on port 80
CMD ["npm", "start", "--", "-p", "80", "-H", "0.0.0.0"]