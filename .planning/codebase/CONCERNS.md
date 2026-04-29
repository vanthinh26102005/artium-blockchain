# Codebase Concerns

**Analysis Date:** 2026-04-21

---

## Security Concerns

### SEC-1: Secrets Committed to Git in docker-compose.yml
- **Severity:** High
- **Files:** `BE/docker-compose.yml`
- **Issue:** Multiple production-sensitive credentials hardcoded in the committed `docker-compose.yml`:
  - `JWT_SECRET: 5c3bf5bfc210c43aa7342efcb40bc0eb6831ac38ea12de39578d09afaec6d37e` (lines covering api-gateway and identity-service environments)
  - `GOOGLE_CLIENT_ID: 873456140774-gi4pt3aq0m3gpd5f10uv4ivv59lvbgej.apps.googleusercontent.com`
  - `GOOGLE_CLIENT_SECRET: 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`
  - `STRIPE_API_KEY` default: `sk_test_51SodCXI4FRlZsKgrH8qv6f9Qe7crzB3xCalWNc6DDEPk46Ps3EGUORTUK3TF0D31ezV2Jd7R2eXQL1JfTyzikhIC00teYO7dGE` (line 605)
  - All database passwords `"1"` for every service
  - RabbitMQ credentials `myuser/mypassword`
  - `.gitignore` only ignores `.env` and `.env.local`, not `docker-compose.yml`
- **Impact:** Any repo access leaks JWTs, OAuth credentials, and a Stripe test key. Google OAuth credentials allow impersonating the app.
- **Fix Direction:** Move all secrets to `.env` files (gitignored). Use `${VAR}` interpolation in docker-compose. Create `.env.example` documenting required variables. Rotate all exposed credentials immediately. Add `docker-compose.yml` secret scanning to CI.

---

### SEC-2: Secrets Committed to Kubernetes Manifests
- **Severity:** High
- **Files:** `BE/infrastructure/k8s/infras/rabbitmq-deployment.yaml`, `BE/infrastructure/k8s/services/identity/postgres-identity-statefulset.yaml` (and other StatefulSets)
- **Issue:** `RABBITMQ_DEFAULT_PASS: "mypassword"` and `POSTGRES_PASSWORD: "1"` hardcoded as plaintext env values in committed K8s YAML. No Kubernetes Secrets objects used.
- **Impact:** Anyone with repo read access can extract database and broker credentials.
- **Fix Direction:** Create `kind: Secret` objects (or use an external secrets manager like Vault or GCP Secret Manager). Reference secrets via `secretKeyRef` in deployment specs. Do not commit plaintext values.

---

### SEC-3: CORS Open to All Origins
- **Severity:** High
- **Files:** `BE/apps/api-gateway/src/main.ts` (line `origin: true`)
- **Issue:** API gateway uses `origin: true` which reflects any `Origin` header. Combined with `credentials: true`, this allows any domain to make credentialed cross-origin requests.
- **Impact:** CSRF-capable attack surface from any origin. Sensitive user data (JWT cookies if ever used) exposed to third-party sites.
- **Fix Direction:** Replace `origin: true` with an explicit allowlist: `origin: ['https://artium.com', 'https://www.artium.com', process.env.FRONTEND_URL]`.

---

### SEC-4: No Rate Limiting on API Endpoints
- **Severity:** High
- **Files:** `BE/apps/api-gateway/src/main.ts`, all controllers
- **Issue:** Zero usage of `@nestjs/throttler` or any rate-limiting guard across the entire API. The OTP service implements its own Redis-based per-identifier limit (5 attempts/hour), but HTTP endpoints like `/auth/login`, `/auth/register`, `/auth/forgot-password`, and `/payments/**` have no rate limiting.
- **Impact:** Brute-force attacks on login, OTP exhaustion via distributed IPs, abuse of Stripe payment intent creation, DoS via expensive queries.
- **Fix Direction:** Install `@nestjs/throttler` with Redis storage. Apply a global `ThrottlerGuard` with conservative limits. Add stricter limits on auth and payment endpoints using `@Throttle()` decorator overrides.

---

