# 22-01 Service Role Catalog

## Scope and authority

This catalog is the ARCH-01 anchor for Phase 22. It classifies the current backend architecture from Phase 21 artifacts and direct source evidence only:

- `21-01-runtime-workload-inventory.md`
- `21-01-workload-classification.md`
- `21-02-dependency-environment-inventory.md`
- `21-02-external-integration-matrix.md`
- `21-03-runtime-drift-audit.md`
- `21-03-phase-22-handoff.md`
- Gateway and service source files such as `BE/apps/api-gateway/src/app.module.ts`, `BE/apps/api-gateway/src/config/microservices.config.ts`, service `main.ts` files, and `BE/libs/common/src/database/database.helper.ts`

Legacy Kubernetes manifests are treated as drift evidence, not as authority for current roles. This catalog does not choose platform topology, workload kinds, service exposure, or scaling policy.

## Role taxonomy

| Role | Meaning in this catalog | Current evidence pattern |
|---|---|---|
| Public HTTP gateway | Central HTTP API edge that owns controllers, validation, Swagger setup, CORS, raw-body gateway support, and TCP client fan-out | `api-gateway` bootstrap and `ClientsModule.register(...)` |
| HTTP+TCP domain service | Service that runs an HTTP Nest app and also exposes a Nest TCP microservice endpoint | `connectMicroservice(...)` plus `app.listen(...)` |
| TCP-only domain service | Service that uses `NestFactory.createMicroservice(...)` and does not start an HTTP app in the current bootstrap | `events-service`, `community-service` |
| HTTP-only service with transport ambiguity | Service that currently starts HTTP only while another workload expects a TCP endpoint | `notifications-service` |
| Realtime surface | Socket.IO gateway surface that accepts websocket traffic and relays or owns messaging behavior | gateway `/messaging`, gateway `/auction`, messaging-service gateway |
| Stateful infrastructure | Durable or broker/cache workloads used by services | PostgreSQL, RabbitMQ, Redis |
| Dev-only infrastructure | Local development support workloads | Mailhog |
| Singleton/background behavior | Scheduled or long-running processing that should not be treated like request-only stateless traffic | outbox scheduler, blockchain listener, payment confirmation retry worker, notifications cron |
| Orphan workload candidate | Code/image/script evidence exists without active Compose runtime inclusion | `crm-service` |

## Service role catalog

