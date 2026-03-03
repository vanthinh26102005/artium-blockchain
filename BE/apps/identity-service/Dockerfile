# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

COPY package.json yarn.lock ./
COPY apps/identity-service/package.json ./apps/identity-service/package.json
COPY libs ./libs
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/identity-service/tsconfig.app.json ./apps/identity-service/tsconfig.json
COPY apps/identity-service ./apps/identity-service

RUN yarn workspace @backend/identity-service build



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/identity-service ./dist/apps/identity-service



EXPOSE 3001
CMD ["node", "dist/apps/identity-service/main.js"]