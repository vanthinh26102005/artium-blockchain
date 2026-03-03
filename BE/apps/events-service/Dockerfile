# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/events-service ./apps/events-service
COPY libs ./libs

RUN yarn run build:events



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/events-service ./dist/apps/events-service



EXPOSE 3007
CMD ["node", "dist/apps/events-service/main.js"]