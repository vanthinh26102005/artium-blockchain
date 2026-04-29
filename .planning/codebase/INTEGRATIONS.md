# External Integrations

**Analysis Date:** 2026-04-21

## APIs & External Services

**Payment Gateway:**
- Stripe — payment processing, invoice payments, payouts, refunds
  - SDK/Client: `stripe` ^20.1.2 (backend), `@stripe/react-stripe-js` ^5.x + `@stripe/stripe-js` (frontend)
  - Auth: `STRIPE_API_KEY` env var
  - Webhook secret: `STRIPE_WEBHOOK_SECRET` env var
  - Used in: `BE/apps/payments-service/src/infrastructure/services/stripe.service.ts`
  - Webhook endpoint: `StripeWebhookController` in `BE/apps/payments-service/src/presentation/http/controllers/`
  - Operations: create payment intent, confirm payment, create customer, attach payment methods, refunds, payouts

**Google OAuth:**
- Google Identity — social login / OAuth2 sign-in
  - SDK/Client: `google-auth-library` ^10.4.0
  - Auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` env vars
  - Used in: `BE/libs/auth/src/guards/google-auth.guard.ts`, `BE/libs/auth/src/strategies/`
  - Client ID (dev): `873456140774-gi4pt3aq0m3gpd5f10uv4ivv59lvbgej.apps.googleusercontent.com`

**Firebase:**
- Firebase Admin SDK — push notifications / Firebase Cloud Messaging (FCM)
  - SDK/Client: `firebase-admin` ^13.5.0
  - Credentials: `BE/firebase-service-account.json` (service account key file — DO NOT commit)
  - Referenced in `BE/libs/common/src/enums/notification.enum.ts`
  - Used for push notification delivery in `notifications-service`

**Blockchain / Ethereum:**
- Ethereum Sepolia testnet — on-chain auction escrow
  - SDK/Client: `ethers` ^6.4.0 (JsonRpcProvider, Wallet, Contract)
  - RPC: `BLOCKCHAIN_RPC_URL` env var (Sepolia RPC URL, e.g. Infura/Alchemy endpoint)
  - Contract address: `CONTRACT_ADDRESS` env var
  - Platform signer: `PLATFORM_PRIVATE_KEY` env var
  - Etherscan verification: `ETHERSCAN_API_KEY` env var
  - Network config: `BE/smart-contracts/hardhat.config.ts` (chainId: 11155111)
  - Contract: `ArtAuctionEscrow` deployed to Sepolia (`BE/smart-contracts/contracts/ArtAuctionEscrow.sol`)
  - Listener: `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts`
  - Contract service: `BE/libs/blockchain/src/services/escrow-contract.service.ts`
  - ABI: `BE/libs/blockchain/src/abi/ArtAuctionEscrow.json`

## Data Storage

**Databases:**
- PostgreSQL 17 — primary relational store for all services
  - Client: TypeORM ^0.3.27 + `pg` ^8.16.3
  - Two deployment modes (controlled by `DB_STRATEGY` env var):
    - `SHARED` — single `artium_global` DB with per-service schemas (port 5454)
    - `ISOLATED` — separate DB per service (ports 5433–5439)
  - Per-service databases (isolated mode):
    - `identity_db` — port 5437 (`db-identity`)
    - `notifications_db` — port 5433 (`db-notifications`)
    - `artwork_db` — port 5434 (`db-artwork`)
    - `messaging_db` — port 5435 (`db-messaging`)
    - `payments_db` — port 5436 (`db-payments`)
    - `events_db` — port 5438 (`db-events`)
    - `community_db` — port 5439 (`db-community`)
  - Connection env vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` (or `SHARED_DB_*`)
  - Schema management: `DynamicDatabaseModule` in `BE/libs/common/src/database/dynamic-database.module.ts`

