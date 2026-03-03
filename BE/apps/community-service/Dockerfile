# Base image
FROM node:20-slim AS base

WORKDIR /app



# Builder stage
FROM base AS builder

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY webpack-hmr.config.js tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs ./
COPY apps/community-service ./apps/community-service
COPY libs ./libs

RUN yarn run build:community



# Production stage
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/community-service ./dist/apps/community-service



EXPOSE 3009
CMD ["node", "dist/apps/community-service/main.js"]