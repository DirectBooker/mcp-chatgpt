FROM node:20-alpine

WORKDIR /app

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies without running prepare scripts
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code and configuration
COPY src ./src
COPY tsconfig.json ./

# Build the application explicitly
RUN pnpm run build

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["pnpm", "start"]