**File Storage:**
- Google Cloud Storage (GCS) — artwork images and messaging file attachments
  - SDK/Client: `@google-cloud/storage` ^7.18.0
  - Project: `GCS_PROJECT_ID` env var (dev: `artworkmanagement`)
  - Bucket: `GCS_BUCKET_NAME` env var (dev: `artwork_uit`)
  - Key file: `GCS_KEY_FILE` env var → `BE/config/gcs-service-account.json`
  - Services using GCS: `BE/apps/artwork-service/src/domain/services/gcs-storage.service.ts`, `BE/apps/messaging-service/src/domain/services/gcs-storage.service.ts`
  - Image constraints: max 10 MB, JPEG/PNG/WebP/JPG, 2000×2000px max, 85% quality
  - Frontend image domain: `storage.googleapis.com` (allowed in `FE/artium-web/next.config.ts`)

- Cloudinary — additional/alternative image CDN
  - SDK/Client: `cloudinary` ^2.5.1
  - Used in: `BE/apps/artwork-service/` (alongside GCS)

- Local filesystem — temporary upload buffer via Multer (`BE/uploads/` directory)

**Caching:**
- Redis 8.2 (Alpine) — session/token caching, cache-manager backend
  - Client: `cache-manager-redis-store` ^3.0.1, `@nestjs/cache-manager` ^3.0.1
  - Connection: `REDIS_HOST`, `REDIS_PORT` env vars (default: `redis:6379`)
  - Used across all services for token blacklisting, caching query results

## Authentication & Identity

**Auth Strategy:**
- JWT (JSON Web Tokens) — primary auth mechanism
  - Library: `@nestjs/jwt` ^11.0.0, `passport-jwt` ^4.0.1
  - Secret: `JWT_SECRET` env var
  - Expiry: `JWT_EXPIRES_IN` env var (default: `1d`)
  - Guards in `BE/libs/auth/src/guards/`: `jwt-auth.guard.ts`, `roles.guard.ts`, `m2m-jwt.guard.ts`
  - Strategy: `BE/libs/auth/src/strategies/jwt.strategy.ts`, `m2m-jwt.strategy.ts`

- Password hashing: `bcrypt` ^6.0.0 / `bcryptjs` ^3.0.2 in identity-service

- Google OAuth2: Social login via `google-auth-library`, guard at `BE/libs/auth/src/guards/google-auth.guard.ts`

- Machine-to-machine (M2M): Separate JWT strategy `m2m-jwt.strategy.ts` for service-to-service auth

- Frontend session: `next-auth` ^4.24.13 (manages session state in `FE/artium-web/`)

## Message Broker

**RabbitMQ (custom image, built from `BE/infrastructure/docker/rabbitmq/Dockerfile`):**
- Client: `@golevelup/nestjs-rabbitmq` ^6.0.2
- Connection: `RABBITMQ_URI` env var (format: `amqp://user:pass@rabbitmq:5672`)
- Ports: 5672 (AMQP), 15672 (management UI)
- Module config: `BE/libs/rabbitmq/src/app.module.ts`

**Exchanges** (`BE/libs/rabbitmq/src/exchanges/exchanges.ts`):
- `user.events.exchange` — topic exchange for user-related events
- `notification.events.exchange` — `x-delayed-message` exchange (requires rabbitmq-delayed-message plugin)
- `payment.events.exchange` — topic exchange for payment events
- `blockchain.events.exchange` — topic exchange for on-chain auction events

**Queues** (`BE/libs/rabbitmq/src/queues/queues.ts`):
- `notification.send-transactional-email.queue`
- `notification.new-message.queue`
- `notification.blockchain-auction.queue`

**Dead Letter Exchange:** configured in `BE/libs/rabbitmq/src/exchanges/dl-exchange.ts`

**Outbox Pattern:** `BE/libs/outbox/` — transactional outbox to guarantee reliable RabbitMQ publishing

## Email

**SMTP / MailHog (development):**
- Client: `@nestjs-modules/mailer` ^2.0.2 with Handlebars adapter
- Dev SMTP: MailHog (`mailhog:1025`), web UI at port 8025
- Config env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- From address: `noreply@artium.com`
- Used in: `BE/apps/notifications-service/src/app.module.ts`
- Template engine: Handlebars (`.hbs` templates)

