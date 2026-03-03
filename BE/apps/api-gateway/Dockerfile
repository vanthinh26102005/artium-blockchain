# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

# Copy all package.json and workspace manifests
COPY package.json yarn.lock ./
COPY apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY libs ./libs
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/api-gateway/tsconfig.app.json ./apps/api-gateway/tsconfig.json
COPY apps/api-gateway ./apps/api-gateway

RUN yarn workspace @backend/api-gateway build



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/api-gateway ./dist/apps/api-gateway



EXPOSE 3002
CMD ["node", "dist/apps/api-gateway/main.js"]