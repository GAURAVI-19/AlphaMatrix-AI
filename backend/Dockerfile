# --- BUILD STAGE ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency definition files
COPY package*.json ./

# Install all dependencies (including devDependencies for validations or assets)
RUN npm ci

# Copy full application codebase
COPY . .

# Remove testing files to keep production code clean
RUN rm -rf tests

# --- PRODUCTION STAGE ---
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Install pm2 globally
RUN npm install -g pm2

# Copy package definition files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built code assets from builder stage
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/server.js ./
COPY --from=builder /usr/src/app/ecosystem.config.cjs ./

# Create standard logs directories and set permissions for node user
RUN mkdir -p logs && chown -R node:node /usr/src/app

# Switch to non-privileged node user for security hardening
USER node

EXPOSE 5000

# Start application using PM2 clustering manager runtime
CMD ["pm2-runtime", "ecosystem.config.cjs"]
