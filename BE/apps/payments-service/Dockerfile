# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

# Copy all package.json and workspace manifests
COPY package.json yarn.lock ./
COPY apps/payments-service/package.json ./apps/payments-service/package.json
COPY libs ./libs
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/payments-service/tsconfig.app.json ./apps/payments-service/tsconfig.json
COPY apps/payments-service ./apps/payments-service

RUN yarn workspace @backend/payments-service build



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/payments-service ./dist/apps/payments-service



EXPOSE 3005
CMD ["node", "dist/apps/payments-service/main.js"]