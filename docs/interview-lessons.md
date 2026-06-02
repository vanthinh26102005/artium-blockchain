# Artium Interview Lessons

Purpose: a compact study note for explaining this project in interviews. It focuses on tech stack, system flows, state transitions, and strong engineering points.

## 1. Project Summary

Artium is an art marketplace platform with normal commerce, seller inventory, quick-sell invoices, real-time messaging, events/community features, and blockchain-backed auction escrow.

The system is split into:

- Frontend: Next.js + React marketplace UI.
- Backend: NestJS microservices monorepo.
- Blockchain: Solidity escrow contract for auction, bidding, delivery, dispute, and payout.
- Infrastructure: PostgreSQL, Redis, RabbitMQ, Docker Compose, Google Cloud Storage, Stripe, MetaMask/Sepolia.

One good interview summary:

> I built a hybrid art-commerce platform where normal marketplace operations stay off-chain for speed, while high-trust auction settlement is protected by an Ethereum escrow contract. The backend uses DDD, CQRS, microservices, RabbitMQ, and an outbox pattern to keep service state and blockchain events synchronized.

## 2. Tech Stack

### Frontend

- Next.js 16, React 19, TypeScript.
- Pages Router in `FE/src/pages`.
- Domain-first frontend structure in `FE/src/@domains`.
- Tailwind CSS v4.
- Radix UI primitives, shadcn-style component patterns, lucide-react icons.
- Zustand for client state.
- React Hook Form + Zod for forms and validation.
- Socket.IO client for real-time messaging and auction updates.
- ethers.js / MetaMask integration for blockchain wallet flows.
- Stripe React SDK for card payment flows.

### Backend

- NestJS 11 monorepo.
- TypeScript 5.
- NestJS CQRS with `CommandBus` and `QueryBus`.
- NestJS TCP microservices behind an API gateway.
- TypeORM + PostgreSQL.
- Redis for idempotency, cache, token/session-related storage.
- RabbitMQ with `@golevelup/nestjs-rabbitmq`.
- Transactional outbox pattern.
- JWT auth, Google OAuth, SIWE wallet login.
- Swagger API documentation.
- Jest + ts-jest + Nest testing utilities.

### Blockchain

- Solidity `^0.8.20`.
- Hardhat.
- OpenZeppelin `ReentrancyGuard`.
- ethers.js v6.
- Sepolia target network.
- Contract: `contracts/contracts/ArtAuctionEscrow.sol`.
- Main states: `Started`, `Ended`, `Shipped`, `Disputed`, `Completed`, `Cancelled`.

### External Services

- Stripe: payment intents, invoices, refunds, payouts.
- Google OAuth: social login.
- Google Cloud Storage: artwork/media upload.
- Firebase Admin: push notification support.
- RabbitMQ: service and blockchain event messaging.
- Redis: idempotency and auth abuse protection counters.
- MailHog / SMTP: notification email development flow.

## 3. Backend Architecture

The backend is organized as a NestJS microservice monorepo:

- `api-gateway`: public REST entry point, validation, CORS, Swagger, throttling, idempotency, TCP proxy.
- `identity-service`: email login, Google login, wallet login, JWT/refresh tokens, seller profiles.
- `artwork-service`: artwork CRUD, folders, tags, uploads.
- `orders-service`: orders, auction projections, escrow lifecycle.
- `payments-service`: Stripe, invoices, payouts, Ethereum payment records.
- `messaging-service`: conversations, messages, Socket.IO gateway.
- `notifications-service`: email, push, notification history.
- `events-service`: events, RSVPs.
- `community-service`: moments, moodboards, likes, comments, followers.
- `crm-service`: contacts, campaigns, promotions, private views.

Each service follows a Clean Architecture / DDD style:

```text
domain/
  entities/
  interfaces/
  dtos/
  services/

application/
  commands/
  queries/
  event-handlers/

infrastructure/
  repositories/

presentation/
  http/
  microservice/
  gateways/
  graphql/
```

Strong point:

> The backend separates business rules from transport and database details. Commands/queries represent use cases, repository interfaces live in the domain, and TypeORM implementations stay in infrastructure.

## 4. Communication Flow

### Synchronous Flow

```text
Frontend
  -> API Gateway REST
  -> Nest TCP ClientProxy
  -> Target microservice @MessagePattern
  -> CQRS command/query handler
  -> Repository / external service
  -> Response back to gateway
```

Example:

```text
FE login form
  -> POST /api/identity/auth/login
  -> api-gateway
  -> identity-service TCP command
  -> LoginByEmailHandler
  -> TokenService
  -> accessToken + refreshToken
```

### Asynchronous Flow

