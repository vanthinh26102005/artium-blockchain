# 21-01 Workload Classification

## Classification rules

- **HTTP+TCP** means the service boots an HTTP Nest app and also calls `connectMicroservice(...)` for a TCP transport.
- **TCP-only** means the service uses `NestFactory.createMicroservice(...)` and does not expose an HTTP app in its current bootstrap file.
- **websocket-enabled** means a workload declares `@WebSocketGateway(...)` in the current runtime path.
- **stateful** means the workload persists or brokers runtime state that other workloads depend on.
- **singleton/background** means the behavior is driven by schedulers, listeners, or long-running processors whose scale semantics differ from stateless request handlers.

## Service classes

| Workload | Primary class | Secondary behaviors | Evidence |
|---|---|---|---|
| api-gateway | HTTP gateway | websocket relay providers for auction and messaging namespaces | `BE/apps/api-gateway/src/main.ts`, `BE/apps/api-gateway/src/presentation/http/gateways/auction.gateway.ts`, `BE/apps/api-gateway/src/presentation/http/gateways/messaging.gateway.ts` |
| identity-service | HTTP+TCP | cache-backed auth and Google login provider wiring | `BE/apps/identity-service/src/main.ts`, `BE/apps/identity-service/src/app.module.ts`, `BE/apps/identity-service/src/application/commands/handlers/LoginByGoogle.command.handler.ts` |
| artwork-service | HTTP+TCP | file-storage integration via mounted GCS credentials | `BE/apps/artwork-service/src/main.ts`, `BE/apps/artwork-service/.env.compose`, `BE/docker-compose.yml` |
| payments-service | HTTP+TCP | Stripe webhook/raw-body handling and blockchain confirmation worker imports | `BE/apps/payments-service/src/main.ts`, `BE/apps/payments-service/src/app.module.ts`, `BE/apps/payments-service/src/presentation/http/controllers/stripe-webhook.controller.ts` |
| orders-service | HTTP+TCP | blockchain listener consumer and outbox-driven event coordination | `BE/apps/orders-service/src/main.ts`, `BE/apps/orders-service/src/app.module.ts`, `BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts` |
| messaging-service | HTTP+TCP | websocket-enabled conversation runtime and GCS-backed media file surface | `BE/apps/messaging-service/src/main.ts`, `BE/apps/messaging-service/src/presentation/gateways/messaging.gateway.ts`, `BE/apps/messaging-service/.env.compose` |
| events-service | TCP-only | RabbitMQ/DB-connected worker-style microservice | `BE/apps/events-service/src/main.ts`, `BE/apps/events-service/.env.compose`, `BE/docker-compose.yml` |
| community-service | TCP-only | RabbitMQ/DB-connected community microservice | `BE/apps/community-service/src/main.ts`, `BE/apps/community-service/.env.compose`, `BE/docker-compose.yml` |
| notifications-service | HTTP-only in current bootstrap | mail delivery handlers plus background cron processor | `BE/apps/notifications-service/src/main.ts`, `BE/apps/notifications-service/src/app.module.ts`, `BE/apps/notifications-service/src/domain/processor/notification.processor.ts` |
| crm-service | HTTP-only orphan candidate | dormant runtime candidate; not part of active compose inventory | `BE/apps/crm-service/src/main.ts`, `BE/apps/crm-service/Dockerfile`, `BE/package.json` |

**HTTP+TCP workloads:** `identity-service`, `artwork-service`, `payments-service`, `orders-service`, `messaging-service`.

**TCP-only workloads:** `events-service`, `community-service`.

## Websocket-enabled workloads

| Workload | websocket-enabled evidence | Why it matters for Phase 22 |
|---|---|---|
| api-gateway | `AuctionGateway` serves namespace `/auction`; `MessagingGateway` serves namespace `/messaging` | The public edge is not only REST; websocket fan-out stays concentrated at the gateway. |
| messaging-service | `@WebSocketGateway({ cors: { origin: '*' }})` in `src/presentation/gateways/messaging.gateway.ts` | Messaging owns a second websocket surface behind the service boundary, so Phase 22 must decide whether that duplication is intentional runtime design or leftover experimentation. |

## Stateful dependencies

| Workload | Classification | Notes | Evidence |
|---|---|---|---|
| db-shared | stateful PostgreSQL | Shared-schema host used when `DB_STRATEGY=SHARED` | `BE/docker-compose.yml`, `BE/docker-compose.shared.yml`, `BE/libs/common/src/database/database.helper.ts` |
| db-identity / db-notifications / db-artwork / db-messaging / db-payments / db-orders / db-events / db-community | stateful PostgreSQL | Isolated per-service database containers exist in base compose and isolated overlay | `BE/docker-compose.yml`, `BE/docker-compose.isolated.yml` |
| rabbitmq | stateful broker | Carries outbox and event traffic across services | `BE/docker-compose.yml`, `BE/libs/rabbitmq/src/app.module.ts`, `BE/libs/outbox/src/outbox.processor.ts` |
| redis | stateful cache / ephemeral coordination store | Explicitly consumed by identity-service and provisioned in multiple service env files | `BE/docker-compose.yml`, `BE/apps/identity-service/src/app.module.ts`, `BE/apps/*/.env.compose` |
| mailhog | dev-only infra workload | SMTP sink and web UI for local delivery inspection, not core business data storage | `BE/docker-compose.yml`, `BE/apps/notifications-service/.env.compose`, `BE/apps/notifications-service/src/app.module.ts` |

## Singleton/background findings

| Component | singleton/background behavior | Operational implication | Evidence |
|---|---|---|---|
| OutboxProcessor | `@Cron(CronExpression.EVERY_5_SECONDS)` scans and publishes pending outbox rows | This is not a purely stateless HTTP path; duplicate schedulers would change publish behavior and retry pressure. | `BE/libs/outbox/src/outbox.processor.ts` |
| blockchain-event-listener.service.ts | Long-running blockchain poller / listener with cursor tracking, catch-up loops, and optional live filters | Scale behavior differs from request handlers because duplicate listeners can contend on chain cursor progress and event replay. | `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts` |
| Notifications cron processor | `@Cron(CronExpression.EVERY_5_MINUTES)` background notification work | Mail/notification handling includes scheduled work beyond synchronous HTTP requests. | `BE/apps/notifications-service/src/domain/processor/notification.processor.ts` |
| RetryStuckEthereumConfirmationsWorker | `@Cron(CronExpression.EVERY_30_SECONDS)` retries blockchain confirmation checks | Payments runtime includes recurring background confirmation work in addition to request/response traffic. | `BE/apps/payments-service/src/application/event-handlers/RetryStuckEthereumConfirmations.worker.ts` |

## Phase 22 carry-forward questions

1. Should websocket-enabled traffic stay split across both `api-gateway` and `messaging-service`, or is one of those surfaces legacy runtime overlap?
2. Are `events-service` and `community-service` intentionally TCP-only, or are their compose/Dockerfile HTTP-style ports legacy residue?
3. Is `notifications-service` meant to be HTTP-only, or is the gateway TCP client for notifications evidence of an unfinished transport contract?
4. Which singleton/background components must remain single-active, and which could safely scale horizontally after stronger coordination controls?
5. Should `crm-service` be revived as a real workload, or retired as orphaned repo evidence before deployment design continues?
