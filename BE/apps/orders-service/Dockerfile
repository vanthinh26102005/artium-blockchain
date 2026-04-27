# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

# Copy all package.json and workspace manifests
COPY package.json yarn.lock ./
COPY apps/orders-service/package.json ./apps/orders-service/package.json
COPY libs ./libs
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/orders-service/tsconfig.app.json ./apps/orders-service/tsconfig.json
COPY apps/orders-service ./apps/orders-service

RUN yarn workspace @backend/orders-service build



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/orders-service ./dist/apps/orders-service



EXPOSE 3006
CMD ["node", "dist/apps/orders-service/main.js"]