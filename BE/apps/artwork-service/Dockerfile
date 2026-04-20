# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

# Copy all package.json and workspace manifests
COPY package.json yarn.lock ./
COPY apps/artwork-service/package.json ./apps/artwork-service/package.json
COPY libs ./libs
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/artwork-service/tsconfig.json ./apps/artwork-service/tsconfig.json
COPY apps/artwork-service ./apps/artwork-service

RUN yarn workspace @backend/artwork-service build



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/artwork-service ./dist/apps/artwork-service



EXPOSE 3002
CMD ["node", "dist/apps/artwork-service/main.js"]