| Workload | Primary role | Secondary behaviors | Inbound surfaces | Outbound dependencies | Statefulness / singleton note | Evidence |
|---|---|---|---|---|---|---|
| api-gateway | Public HTTP gateway | Socket.IO gateway owner for auction and messaging namespaces; TCP RPC fan-out coordinator | HTTP API on `8081`; websocket namespaces `/auction` and `/messaging` | TCP clients to identity, artwork, payments, orders, messaging, notifications, events, and community services | Stateless edge by role, but websocket connection maps create runtime coordination concerns | `21-01-runtime-workload-inventory.md`, `BE/apps/api-gateway/src/app.module.ts`, `BE/apps/api-gateway/src/main.ts`, `BE/apps/api-gateway/src/config/microservices.config.ts` |
| identity-service | HTTP+TCP identity/auth domain service | Google OAuth provider wiring, cache-backed auth support, seller profile/user RPCs | HTTP `3001`; TCP `3101` | PostgreSQL via `DynamicDatabaseModule`, Redis, RabbitMQ, Google OAuth | Domain data persists in DB; Redis-backed auth/cache behavior is stateful dependency use | `21-01-runtime-workload-inventory.md`, `21-02-dependency-environment-inventory.md`, `BE/apps/identity-service/src/main.ts` |
| artwork-service | HTTP+TCP artwork/inventory domain service | File/image storage integration and auction artwork eligibility RPCs | HTTP `3002` by Compose/env intent; code fallback `3003`; TCP `3102` | PostgreSQL, RabbitMQ, GCS mounted credential file, orders-service caller edge | Domain data persists in DB; mounted GCS credential file is a runtime dependency | `21-01-runtime-workload-inventory.md`, `21-03-runtime-drift-audit.md`, `BE/apps/artwork-service/src/main.ts` |
| payments-service | HTTP+TCP payment domain service | Stripe webhook/raw-body handling; Ethereum confirmation and retry behavior | HTTP `3003` by Compose/env intent; code/Dockerfile/K8s `3005`; TCP `3103`; Stripe webhook path | PostgreSQL, RabbitMQ/outbox, Stripe, Blockchain RPC, platform wallet env | Payment state persists; confirmation retry worker is singleton/background behavior | `21-01-runtime-workload-inventory.md`, `21-02-external-integration-matrix.md`, `BE/apps/payments-service/src/main.ts`, `BE/apps/payments-service/src/presentation/http/controllers/stripe-webhook.controller.ts` |
| orders-service | HTTP+TCP order and auction orchestration service | Blockchain listener imports; outbox-driven event coordination; `orders-service -> artwork-service` RPC edge | HTTP `3004`; TCP `3104` | PostgreSQL, RabbitMQ/outbox, artwork-service TCP client, Blockchain RPC/contract config | Order and auction lifecycle state persists; blockchain listener behavior is singleton/background | `21-01-runtime-workload-inventory.md`, `21-02-dependency-environment-inventory.md`, `BE/apps/orders-service/src/main.ts` |
| messaging-service | HTTP+TCP messaging domain service | Service-side websocket gateway with permissive CORS; GCS-backed media surface | HTTP `3005` by Compose/env intent; code/Dockerfile/K8s `3004`; TCP `3105`; websocket gateway | PostgreSQL, RabbitMQ, GCS mounted credential file | Realtime state includes connected socket maps; data persists in DB | `21-01-workload-classification.md`, `BE/apps/messaging-service/src/main.ts`, `BE/apps/messaging-service/src/presentation/gateways/messaging.gateway.ts` |
| events-service | TCP-only events microservice | RabbitMQ/DB-connected worker-style service | TCP `3109` fallback; Compose/Dockerfile expose HTTP-style `3007` | PostgreSQL, RabbitMQ, Redis env surface | No current HTTP bootstrap; HTTP-style port evidence is unresolved | `21-01-workload-classification.md`, `21-03-runtime-drift-audit.md`, `BE/apps/events-service/src/main.ts` |
| community-service | TCP-only community microservice | RabbitMQ/DB-connected community domain service | TCP `3106` fallback; gateway config default `3109`; Compose/Dockerfile expose HTTP-style `3009` | PostgreSQL, RabbitMQ, Redis env surface | No current HTTP bootstrap; gateway/service port defaults conflict | `21-01-workload-classification.md`, `21-03-runtime-drift-audit.md`, `BE/apps/community-service/src/main.ts` |
| notifications-service | HTTP-only notification service with transport ambiguity | SMTP/Mailhog outbound mail; notification cron processor; gateway expects TCP client | HTTP bootstrap uses `process.env.port ?? 3002`; Compose publishes `3006`; gateway config expects TCP `3106` | PostgreSQL, RabbitMQ, SMTP/Mailhog | Background notification processor exists; transport contract is unresolved | `21-01-runtime-workload-inventory.md`, `21-03-runtime-drift-audit.md`, `BE/apps/notifications-service/src/main.ts`, `BE/apps/api-gateway/src/config/microservices.config.ts` |
| crm-service | Orphan workload candidate | Dormant HTTP service package and image contract | No active Compose workload; config helper supports `CRM_SERVICE` but gateway module does not register it | Unknown current runtime dependencies; possible DB/service dependencies require revalidation | Not current runtime truth until revived or retired | `21-01-runtime-workload-inventory.md`, `21-02-dependency-environment-inventory.md`, `BE/apps/api-gateway/src/config/microservices.config.ts` |
| rabbitmq | Stateful broker infrastructure | Internal event backbone for outbox and domain events | AMQP `5672`; management `15672` in Compose/dev evidence | Consumed by services through `RABBITMQ_URI` and `AppRabbitMQModule` | Stateful broker; queue/exchange behavior underpins async workflows | `21-01-runtime-workload-inventory.md`, `21-02-external-integration-matrix.md`, `BE/libs/outbox/src/outbox.processor.ts` |
| redis | Stateful cache infrastructure | Identity cache consumer; env surface appears broader than proven direct use | Redis `6379` | Consumed directly by identity-service; possible surfaced dependency for other services requires confirmation | Cache/ephemeral coordination dependency | `21-01-workload-classification.md`, `21-02-dependency-environment-inventory.md` |
| mailhog | Dev-only SMTP sink | Local mail capture UI | SMTP `1025`; web UI `8025` in local/dev evidence | Used by notifications-service SMTP config | Dev support workload, not business-state authority | `21-01-runtime-workload-inventory.md`, `21-02-external-integration-matrix.md` |
| db-shared | Stateful PostgreSQL shared database option | Schema-per-service mode via `DB_STRATEGY=SHARED` and `ensureSchemaExists(...)` | PostgreSQL container in Compose shared profile | All domain services may connect through shared schema strategy | Durable state; schema creation before TypeORM connection is a runtime coupling | `21-02-dependency-environment-inventory.md`, `BE/libs/common/src/database/database.helper.ts` |
| isolated PostgreSQL containers | Grouped stateful infrastructure option | Per-service DB containers for identity, notifications, artwork, messaging, payments, orders, events, and community | Per-service PostgreSQL containers in isolated profile | Services can use service-specific DB env names when strategy is isolated | Current isolated mode is not uniformly switched in env evidence | `21-01-runtime-workload-inventory.md`, `21-02-dependency-environment-inventory.md`, `21-03-runtime-drift-audit.md` |

