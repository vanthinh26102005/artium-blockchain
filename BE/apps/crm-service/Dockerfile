# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

# Copy all package.json and workspace manifests
COPY package.json yarn.lock ./
COPY apps/Z/package.json ./apps/crm-service/package.json
COPY libs ./libs
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/crm-service/tsconfig.json ./apps/crm-service/tsconfig.json
COPY apps/crm-service ./apps/crm-service

RUN yarn workspace @backend/crm-service build



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/crm-service ./dist/apps/crm-service



EXPOSE 3008
CMD ["node", "dist/apps/crm-service/main.js"]