```text
Service transaction
  -> write business data
  -> write outbox row in same transaction
  -> OutboxProcessor runs every 5 seconds
  -> publish RabbitMQ event
  -> other services consume event
```

Strong point:

> The outbox prevents the classic problem where database writes succeed but event publishing fails. Events are retried with exponential backoff and marked as published or failed.

## 5. Database Strategy

The backend supports two PostgreSQL strategies:

- `ISOLATED`: each service owns its own database.
- `SHARED`: one database with separate schemas per service.

`DynamicDatabaseModule.forRoot(serviceName)` creates the correct TypeORM connection. In shared mode, it ensures the schema exists before TypeORM starts syncing.

Strong point:

> This gives local development flexibility while preserving the database-per-service design principle.

## 6. Authentication Flow

### Email Login

```text
User enters email/password
  -> LoginByEmailHandler
  -> AuthAbuseProtectionService checks attempts/captcha
  -> bcrypt password compare
  -> TokenService creates access + refresh token
  -> lastLogin updated
```

Strong points:

- Failed login counters by email, IP, and device.
- Captcha can be required after suspicious attempts.
- Temporary account/email blocking after repeated failures.
- Refresh token rotation: old refresh token is revoked when new token pair is generated.

### Google Login

```text
Frontend gets Google id_token
  -> identity-service verifies id_token with Google
  -> existing user is updated or new collector user is created
  -> app JWT token pair is issued
```

### Wallet Login

```text
Frontend asks wallet to sign SIWE message
  -> backend parses SIWE fields
  -> validates domain, URI, chain id, issuedAt, expiration, nonce
  -> verifies signature with ethers.verifyMessage
  -> consumes nonce to prevent replay
  -> issues JWT token pair
```

Strong point:

> Wallet authentication is not just checking a signature. It validates SIWE context and consumes a one-time nonce, so the same signed message cannot be replayed.

## 7. Auction Escrow State Flow

Smart contract state machine:

```text
Started
  -> Ended
  -> Shipped
  -> Completed
```

Alternative paths:

```text
Started -> Cancelled
Ended -> Cancelled       seller fails to ship
Shipped -> Disputed
Disputed -> Completed    arbiter favors seller
Disputed -> Cancelled    arbiter favors buyer or dispute timeout
```

Key contract rules:

- Seller creates auction with reserve price, duration, min bid increment, metadata hash.
- Seller cannot bid on their own auction.
- Bid must meet minimum increment.
- Previous highest bidder gets refund through `pendingReturns`.
- Anti-snipe logic extends auction if a bid arrives near the end.
- Seller must ship within a deadline.
- Buyer confirms delivery to release funds.
- Buyer can open dispute during delivery window.
- Arbiter resolves dispute.
- Platform fee is split from seller payout.
- `ReentrancyGuard` protects bid, refund, delivery, and payout flows.

Strong interview line:

> The contract only handles settlement-critical state: bids, escrow, deadlines, disputes, and fund release. Rich marketplace data remains off-chain, linked by `orderId` and metadata hash.

## 8. Seller Auction Start Flow

The seller auction start is a hybrid wallet/backend flow:

```text
Seller chooses artwork and auction terms
  -> backend validates terms and creates AuctionStartAttempt
  -> backend returns encoded createAuction calldata
  -> frontend asks MetaMask to send transaction
  -> frontend attaches txHash to backend attempt
  -> blockchain listener detects AuctionStarted event
  -> orders-service promotes attempt to active auction order
  -> artwork is marked as in-auction
```

Strong points:

- Backend controls validation, duration bounds, ETH-to-wei conversion, and transaction calldata.
- Frontend submits the transaction using the seller wallet, so the seller is the on-chain auction creator.
- Attempt state tracks retry/edit/wallet-action requirements.
- Lifecycle changes are emitted through outbox events.

Useful state vocabulary:

- `PENDING_START`: backend created attempt, wallet action needed.
- `RETRY_AVAILABLE`: previous start failed but can be retried.
- `START_FAILED`: cannot start without user correction.
- `AUCTION_ACTIVE`: on-chain event confirmed and backend projection is active.

## 9. Blockchain Event Sync Flow

Blockchain event listener flow:

```text
Ethereum contract emits event
  -> BlockchainEventListenerService reads logs
  -> event parsed with ethers contract interface
  -> duplicate check by txHash + logIndex
  -> outbox message created in DB transaction
  -> RabbitMQ publishes blockchain event
  -> orders-service consumes event
  -> order projection is updated
```

Reliability details:

- Cursor table tracks last processed block.
- Backfill runs from last processed block to chain tip.
- Polling mode is supported, live listeners are optional.
- RPC retry with exponential delay.
- Adaptive block-range splitting for RPC provider limits.
- Duplicate events are ignored using `txHash + logIndex`.

Strong point:

> The backend treats blockchain as an external event source and builds an idempotent off-chain projection, instead of trusting live WebSocket callbacks only.

## 10. Buyer Bidding Flow

```text
Buyer opens auction lot
  -> frontend validates contract address and bid amount
  -> checks Sepolia chain
  -> requests MetaMask account
  -> checks wallet balance
  -> simulates bid with eth_call
  -> sends eth_sendTransaction
  -> blockchain event updates backend projection
  -> auction socket can notify UI to refresh
```

Strong frontend logic:

- Manual calldata encoding for `bid(string)`.
- Converts decimal ETH to wei with `BigInt`.
- Checks up to 18 decimals.
- Runs `eth_call` before sending transaction to catch contract reverts.
- Maps known custom error selectors to user-friendly messages.
- Prevents bidding if selected chain is not Sepolia.

## 11. Payment and Invoice Flow

Payment service responsibilities:

- Create payment transactions.
- Stripe payment intents and refunds.
- Invoices and quick-sell invoices.
- Payout records.
- Ethereum payment confirmation records.

Quick-sell invoice frontend flow:

```text
Seller creates invoice draft
  -> frontend calculates subtotal, discounts, tax, shipping, total
  -> payload mapped to API format
  -> invoice created in payments-service
  -> checkout invoice stored locally for buyer checkout display
```

Pricing formula:

```text
subtotal = sum(price * quantity)
discount = sum(item discount)
shipping = 0 if artist handles shipping, else shipping fee
taxable = subtotal - discount + shipping
tax = taxable * taxPercent
total = subtotal - discount + shipping + tax
```

Strong point:

> The invoice flow separates draft UX from backend persistence. The frontend gives immediate total calculation, while payments-service validates invoice items and recalculates totals server-side.

## 12. Inventory Flow

Inventory domains:

- Artworks.
- Folders.
- Tags.
- Upload drafts.
- Selection state.
- Bulk actions.
- Drag-and-drop.

Frontend state stores:

- `useInventoryDataStore`: artworks/folders and optimistic mutations.
- `useInventorySelectionStore`: selected items.
- `useInventoryUiStore`: current tab, view mode, modal state, filters.

Strong logic:

- Optimistic artwork movement between folders.
- Folder item counts update with deltas.
- Failed drag/drop operations roll back UI state.
- Folder reorder persists to backend.
- Bulk move artworks/folders supported.

Interview line:

> Inventory is built like an operational tool: local optimistic state for responsiveness, backend APIs for persistence, and rollback paths when persistence fails.

## 13. Upload Flow

```text
Frontend selects file
  -> apiUpload uses XMLHttpRequest for progress
  -> API Gateway / artwork-service upload endpoint
  -> GcsStorageService validates type and size
  -> file name sanitized
  -> buffer uploaded to Google Cloud Storage
  -> public URL returned
```

Strong points:

- Upload progress support.
- File type whitelist.
- Max file size enforcement.
- Handles serialized Buffer edge case.
- Public URL generation from GCS bucket path.
- Delete and signed URL helpers exist.

## 14. Real-Time Flow

### Messaging

```text
User connects to /messaging Socket.IO namespace
  -> joins conversation room
  -> sendMessage emits newMessage to room
  -> typingStarted / typingStopped emits typing indicators
  -> markAsRead emits read receipt event
```

### Auctions

```text
User connects to /auction namespace
  -> joins auction:{auctionId} room
  -> auctionStateChanged / auctionBidUpdated / auctionExtended
  -> frontend throttles refresh to avoid repeated fetches
```

Strong point:

> Real-time UI is room-based. The client joins only the conversation or auction rooms it needs, keeping broadcast scope small.

## 15. API Reliability and UX Protection

### Idempotency

Gateway idempotency supports mutation safety:

- Requires or accepts `Idempotency-Key` per decorated endpoint.
- Validates key format.
- Hashes request method/path/body/user/scope.
- Redis `NX` lock prevents duplicate in-flight execution.
- Replays succeeded or failed response for the same request hash.
- Rejects same key with different body.

Interview line:

> Idempotency protects checkout/payment-like APIs from double submit and retries, especially when users refresh or network requests are repeated.

### API Client

Frontend `apiFetch` adds:

- JSON body handling.
- Bearer token injection from Zustand auth store.
- Device ID header.
- Idempotency key header support.
- Client-side GET dedupe/cache.
- AbortSignal support.
- Auto clear auth on 401/403.

