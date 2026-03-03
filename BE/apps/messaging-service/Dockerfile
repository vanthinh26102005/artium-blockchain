# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

# Copy all package.json and workspace manifests
COPY package.json yarn.lock ./
COPY apps/messaging-service/package.json ./apps/messaging-service/package.json
COPY libs ./libs
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/messaging-service/tsconfig.app.json ./apps/messaging-service/tsconfig.json
COPY apps/messaging-service ./apps/messaging-service

RUN yarn workspace @backend/messaging-service build



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/messaging-service ./dist/apps/messaging-service



EXPOSE 3004
CMD ["node", "dist/apps/messaging-service/main.js"]