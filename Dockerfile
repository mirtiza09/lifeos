# Stage 1: Build the React frontend and bundle the server
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the frontend and server only
RUN npm run build

# Stage 2: Production image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
# Copy the server directory for any requires that might not be bundled
COPY --from=builder /app/server ./server
# Copy shared directory for schema definitions
COPY --from=builder /app/shared ./shared
# Copy health check script
COPY --from=builder /app/healthcheck.js ./healthcheck.js
# Copy PWA assets
COPY --from=builder /app/client/public/manifest.json ./dist/manifest.json
COPY --from=builder /app/client/public/service-worker.js ./dist/service-worker.js
COPY --from=builder /app/client/public/icons ./dist/icons
# Set production environment
ENV NODE_ENV=production

# Expose the application port
EXPOSE 5000

# Add Docker healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node healthcheck.js

# Start the server directly - no migration
CMD ["node", "dist/index.js"]