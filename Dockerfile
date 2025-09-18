# ====================================================================================
# FINAL STAGE: Production Runner
# This Dockerfile packages a pre-built Next.js application.
# It does NOT build the application.
# ====================================================================================

# Use the official Node.js 20 Alpine image. It's lightweight and secure.
FROM --platform=linux/amd64  node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Set the environment to production for optimized performance
ENV NODE_ENV=production

# The 'node' user is pre-installed in the official Node.js Alpine image.
# We will use it for better security instead of running as root.
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#non-root-user

# Copy package.json and the lock file to install only production dependencies
COPY package.json package-lock.json* ./

# Install ONLY the production dependencies needed to run the app.
# The --omit=dev flag is the modern equivalent of --production.
RUN npm install --omit=dev

# Copy the pre-built Next.js application output from your local machine.
# The --chown flag sets the owner to the non-root 'node' user.
COPY --chown=node:node ./.next ./.next

# This line is removed because the project does not have a 'public' directory.
# If you add a 'public' folder later, you can uncomment this line.
 COPY --chown=node:node ./public ./public/

# Switch to the non-root user for running the application
USER node

# Expose the port the app will run on. Next.js defaults to 3000.
EXPOSE 3000

# The command to run the application, using the 'start' script from package.json
# Your start script "next start --hostname 0.0.0.0" is perfect for Docker.
CMD ["npm", "start"]