### SEC-5: Smart Contract — No Upgradeability / No Pause Mechanism
- **Severity:** High
- **Files:** `BE/smart-contracts/contracts/ArtAuctionEscrow.sol`
- **Issue:** The contract is not upgradeable (no Proxy pattern) and has no emergency pause mechanism. The `arbiter` address is set once at constructor time and is immutable. If the arbiter key is compromised or a bug is found, there is no recovery path without redeploying and migrating all live auctions.
- **Impact:** A single arbiter key compromise gives full dispute-resolution power with no override. Contract bugs require full redeployment with no migration path.
- **Fix Direction:** Add OpenZeppelin `Pausable` for emergency stops. Consider `Ownable` with an admin that can reassign the arbiter. Document a migration playbook. For production, consider a proxy upgrade pattern (UUPS or TransparentProxy).

---

### SEC-6: Smart Contract — Arbiter is Single Point of Trust
- **Severity:** High
- **Files:** `BE/smart-contracts/contracts/ArtAuctionEscrow.sol` — `resolveDispute()`, `onlyArbiter` modifier
- **Issue:** A single EOA (externally owned account) holds all dispute resolution power. `resolveDispute(orderId, favorBuyer)` is callable only by this one address with no multisig or DAO governance.
- **Impact:** Compromised arbiter key can steal funds from all disputed auctions (by always resolving `favorBuyer=false` → pays seller). No time-lock or multi-sig.
- **Fix Direction:** Replace single arbiter EOA with a Gnosis Safe multisig. Add a time-lock on dispute resolution. Consider a DAO-based arbitration with multiple voters.

---

### SEC-7: Smart Contract Unaudited for Production
- **Severity:** High
- **Files:** `BE/smart-contracts/contracts/ArtAuctionEscrow.sol`
- **Issue:** The contract handles real ETH escrow (auction funds held on-chain). It has not been mentioned as audited. The plan history shows it was recently rewritten from a 137-line version with critical gaps (no reserve price, funds lockable forever) to the current 6-state machine. The rewrite was only planned, tests were described as needing a full rewrite.
- **Impact:** Smart contract bugs holding ETH are irreversible. Funds can be permanently locked or stolen.
- **Fix Direction:** Commission a third-party security audit before mainnet deployment. Run formal verification on the state machine. Deploy only to testnets until audit is complete. Add comprehensive edge-case fuzzing tests.

---

### SEC-8: Redis Has No Authentication Configured
- **Severity:** Medium
- **Files:** `BE/docker-compose.yml` (redis service), `BE/infrastructure/k8s/infras/redis-deployment.yaml`
- **Issue:** Redis is deployed without a password (`requirepass` not set). Any container or pod on the same network can read/write OTP cache, session data, and rate-limit counters.
- **Impact:** OTP values could be read by a malicious container, allowing account takeover. Rate-limit counters could be reset.
- **Fix Direction:** Set `requirepass` in Redis config. Pass `REDIS_PASSWORD` to all services. Use Kubernetes Secrets for the password.

---

### SEC-9: Seller Profile Deletion Without Artwork Dependency Check
- **Severity:** Medium
- **Files:** `BE/apps/identity-service/src/application/commands/handlers/DeleteSellerProfile.command.handler.ts` (line 49 TODO)
- **Issue:** Deleting a seller profile does not verify whether the seller has active artworks in artwork-service. The cross-service check is explicitly TODO'd out.
- **Impact:** Orphaned artworks with no seller. Payments to non-existent seller profiles.
- **Fix Direction:** Before deletion, send a TCP RPC to artwork-service to count active artworks. Block deletion if count > 0. Emit `SellerProfileDeletedEvent` via outbox for downstream cleanup.

---

### SEC-10: Messaging Service — Group Permission Check Missing
- **Severity:** Medium
- **Files:** `BE/apps/messaging-service/src/application/messaging.service.ts` (line 48 TODO)
- **Issue:** `addUsersToGroup()` has a TODO noting that `actorId` membership and permission are not verified before adding users to a conversation. Any authenticated user can add anyone to any group conversation by ID.
- **Impact:** Users can be added to conversations they don't control. Potential for targeted harassment / spam.
- **Fix Direction:** Before adding participants, verify `actorId` exists in the conversation's participant list and optionally has an admin role.

---

## Performance Risks

