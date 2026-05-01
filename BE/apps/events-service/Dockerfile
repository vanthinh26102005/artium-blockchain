# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

# Copy all package.json and workspace manifests
COPY package.json yarn.lock ./
COPY apps/events-service/package.json ./apps/events-service/package.json
COPY libs ./libs
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/events-service/tsconfig.json ./apps/events-service/tsconfig.json
COPY apps/events-service ./apps/events-service

RUN yarn workspace @backend/events-service build



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/events-service ./dist/apps/events-service



EXPOSE 3007
CMD ["node", "dist/apps/events-service/main.js"]