## Inter-Service Communication

**TCP Microservices (NestJS Transport.TCP):**
- API Gateway → each microservice via TCP on internal ports 3101–3108
- API Gateway at port 8081 (HTTP external), connects to:
  - identity-service: 3101
  - artwork-service: 3102
  - payments-service: 3103
  - messaging-service: 3105
  - notifications-service: 3106
  - events-service: 3107
  - community-service: 3108
- Config: `BE/apps/api-gateway/src/app.module.ts`

**WebSockets (Socket.IO):**
- Real-time messaging via Socket.IO
- Gateway: `BE/apps/messaging-service/src/presentation/gateways/messaging.gateway.ts`
- API Gateway proxy: `BE/apps/api-gateway/src/presentation/http/gateways/messaging.gateway.ts`
- Client: `socket.io-client` ^4.8.3 in frontend (`FE/artium-web/`)

## Monitoring & Observability

**Logging:**
- NestJS built-in Logger (`@nestjs/common` Logger class)
- Log levels: log, error, warn, debug, verbose (enabled in API Gateway)

**Metrics:**
- `@app/metrics` shared library (`BE/libs/metrics/src/`) — metrics service (internal, no external provider detected)

**API Documentation:**
- Swagger UI via `@nestjs/swagger` ^11.2.4
- API Gateway docs: `http://localhost:8081/api-docs`
- Per-service docs: `/api-docs/identity`, `/api-docs/artwork`, etc.
- Each microservice also exposes its own Swagger at `http://localhost:<port>/api`

## CI/CD & Deployment

**Containerization:**
- Docker + Docker Compose (`BE/docker-compose.yml`, `BE/docker-compose.isolated.yml`, `BE/docker-compose.shared.yml`)
- Each service has its own `Dockerfile` at `BE/apps/<service>/Dockerfile`

**Orchestration:**
- Skaffold (`BE/skaffold.yaml`) — Kubernetes-oriented deployment tooling

**Networks (Docker):**
- `infra_network` — DB, Redis, RabbitMQ, MailHog, microservices
- `services_network` — API Gateway + microservices

## Webhooks & Callbacks

**Incoming:**
- Stripe webhooks → `BE/apps/payments-service/src/presentation/http/controllers/` (`StripeWebhookController`)
  - Secret verification via `STRIPE_WEBHOOK_SECRET`

**Outgoing:**
- None detected

## Environment Configuration Summary

**Required env vars per service:**
```
# Database
DB_STRATEGY=SHARED|ISOLATED
DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
SHARED_DB_HOST, SHARED_DB_PORT, SHARED_DB_USERNAME, SHARED_DB_PASSWORD, SHARED_DB_NAME

# Cache
REDIS_HOST, REDIS_PORT

# Messaging
RABBITMQ_URI

# Auth
JWT_SECRET, JWT_EXPIRES_IN
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Payments (payments-service only)
STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET

# File Storage (artwork-service, messaging-service)
GCS_PROJECT_ID, GCS_BUCKET_NAME, GCS_KEY_FILE

# Blockchain (orders-service, smart-contracts)
BLOCKCHAIN_RPC_URL, CONTRACT_ADDRESS, PLATFORM_PRIVATE_KEY
ETHERSCAN_API_KEY (smart-contracts deploy only)
SEPOLIA_RPC_URL, PRIVATE_KEY (hardhat deploy)

# Email (notifications-service)
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

# Service ports
PORT, MICROSERVICE_PORT, MICROSERVICE_HOST
```

**Secrets files (never commit):**
- `BE/firebase-service-account.json` — Firebase Admin credentials
- `BE/config/gcs-service-account.json` — Google Cloud Storage credentials
- `BE/smart-contracts/.env` — blockchain private key and RPC URLs

---

*Integration audit: 2026-04-21*