### PERF-1: TypeORM `DB_SYNCHRONIZE: true` in All Services
- **Severity:** High
- **Files:** `BE/docker-compose.yml` (all services), `BE/libs/common/src/database/database.helper.ts`
- **Issue:** Every microservice runs with `DB_SYNCHRONIZE: "true"` in docker-compose. The `database.helper.ts` sets `synchronize: config.get<boolean>('DB_SYNCHRONIZE', !isProduction)` — meaning if `NODE_ENV` is not explicitly set to `production`, synchronize defaults to `true`. No migration files exist anywhere in the codebase.
- **Impact:** On restart, TypeORM may drop or alter columns silently. In shared DB mode (`DB_STRATEGY=SHARED`), multiple services synchronizing the same DB simultaneously can cause race conditions and data loss.
- **Fix Direction:** Disable synchronize in all environments. Implement TypeORM migrations for each service. Set `DB_SYNCHRONIZE: "false"` in docker-compose and K8s. Add a `migration:run` step to the deployment pipeline.

---

### PERF-2: CreateOrder Handler Has No Transaction Wrapping
- **Severity:** High
- **Files:** `BE/apps/orders-service/src/application/commands/handlers/CreateOrder.command.handler.ts`
- **Issue:** `execute()` creates an Order record, then iterates over items creating `OrderItem` records in a `for` loop without a database transaction. If an `orderItemRepo.create()` fails mid-loop, the Order exists with partial items — corrupted state.
- **Impact:** Data inconsistency — orders with missing items, incorrect subtotals, partial fulfillment records.
- **Fix Direction:** Wrap the entire handler in `DataSource.transaction()` or use `ITransactionService`. Apply the same pattern used in payments-service handlers.

---

### PERF-3: N+1 Potential in Messaging Service — Notification Fan-out
- **Severity:** Medium
- **Files:** `BE/apps/messaging-service/src/application/messaging.service.ts` — `postMessage()` method
- **Issue:** `postMessage()` fetches all participants with `this.participantRepository.find({where: {conversationId}})`, then calls `notifyUser()` per recipient via HTTP. For a group chat with 50 participants, this is 50 sequential HTTP calls to `http://notification-service/api/v1/notify` — a hardcoded URL that bypasses TCP/RabbitMQ.
- **Impact:** High latency on message posting in group chats. Direct HTTP calls bypass service discovery, load balancing, and the established RabbitMQ event bus.
- **Fix Direction:** Replace direct HTTP fan-out with a single RabbitMQ event publish (e.g., `NewMessageEvent`) that notifications-service consumes. Remove `HttpService` from messaging-service. Use the outbox pattern already established.

---

### PERF-4: Moodboard `findAll` Without Pagination
- **Severity:** Medium
- **Files:** `BE/apps/community-service/src/infrastructure/repositories/moodboard.repository.ts` — `.getMany()` (line 177)
- **Issue:** Moodboard listing queries use `.getMany()` without `take`/`skip`. Could load unbounded result sets.
- **Impact:** Memory exhaustion and slow responses as moodboard count grows.
- **Fix Direction:** Add mandatory pagination (`take`, `skip`) to all list queries. Return `{ data, total }` tuples using `getManyAndCount()`.

---

### PERF-5: Outbox Processor Processes Up to 50 Messages Every 5 Seconds Per Service
- **Severity:** Medium
- **Files:** `BE/libs/outbox/src/outbox.processor.ts`
- **Issue:** Each service runs its own `@Cron(EVERY_5_SECONDS)` outbox processor with a hard `limit(50)` batch. Under load, a high-traffic service may accumulate a backlog faster than the processor can drain it.
- **Impact:** Event delivery lag during traffic spikes. Notification and order status updates delayed.
- **Fix Direction:** Make batch size and cron frequency configurable per service. Add a backlog metric (count of PENDING messages) to the `@app/metrics` library for monitoring and alerting.

---

## Reliability Risks

