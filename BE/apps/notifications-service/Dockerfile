# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

# Copy all package.json and workspace manifests
COPY package.json yarn.lock ./
COPY apps/notifications-service/package.json ./apps/notifications-service/package.json
COPY libs ./libs
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/notifications-service/tsconfig.app.json ./apps/notifications-service/tsconfig.json
COPY apps/notifications-service ./apps/notifications-service

RUN yarn workspace @backend/notifications-service build



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/notifications-service ./dist/apps/notifications-service



EXPOSE 3003
CMD ["node", "dist/apps/notifications-service/main.js"]