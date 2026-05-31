# Stage 1: Build the dashboard
FROM node:20-alpine AS dashboard-builder
WORKDIR /app
# Copy only the files needed for dependency installation
COPY package*.json ./
COPY dashboard/package*.json ./dashboard/
# Install dependencies for the dashboard
RUN npm install --workspace=dashboard
# Copy dashboard source and build
COPY dashboard/ ./dashboard/
RUN npm run build --workspace=dashboard

# Stage 2: Production runtime
FROM node:20-alpine
WORKDIR /app

# Copy root package.json and workspace package.json files
COPY package*.json ./
COPY api/package*.json ./api/
COPY cli/package*.json ./cli/
COPY dashboard/package*.json ./dashboard/

# Install production dependencies for the whole workspace
RUN npm install --omit=dev

# Copy application code
COPY api/ ./api/
COPY cli/ ./cli/
# Copy the built dashboard from Stage 1
COPY --from=dashboard-builder /app/dashboard/dist ./dashboard/dist

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "api/src/server.js"]