### REL-1: Missing Events — 8+ Outbox TODOs Never Published
- **Severity:** High
- **Files:**
  - `BE/apps/identity-service/src/application/commands/handlers/UpdateVerificationStatus.command.handler.ts` (line 75)
  - `BE/apps/identity-service/src/application/commands/handlers/DeleteSellerProfile.command.handler.ts` (line 70)
  - `BE/apps/identity-service/src/application/commands/handlers/CreateSellerProfile.command.handler.ts` (line 81)
  - `BE/apps/identity-service/src/application/commands/handlers/UpdateSellerProfile.command.handler.ts` (line 74)
  - `BE/apps/identity-service/src/application/commands/handlers/UpdatePaymentOnboarding.command.handler.ts` (line 93)
  - `BE/apps/community-service/src/application/commands/followers/handlers/FollowUser.command.handler.ts` (line 73)
  - `BE/apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.ts` (line 45)
  - `BE/apps/community-service/src/application/commands/moments/handlers/CreateMoment.command.handler.ts` (lines 48–49)
- **Issue:** 8+ command handlers have TODO comments where `OutboxService.createOutboxMessage()` calls should be. Mutations complete but downstream services (notifications, activity feed, CRM) never receive the events.
- **Impact:** Notifications not sent for seller verification, profile changes, follows, new moments. Activity feeds and CRM are starved of data. Cross-service consistency breaks silently.
- **Fix Direction:** Each TODO should be replaced with an `outboxService.createOutboxMessage()` call using the appropriate exchange/routing key. Event payload DTOs need to be defined in `@app/rabbitmq`.

---

### REL-2: Blockchain Event Listener — No Recovery If Node Goes Offline
- **Severity:** High
- **Files:** `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts`
- **Issue:** The listener uses `contract.on(event, handler)` for live events. Backfill logic exists for startup, but if the RPC provider disconnects mid-session (WebSocket drop), the listener becomes silent. No reconnect logic or provider health monitoring is visible.
- **Impact:** On-chain auction events (bids, deliveries, disputes) stop creating/updating off-chain Order records. The plan explicitly notes "Event listener misses events on restart" as a post-MVP risk.
- **Fix Direction:** Implement provider reconnect logic with exponential backoff. Use `provider.on('error')` and `provider.on('close')` to trigger reconnection. Alternatively, poll `queryFilter` on a cron schedule as a fallback for events missed during downtime.

---

### REL-3: RabbitMQ Single Instance — No High Availability
- **Severity:** High
- **Files:** `BE/docker-compose.yml` (rabbitmq service), `BE/infrastructure/k8s/infras/rabbitmq-deployment.yaml`
- **Issue:** RabbitMQ runs as a single container (not a cluster). The entire async event bus — outbox delivery, blockchain event fan-out, notifications — depends on it. The K8s deployment uses a single replica with no HA configuration.
- **Impact:** RabbitMQ downtime stops all async processing: notifications, outbox delivery, order status updates. The outbox processor retries, but messages pile up.
- **Fix Direction:** Configure a RabbitMQ cluster (3 nodes minimum for quorum queues). Use `rabbitmq:management` with cluster plugin. For K8s, use the RabbitMQ Cluster Operator.

---

### REL-4: Messaging Service Notifies via HTTP to Hardcoded URL
- **Severity:** High
- **Files:** `BE/apps/messaging-service/src/application/messaging.service.ts` (line 95)
- **Issue:** `notifyUser()` calls `http://notification-service/api/v1/notify` — a hardcoded URL that doesn't match the actual service name (`notifications-service`), port, or API prefix. This endpoint does not appear to exist in notifications-service's controllers.
- **Impact:** All message notifications silently fail. The catch block only logs the error. Recipients never receive push/email notifications for new messages.
- **Fix Direction:** Remove `HttpService` from messaging-service. Publish `NewMessageEvent` via outbox to RabbitMQ. The `NewMessageEvent.event.handler.ts` in notifications-service (with its own TODO to fetch sender/recipient details) should consume this.

---

### REL-5: CRM Service Has Zero Application Logic
- **Severity:** Medium
- **Files:** `BE/apps/crm-service/src/application/index.ts` (empty file), `BE/apps/crm-service/src/presentation/index.ts` (empty file)
- **Issue:** CRM service has domain entities (contacts, promotions, campaigns, segments, private views) but zero application layer: no commands, no queries, no handlers, no controllers. The service starts but provides no functionality.
- **Impact:** Any feature depending on CRM (email campaigns, customer segments, private view invitations) is broken.
- **Fix Direction:** Either implement the application layer or remove the service from the monorepo until it's ready to avoid false signals.

