# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

# Copy all package.json and workspace manifests
COPY package.json yarn.lock ./
COPY apps/community-service/package.json ./apps/community-service/package.json
COPY libs ./libs
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/community-service/tsconfig.json ./apps/community-service/tsconfig.json
COPY apps/community-service ./apps/community-service

RUN yarn workspace @backend/community-service build



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/community-service ./dist/apps/community-service



EXPOSE 3009
CMD ["node", "dist/apps/community-service/main.js"]