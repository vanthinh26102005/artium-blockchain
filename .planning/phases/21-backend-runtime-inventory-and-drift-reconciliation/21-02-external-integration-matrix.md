# 21-02 External Integration Matrix

## External systems

| System | Classification | Using workloads | Env variables / mounted files | Current callback or webhook concern | Evidence files |
|---|---|---|---|---|---|
| PostgreSQL | Internal-local-dev infra with shared or isolated topology options | identity, artwork, payments, orders, messaging, notifications, events, community | `DB_STRATEGY`, `SHARED_DB_HOST`, `SHARED_DB_PORT`, `SHARED_DB_NAME`, `DB_HOST`, `DB_PORT`, `DB_NAME` | No webhook surface; risk is topology/config drift between shared and isolated modes | `BE/libs/common/src/database/database.helper.ts`, `BE/apps/*/.env.compose`, `BE/docker-compose.yml`, `BE/docker-compose.shared.yml`, `BE/docker-compose.isolated.yml` |
| Redis | Internal-local-dev infra | Confirmed direct consumer: identity-service; env surfaced for artwork, payments, messaging, notifications, events, community | `REDIS_HOST`, `REDIS_PORT` | No webhook surface | `BE/apps/identity-service/src/app.module.ts`, `BE/apps/*/.env.compose`, `BE/docker-compose.yml` |
| RabbitMQ | Internal-local-dev infra | identity, artwork, payments, orders, messaging, notifications, events, community, outbox processor | `RABBITMQ_URI` | No external webhook, but it is the internal event backbone for outbox and blockchain event fan-out | `BE/libs/rabbitmq/src/app.module.ts`, `BE/libs/outbox/src/outbox.processor.ts`, `BE/docker-compose.yml` |
| Mailhog | Internal-local-dev infra | notifications-service | `SMTP_HOST=mailhog`, `SMTP_PORT=1025` | No webhook; mail capture is purely local-dev | `BE/apps/notifications-service/.env.compose`, `BE/apps/notifications-service/src/app.module.ts`, `BE/docker-compose.yml` |
| SMTP | External-style protocol surface, currently pointed at Mailhog in dev | notifications-service | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | No webhook; mail delivery config still needs to be modeled as an outbound dependency in later phases | `BE/apps/notifications-service/.env.compose`, `BE/apps/notifications-service/src/app.module.ts` |
| GCS | External third-party service | artwork-service, messaging-service | `GCS_PROJECT_ID`, `GCS_BUCKET_NAME`, `GCS_KEY_FILE`, mounted file `/app/config/gcs-service-account.json` | No webhook; mounted credential file is the sensitive runtime dependency | `BE/apps/artwork-service/.env.compose`, `BE/apps/messaging-service/.env.compose`, `BE/docker-compose.yml`, `BE/docs/GCS_SETUP.md` |
| Stripe | External third-party service | payments-service, api-gateway payment relay | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification requires raw request body and signature validation | `BE/docker-compose.yml`, `BE/apps/payments-service/src/app.module.ts`, `BE/apps/payments-service/src/presentation/http/controllers/stripe-webhook.controller.ts`, `BE/apps/api-gateway/src/presentation/http/controllers/payment/payments.controller.ts` |
| Blockchain RPC | External third-party chain access | orders-service, payments-service confirmation worker, blockchain library | `BLOCKCHAIN_RPC_URL`, `ETHEREUM_CONFIRMATION_RPC_URL`, `ETHEREUM_CONFIRMATION_RPC_URLS`, `CONTRACT_ADDRESS`, `PLATFORM_PRIVATE_KEY` | No webhook; long-running polling/listener logic depends on stable RPC access | `BE/docker-compose.yml`, `BE/libs/blockchain/src/blockchain.module.ts`, `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts`, `BE/apps/payments-service/src/infrastructure/services/ethereum-transaction-confirmation.service.ts`, `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.ts` |
| Google OAuth | External third-party auth provider | identity-service | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Login flow depends on ID-token verification against configured audience | `BE/docker-compose.yml`, `BE/apps/identity-service/src/app.module.ts`, `BE/apps/identity-service/src/application/commands/handlers/LoginByGoogle.command.handler.ts` |

## Env variables by integration

| Integration | Current variable names |
|---|---|
| PostgreSQL | `DB_STRATEGY`, `SHARED_DB_HOST`, `SHARED_DB_PORT`, `SHARED_DB_NAME`, `DB_HOST`, `DB_PORT`, `DB_NAME` |
| Redis | `REDIS_HOST`, `REDIS_PORT` |
| RabbitMQ | `RABBITMQ_URI` |
| Mailhog / SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| GCS | `GCS_PROJECT_ID`, `GCS_BUCKET_NAME`, `GCS_KEY_FILE` |
| Stripe | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Blockchain RPC | `BLOCKCHAIN_RPC_URL`, `ETHEREUM_CONFIRMATION_RPC_URL`, `ETHEREUM_CONFIRMATION_RPC_URLS`, `CONTRACT_ADDRESS`, `PLATFORM_PRIVATE_KEY` |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |

## Mounted credentials and file dependencies

| Workload | File dependency | Why it matters | Evidence |
|---|---|---|---|
| artwork-service | `/app/config/gcs-service-account.json` via `GCS_KEY_FILE` | Image/media upload runtime assumes a mounted service-account JSON file is present | `BE/apps/artwork-service/.env.compose`, `BE/docker-compose.yml` |
| messaging-service | `/app/config/gcs-service-account.json` via `GCS_KEY_FILE` | Messaging media handling uses the same mounted GCS credential path | `BE/apps/messaging-service/.env.compose`, `BE/docker-compose.yml` |
| payments-service | Raw Stripe secret env only; no file mount in current compose | Secret-bearing runtime depends on env injection rather than mounted files | `BE/docker-compose.yml`, `BE/apps/payments-service/src/app.module.ts` |
| identity-service | Google OAuth client secrets are env-backed, not file-backed | Auth provider setup depends on compose-injected secrets instead of a mounted credential file | `BE/docker-compose.yml`, `BE/apps/identity-service/src/app.module.ts` |

## Callback and webhook surfaces

| Surface | Entry point | Dependency | Operational note | Evidence |
|---|---|---|---|---|
| Stripe webhook | `POST /payments/stripe/webhook` in gateway and `POST /stripe/webhooks` in payments-service | Stripe | Both paths rely on raw-body handling and `STRIPE_WEBHOOK_SECRET` for signature verification | `BE/apps/api-gateway/src/presentation/http/controllers/payment/payments.controller.ts`, `BE/apps/payments-service/src/main.ts`, `BE/apps/payments-service/src/presentation/http/controllers/stripe-webhook.controller.ts` |
| Google login token verification | Identity command handler verifies Google ID tokens against configured audience | Google OAuth | This is not a webhook, but it is the live provider callback-style trust boundary for login | `BE/apps/identity-service/src/application/commands/handlers/LoginByGoogle.command.handler.ts`, `BE/apps/identity-service/src/app.module.ts` |
| Blockchain event ingestion | `BlockchainEventListenerService` subscribes/polls Sepolia events and publishes them into the outbox/RabbitMQ path | Blockchain RPC | Long-lived external event ingestion is part of the runtime contract even without HTTP ingress | `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts`, `BE/libs/outbox/src/outbox.processor.ts` |