---

### REL-6: Orders Service — `artworkTitle` Always Stored as Empty String
- **Severity:** Medium
- **Files:** `BE/apps/orders-service/src/application/commands/handlers/CreateOrder.command.handler.ts` (line 62)
- **Issue:** `artworkTitle: ''` is hardcoded when creating `OrderItem` records. The title is never fetched from artwork-service.
- **Impact:** Order history, invoices, and receipts display empty artwork titles. Affects UX and business reporting.
- **Fix Direction:** Fetch artwork details from artwork-service via TCP RPC before creating order items. Alternatively, include `artworkTitle` in the `CreateOrderDto` payload sent from the API gateway.

---

## Technical Debt

### DEBT-1: No Backend Test Coverage
- **Severity:** High
- **Files:** All `BE/apps/` services
- **Issue:** Zero `.spec.ts` or `.test.ts` files exist in any of the 10 microservices. The only test file in the backend is `BE/smart-contracts/test/ArtAuctionEscrow.test.ts` (Hardhat/Chai tests for the Solidity contract). No unit or integration tests for NestJS services.
- **Impact:** Any refactoring, dependency update, or feature addition risks regressions with no safety net. Complex handlers (blockchain event handler: 512 lines, artwork controller: 1810 lines) are completely untested.
- **Fix Direction:** Start with unit tests for domain services (`OtpService`, `StripeService`). Add integration tests for critical command handlers (`CreateOrder`, `LoginByWallet`, `CreateSellerProfile`). Use Jest's built-in NestJS testing utilities. Target 60% coverage for critical paths first.

---

### DEBT-2: Massive Controllers Violating Single Responsibility
- **Severity:** Medium
- **Files:**
  - `BE/apps/artwork-service/src/presentation/http/controllers/artworks.controller.ts` (1810 lines)
  - `BE/apps/artwork-service/src/presentation/http/controllers/artwork-folders.controller.ts` (1064 lines)
  - `BE/apps/identity-service/src/presentation/http/controllers/seller-profiles.controller.ts` (953 lines)
  - `BE/apps/identity-service/src/presentation/http/controllers/users.controller.ts` (812 lines)
  - `BE/apps/notifications-service/src/presentation/http/controllers/notification-history.controller.ts` (787 lines)
- **Issue:** Service-layer controllers are 800–1810 lines. These mirror the API gateway controllers, creating a dual-controller pattern where both layers have large files. The service controllers exist largely as microservice message pattern handlers.
- **Impact:** Extremely hard to navigate and maintain. Any change to a single endpoint requires modifying 2+ files.
- **Fix Direction:** Split oversized controllers by domain subdomain (e.g., `artworks-crud.controller.ts`, `artworks-upload.controller.ts`, `artworks-folders.controller.ts`). Keep API gateway controllers thin — just proxy to microservice.

---

### DEBT-3: Messaging Service Bypasses Repository Pattern
- **Severity:** Medium
- **Files:** `BE/apps/messaging-service/src/application/messaging.service.ts`, `BE/apps/messaging-service/src/application/commands/handlers/PostMessage.command.handler.ts`
- **Issue:** The messaging service has a central `MessagingService` that injects TypeORM `Repository<>` directly (bypassing the DDD repository abstraction). Some command handlers also inject `@InjectRepository(Message)` directly, and `PostMessageCommandHandler` has a duplicate `@InjectRepository(Message)` injection masquerading as `conversationRepository` (bug: wrong entity type).
- **Impact:** Inconsistent architecture. `PostMessageCommandHandler` injects `Repository<Message>` as `conversationRepository` — a latent bug that silently uses the wrong repository.
- **Fix Direction:** Define `IMessageRepository` and `IConversationRepository` interfaces with Symbol-based DI tokens (matching the pattern in other services). Implement in `infrastructure/repositories/`. Remove direct TypeORM injections from command handlers.

---

