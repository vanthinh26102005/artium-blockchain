# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/crm-service ./apps/crm-service
COPY libs ./libs

RUN yarn run build:crm



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/crm-service ./dist/apps/crm-service



EXPOSE 3008
CMD ["node", "dist/apps/crm-service/main.js"]