## Dependency graph summary

- Gateway RPC fan-out: `api-gateway -> identity-service`, `api-gateway -> artwork-service`, `api-gateway -> payments-service`, `api-gateway -> orders-service`, `api-gateway -> messaging-service`, `api-gateway -> notifications-service`, `api-gateway -> events-service`, and `api-gateway -> community-service` through `ClientsModule.register(...)` and `MICROSERVICES.*`.
- Dormant gateway config: `MICROSERVICES.CRM_SERVICE` has config support, but `ApiGatewayModule` does not register it and current Compose does not include `crm-service`.
- Non-gateway RPC: `orders-service -> artwork-service` exists for artwork/auction status coordination.
- Database coupling: domain services share `DynamicDatabaseModule` behavior through `DB_STRATEGY`, with `db-shared` schema mode and grouped isolated PostgreSQL containers both present in repository evidence.
- RabbitMQ backbone: service modules and `OutboxProcessor` use RabbitMQ for event publication and asynchronous domain propagation.
- External-provider edges: payments uses Stripe and Blockchain RPC; identity uses Google OAuth; notifications uses SMTP/Mailhog; artwork and messaging depend on GCS mounted credential files.
- Realtime edges: `api-gateway` owns `/messaging` and `/auction` gateway surfaces, while `messaging-service` also declares a websocket gateway.

## Open architecture questions

1. Should `notifications-service` expose a TCP microservice target to match gateway registration, or should gateway notification routing be reclassified?
2. Are `events-service` and `community-service` intentionally TCP-only, or do their HTTP-style Compose/Dockerfile ports represent stale runtime assumptions?
3. Is websocket ownership meant to be centralized in `api-gateway`, split with `messaging-service`, or treated as duplicated experimentation?
4. Is `crm-service` a future workload, an intentionally dormant module, or legacy code that should be retired?
5. Should shared-schema `db-shared` remain the conceptual default, or should isolated database evidence become the production-facing contract in a later phase?
6. Which singleton/background behaviors need explicit single-active ownership before later phases define platform operations?