### DEBT-4: Extensive Mock Data in Production FE Code
- **Severity:** Medium
- **Files:**
  - `FE/artium-web/src/@domains/home/components/DashboardView.tsx` (imports `mockHomeArtworks`, `mockHomeEvents`)
  - `FE/artium-web/src/@domains/discover/components/inspire/InspireGrid.tsx` (imports `mockInspire`)
  - `FE/artium-web/src/@domains/quick-sell/components/checkout/QuickSellPaymentForm.tsx` (uses `mockPaymentAdapter`)
  - `FE/artium-web/src/@domains/quick-sell/views/QuickSellCheckoutPageView.tsx` (uses `calculateMockShipping`, `calculateMockTax`)
  - `FE/artium-web/src/@domains/events/components/detail/EventOverviewCard.tsx` (uses `useMockAuth`)
  - 10+ discover components import types from mock files
- **Issue:** Production page views render mock data (hardcoded artwork arrays, fake events, mock payment processing, mock auth state). The quick-sell checkout uses a `mockPaymentAdapter` that simulates Stripe without real backend calls.
- **Impact:** Users see static fake data. Payments are simulated — no real money movement. The events page uses a mock auth hook instead of actual auth state.
- **Fix Direction:** Replace mock data imports with API calls (React Query / SWR). Replace `mockPaymentAdapter` with a real Stripe adapter. Replace `useMockAuth` with the actual auth hook from NextAuth.

---

### DEBT-5: Mixed Vietnamese/English Error Messages
- **Severity:** Low
- **Files:** `BE/apps/identity-service/src/domain/services/otp.service.ts`, `BE/apps/identity-service/src/domain/services/registration.service.ts`, `BE/apps/notifications-service/src/application/queries/handlers/GetNotificationHistory.query.handler.ts`
- **Issue:** OTP error messages are in Vietnamese (`"Bạn đã nhập sai OTP quá 5 lần"`, `"OTP đã hết hạn"`) while the rest of the codebase uses English. This also affects API consumers.
- **Impact:** Inconsistent API responses. Frontend must handle both languages. Non-Vietnamese developers cannot read error logs.
- **Fix Direction:** Standardize all error messages to English. If i18n is needed, add a proper i18n solution with locale keys.

---

### DEBT-6: No .env.example Files for Any Service
- **Severity:** Medium
- **Files:** `BE/apps/*/` (none have `.env.example`)
- **Issue:** Services load config from `.env.local` files (per CLAUDE.md), but no `.env.example` template exists. The only `.env.example` is in a skill directory. New developers cannot know what variables are required without reading docker-compose and source code.
- **Impact:** Difficult onboarding. Missing env vars cause runtime errors rather than startup validation failures.
- **Fix Direction:** Create `.env.example` for each service listing all required variables with placeholder values. Add startup validation using NestJS `ConfigModule` with `validationSchema` (Joi) or `validate` function.

---

## Incomplete Features

### INC-1: Blockchain Integration Plan Entirely Pending
- **Severity:** High
- **Files:** `BE/plans/202603231253-blockchain-integration/plan.md`
- **Issue:** The blockchain integration plan documents 4 phases, all marked `pending`. Despite the `libs/blockchain/` library existing, the plan states "zero integration between on-chain and off-chain systems." SIWE wallet auth has handlers but the plan phase for it is marked pending.
- **Impact:** The core value proposition of the platform (on-chain auction escrow with NFT provenance) is not fully wired to the backend business logic.
- **Fix Direction:** Execute the plan phases sequentially per the documented dependency order: Phase 0 → Phase 1 + Phase 2 (parallel) → Phase 3.

---

### INC-2: Quick-Sell Payment Flow Uses Mock Adapter in Production
- **Severity:** High
- **Files:** `FE/artium-web/src/@domains/quick-sell/payments/mockPaymentAdapter.ts`, `FE/artium-web/src/@domains/quick-sell/components/checkout/QuickSellPaymentForm.tsx`
- **Issue:** The entire quick-sell checkout payment flow (invoice → payment → confirmation) uses `mockPaymentAdapter` which returns fake `clientSecret` and `paymentIntentId`. No real Stripe integration exists at the frontend checkout level.
- **Impact:** Quick-sell is completely non-functional for real money movement despite a backend Stripe service existing.
- **Fix Direction:** Implement a real `StripePaymentAdapter` using `@stripe/stripe-js` that calls the backend `/payments/invoices/:id/payment-intent` endpoint. Replace `mockPaymentAdapter` usage.