`apiUpload` adds:

- XHR upload progress.
- Timeout.
- Abort handling.
- Auth header injection.

## 16. Performance Optimization Evidence

There is a documented frontend optimization report in `docs/web-optimization/Report.md`.

Main results:

- Discover desktop Lighthouse: 71 to 81.
- Discover mobile Lighthouse: 57 to 79.
- Discover mobile CLS: 1.077 to 0.000.
- `/discover` bundle: 1039.0 KiB to 608.0 KiB, about 41.5 percent smaller.
- Discover first load requests: 84 to 77.
- Checkout first load requests: 60 to 54.
- Checkout wallet first load: 0 `window.ethereum.request` calls before user chooses wallet.

Strong point:

> The optimization work has before/after evidence, not just code changes. It measured Lighthouse, bundle size, network requests, and wallet RPC behavior.

## 17. Testing Story

Testing currently covers:

- Backend Jest specs across service handlers.
- Solidity Hardhat test for `ArtAuctionEscrow`.
- Specific unit tests for auction start, delivery, shipping, payment quote/order invoice handlers.
- Web optimization evidence with Lighthouse/network artifacts.

Useful interview framing:

> I focused tests on high-risk behavior: escrow contract state transitions, auction lifecycle handlers, payment quote/order invoice logic, and frontend performance evidence.

## 18. Strong Points to Present

Use these as talking points:

- Microservice architecture with API Gateway and TCP service calls.
- DDD layering: domain, application, infrastructure, presentation.
- CQRS pattern for clear command/query separation.
- Transactional outbox to reliably publish RabbitMQ events.
- Blockchain listener with cursor, backfill, retry, duplicate protection.
- Hybrid on-chain/off-chain architecture.
- Smart contract escrow with deadlines, disputes, anti-snipe extension, refund pattern, and platform fee split.
- SIWE wallet authentication with nonce consumption and context validation.
- Refresh token rotation and Redis-backed token lookup.
- Auth abuse protection with email/IP/device counters and captcha escalation.
- API idempotency for safe repeated mutation requests.
- Frontend domain architecture with `@domains` and `@shared`.
- Optimistic inventory drag/drop with rollback.
- MetaMask transaction UX with chain check, balance check, simulation, and readable revert messages.
- GCS upload pipeline with validation, sanitized filenames, and progress support.
- Real-time messaging and auction room updates with Socket.IO.
- Performance work backed by measurable before/after reports.

## 19. Short Interview Answer Templates

### Architecture

> The project uses a NestJS microservice backend with an API Gateway. Each service owns its domain and follows Clean Architecture: domain entities and repository interfaces, CQRS handlers for use cases, infrastructure repositories for TypeORM, and presentation controllers or TCP message handlers. For async integration, services write outbox rows and a processor publishes RabbitMQ events reliably.

### Blockchain

> I used blockchain only for settlement-critical auction escrow. The smart contract manages bids, deadlines, shipping, disputes, refunds, and payout. The backend listens to contract events, deduplicates them by transaction hash and log index, then updates an off-chain order projection through RabbitMQ and outbox.

### Frontend

> The frontend is domain-first. Pages stay thin, while business logic lives in `@domains`. Zustand handles local state such as auth and inventory. For wallet flows, the app checks chain, account, balance, and transaction simulation before asking MetaMask to submit.

### Reliability

> The system has several reliability layers: request idempotency in the gateway, Redis-backed auth and abuse protection, outbox retries for RabbitMQ, blockchain cursor backfill, duplicate event protection, and frontend rollback for optimistic updates.

### Performance

> I optimized Discover by dynamic-loading tab content, reducing initial bundle size, deduping GET requests, stabilizing image layout, and adding evidence with Lighthouse and network captures. The Discover route bundle dropped about 41.5 percent.

## 20. Things to Be Honest About

- Some service areas are more complete than others.
- Some real-time gateway code is room/event ready, but deeper persistence integration can be improved.
- Frontend uses Pages Router even though some docs mention App Router.
- The blockchain auction integration is strongest around escrow/event projection, not full production mainnet operation.
- More end-to-end tests would strengthen confidence across full checkout and auction journeys.

## 21. Recommended Demo Order

1. Show high-level architecture: FE, API Gateway, microservices, RabbitMQ, blockchain.
2. Show one backend service structure, preferably `orders-service` or `identity-service`.
3. Show the smart contract state machine.
4. Show seller auction start flow from backend calldata to MetaMask transaction.
5. Show blockchain event listener cursor/dedup/outbox logic.
6. Show frontend auction wallet bid logic.
7. Show idempotency interceptor.
8. Show web optimization before/after evidence.