---

### INC-3: Moment Creation Missing Tagged Artwork and Event Publishing
- **Severity:** Medium
- **Files:** `BE/apps/community-service/src/application/commands/moments/handlers/CreateMoment.command.handler.ts` (lines 48–49)
- **Issue:** `CreateMoment` handler has two TODOs: tagged artworks are not linked, and no outbox event is published. The FE `PostMomentModal.tsx` also has a TODO for the actual API call.
- **Impact:** Moments feature is incomplete end-to-end — the modal doesn't call the API, and even if it did, tagged artworks wouldn't be stored.
- **Fix Direction:** Implement artwork tagging in the domain model. Add outbox event publish for activity feed. Connect `PostMomentModal` to the actual API endpoint.

---

### INC-4: Promo Code Validation Not Implemented in FE Checkout
- **Severity:** Medium
- **Files:** `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx` (line 153)
- **Issue:** Promo code input exists in the buyer checkout UI but validation is TODO'd: `// TODO: Validate promo code via API`.
- **Impact:** Users can enter promo codes with no effect. No discount is applied. Can cause confusion and trust issues.
- **Fix Direction:** Call a backend `/payments/promo-codes/validate` endpoint on promo code submission. Apply discount to the checkout total.

---

### INC-5: Follow Functionality Not Wired in Artwork Detail
- **Severity:** Low
- **Files:** `FE/artium-web/src/@domains/artwork-detail/components/TabsSection/AboutCreator.tsx` (line 17)
- **Issue:** "Follow" button in artwork detail page has a TODO — click handler not implemented.
- **Fix Direction:** Connect to `POST /community/followers` API endpoint using existing follow command infrastructure.

---

## Fragile Areas

### FRAG-1: Shared DB Mode Race Condition on Schema Sync
- **Severity:** High
- **Files:** `BE/libs/common/src/database/dynamic-database.module.ts`, `BE/libs/common/src/database/database.helper.ts`
- **Issue:** In `SHARED` DB mode, `ensureSchemaExists()` creates a PostgreSQL schema before TypeORM synchronizes. When multiple services start simultaneously (e.g., docker-compose up), multiple services race to create schemas and synchronize tables. The `DynamicDatabaseModule` has a `CRITICAL` comment noting this sequence dependency.
- **Impact:** Startup race condition causes `42P01 undefined_table` errors, service startup failures, or partial schema creation.
- **Fix Direction:** Implement a distributed lock (Redis-based) for the schema creation + sync phase. Or eliminate synchronize in favor of a single migration runner executed before services start.

---

### FRAG-2: Blockchain Event Handler — 512 Lines, Zero Tests
- **Severity:** High
- **Files:** `BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts` (512 lines)
- **Issue:** The most complex handler in the codebase — consuming 12 different blockchain events and mapping them to order state machine transitions — has no tests. Any change to event payload shapes or order status logic risks undetected regressions.
- **Impact:** Silent order state corruption if event payloads change (e.g., after contract redeployment). No way to verify correct behavior.
- **Fix Direction:** Add unit tests for each `@RabbitSubscribe` handler method. Mock `IOrderRepository`. Test each blockchain event type → expected order status transition mapping.

---

### FRAG-3: `artworkTitle: ''` in OrderItem Creates Data Integrity Risk
- **Severity:** Medium
- **Files:** `BE/apps/orders-service/src/application/commands/handlers/CreateOrder.command.handler.ts` (line 62)
- **Issue:** Order items are created with an empty `artworkTitle` because cross-service data fetching is not implemented. Later code reading this field will always get empty strings.
- **Impact:** Invoices, receipts, and order confirmations will show blank artwork names. Downstream analytics/CRM have no meaningful title data.

---

### FRAG-4: `PostMessageCommandHandler` Has Wrong Repository Type
- **Severity:** Medium
- **Files:** `BE/apps/messaging-service/src/application/commands/handlers/PostMessage.command.handler.ts` (lines 21–22)
- **Issue:** The constructor injects `@InjectRepository(Message)` twice — once for `messageRepository` and again for `conversationRepository`. The second injection uses `Message` entity but the variable is named `conversationRepository`. Any code calling methods that expect `Conversation` entity data will get `Message` data or runtime errors.
- **Fix Direction:** Fix by injecting `@InjectRepository(Conversation)` for `conversationRepository`. Better: migrate to the proper repository abstraction pattern.

---

## Architectural Risks

### ARCH-1: No Database Migrations — Only TypeORM Synchronize
- **Severity:** High
- **Files:** All services — no `migrations/` directory exists anywhere
- **Issue:** Zero TypeORM migration files across 10 microservices. Schema changes are managed entirely by `synchronize: true`. This is incompatible with production deployments where data must be preserved and schema changes must be reversible.
- **Impact:** Any production deployment with schema changes will either fail (synchronize off) or silently drop/alter columns (synchronize on). No rollback path.
- **Fix Direction:** Generate a baseline migration for each service using `typeorm migration:generate`. Implement a migration-first workflow. Disable synchronize in all non-development environments.

---

### ARCH-2: Blockchain Integration Plan — Event Listener Missed Events Risk
- **Severity:** High
- **Files:** `BE/plans/202603231253-blockchain-integration/plan.md`
- **Issue:** The plan explicitly acknowledges: "Event listener misses events on restart — Post-MVP: add `queryFilter` backfill on startup." While backfill logic exists in `blockchain-event-listener.service.ts`, it relies on a `BlockchainEventCursor` entity that persists the last processed block. If this cursor entity's DB table doesn't exist (race condition with sync) or gets corrupted, events are lost.
- **Impact:** Auction events (bids, deliveries) may never reach the orders-service, leaving orders in stale states permanently.
- **Fix Direction:** Ensure `BlockchainEventCursor` is always initialized on startup. Add an idempotency check using `BlockchainProcessedEvent` entity (already exists) before processing any event. Add monitoring for cursor staleness.

---

### ARCH-3: TCP Microservice Communication Has No Circuit Breaker
- **Severity:** Medium
- **Files:** `BE/apps/api-gateway/src/presentation/http/utils/` — `sendRpc()` helper used across all gateway controllers
- **Issue:** API gateway uses `sendRpc()` (wrapping `ClientProxy.send()`) to call all downstream microservices synchronously via TCP. There is no circuit breaker pattern, timeout configuration, or fallback. If any single service is slow or down, the gateway request hangs indefinitely (or until NestJS default timeout).
- **Impact:** A slow `artwork-service` will cause the API gateway to queue up requests until OOM. Single service degradation cascades to full gateway failure.
- **Fix Direction:** Add configurable timeouts to `sendRpc()`. Implement circuit breaker pattern using a library like `opossum`. Add health check endpoints to each service and expose them through the gateway.

---

### ARCH-4: `DB_STRATEGY=SHARED` Not Intended for Production
- **Severity:** Medium
- **Files:** `BE/docker-compose.yml` (default `${DB_STRATEGY:-SHARED}`), `BE/libs/common/src/database/dynamic-database.module.ts`
- **Issue:** Docker-compose defaults to `DB_STRATEGY=SHARED` (all services use one PostgreSQL instance, separate schemas). This simplifies dev setup but violates microservice data isolation principles. A single DB failure affects all services. Schema-level isolation provides false separation.
- **Impact:** No true data isolation between services in default configuration. Shared DB is a single point of failure for the entire platform.
- **Fix Direction:** Default docker-compose to `ISOLATED` mode for development. Document `SHARED` as a testing convenience only. Ensure K8s deployments use `ISOLATED` with separate StatefulSets (which they currently do).

---

### ARCH-5: No API Versioning Strategy
- **Severity:** Medium
- **Files:** `BE/apps/api-gateway/src/main.ts`, all controllers
- **Issue:** No URL versioning (`/api/v1/`, `/api/v2/`), header versioning, or NestJS versioning middleware is configured. The Swagger prefix is `/api` but routes have no version segment.
- **Impact:** Any breaking API change requires coordinating FE and BE deployments simultaneously. No ability to run multiple API versions during rollout.
- **Fix Direction:** Add NestJS `enableVersioning()` with `URI` type. Prefix all routes with `v1`. Future breaking changes can introduce `v2` routes alongside `v1`.

---

*Concerns audit: 2026-04-21*
