# Architecture

**Analysis Date:** 2026-04-21

## Pattern Overview

**Overall:** Event-driven microservices with Domain-Driven Design (DDD) + CQRS + Transactional Outbox

**Key Characteristics:**
- 10 independent NestJS microservices + 1 REST API gateway
- Each service owns its own PostgreSQL database (database-per-service)
- Synchronous communication via NestJS TCP transport (API gateway → services)
- Asynchronous communication via RabbitMQ with transactional outbox pattern
- DDD layering enforced per service: `domain/`, `application/`, `infrastructure/`, `presentation/`
- Solidity smart contract (`ArtAuctionEscrow`) handles on-chain auction escrow; `@app/blockchain` lib bridges NestJS ↔ Ethereum
- Next.js (Pages Router) frontend communicates exclusively through the API gateway

---

## Service Catalog

| Service | HTTP Port | TCP Port | Purpose |
|---------|-----------|----------|---------|
| `api-gateway` | 8081 | — | REST aggregation, JWT guard, Swagger, proxies all to downstream services |
| `identity-service` | 3001 | 3101 | Auth (email + Google OAuth + wallet), users, seller profiles, JWT tokens |
| `artwork-service` | 3002 | 3102 | Artwork CRUD, folders, tags, GCS image uploads |
| `payments-service` | 3003 | 3103 | Stripe payment intents, invoices, payouts, quick-sell |
| `orders-service` | — | 3104 | Order lifecycle, on-chain auction integration, dispute flows |
| `messaging-service` | — | 3105 | WebSocket chat, conversations, real-time messaging |
| `notifications-service` | — | 3106 | Email (Nodemailer), Firebase push, SMS, in-app notifications |
| `events-service` | — | 3107 | Art events, RSVPs, guest lists, event-chat rooms |
| `community-service` | — | 3108 | Followers, moments, moodboards, likes, comments, activity feed |
| `crm-service` | — | 3109 | Contacts, email campaigns, promotions, private views |

---

## DDD Layer Breakdown (per service)

Every service under `BE/apps/<service>/src/` follows this exact four-layer layout:

```
apps/<service>/src/
├── domain/               # Core business concepts (NO framework dependencies)
│   ├── entities/         # TypeORM entities extending AbstractEntity
│   ├── interfaces/       # Repository contracts (Symbol-based DI tokens)
│   ├── dtos/             # Input/output objects (service-local)
│   ├── services/         # Domain services (stateless business logic)
│   └── enums/            # Domain-specific enumerations
│
├── application/          # Use-case orchestration (CQRS)
│   ├── commands/         # Write operations: Foo.command.ts + handlers/Foo.command.handler.ts
│   ├── queries/          # Read operations: Bar.query.ts + handlers/Bar.query.handler.ts
│   └── event-handlers/   # RabbitMQ event consumers
│
├── infrastructure/       # External concerns
│   └── repositories/     # TypeORM repository implementations of domain interfaces
│
└── presentation/         # Inbound adapters
    ├── http/             # REST controllers (own Swagger docs)
    └── microservice/     # TCP @MessagePattern controllers (consumed by api-gateway)
```

Some services also have:
- `presentation/graphql/` — GraphQL resolvers (payments, orders, events, messaging)
- `presentation/gateways/` — WebSocket gateways (messaging)
- `db/seeds/` — Database seeding scripts

---

## CQRS Implementation

**Framework:** `@nestjs/cqrs` — `CommandBus`, `QueryBus`, `EventBus`

**Command pattern** (mutations):
```typescript
// apps/identity-service/src/application/commands/LoginByEmail.command.ts
export class LoginByEmailCommand {
  constructor(public readonly dto: LoginByEmailDto) {}
}

// apps/identity-service/src/application/commands/handlers/LoginByEmail.command.handler.ts
@CommandHandler(LoginByEmailCommand)
export class LoginByEmailCommandHandler implements ICommandHandler<LoginByEmailCommand> {
  async execute(command: LoginByEmailCommand) { ... }
}
```

**Query pattern** (reads):
```typescript
// apps/identity-service/src/application/queries/GetUserById.query.ts
export class GetUserByIdQuery {
  constructor(public readonly userId: string) {}
}

// apps/identity-service/src/application/queries/handlers/GetUserById.query.handler.ts
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  async execute(query: GetUserByIdQuery) { ... }
}
```

**Registration** in `app.module.ts`:
```typescript
providers: [
  ...CommandHandlers,  // array from application/commands/handlers/index.ts
  ...QueryHandlers,    // array from application/queries/handlers/index.ts
  ...EventHandlers,    // array from application/event-handlers/index.ts
]
```

**File naming convention:** `PascalCase.command.ts`, `PascalCase.command.handler.ts`, `PascalCase.query.ts`, `PascalCase.query.handler.ts`

---

## Repository Pattern

**Interface** defined in `domain/interfaces/` with Symbol-based DI token:
```typescript
// domain/interfaces/user.repository.interface.ts
export const IUserRepository = Symbol('IUserRepository');
export interface IUserRepository extends IRepository<UserEntity> { ... }
```

**Base interface** from `@app/common`:
```typescript
// libs/common/src/interfaces/repository.interface.ts
export interface IRepository<T, IdType = string> {
  create(data, transactionManager?: EntityManager): Promise<T>;
  update(id, data, transactionManager?: EntityManager): Promise<T | null>;
  findById(id, transactionManager?: EntityManager): Promise<T | null>;
  find(options?, transactionManager?: EntityManager): Promise<T[]>;
  // ... count, exists, createMany, updateMany, deleteMany
}
```

**Implementation** in `infrastructure/repositories/`:
```typescript
// infrastructure/repositories/user.repository.ts
@Injectable()
export class UserRepository implements IUserRepository { ... }
```

**Binding** in `app.module.ts`:
```typescript
{ provide: IUserRepository, useClass: UserRepository }
```

All repository methods accept optional `transactionManager?: EntityManager` for transaction support via `@app/common` `TransactionService`.

---

## Inter-Service Communication

### Synchronous — TCP (API Gateway → Services)

The api-gateway registers all downstream services as TCP `ClientProxy` instances:

```typescript
// apps/api-gateway/src/config/microservices.config.ts
getMicroserviceConfig('IDENTITY_SERVICE')  // TCP localhost:3101
getMicroserviceConfig('ARTWORK_SERVICE')   // TCP localhost:3102
// ...etc
```

Calls use the `sendRpc` helper:
```typescript
// apps/api-gateway/src/presentation/http/utils/rpc.helper.ts
await sendRpc<T>(client, { cmd: 'get_user_by_id' }, data, { timeout: 30000 })
```

Services expose TCP handlers via `@MessagePattern` in their microservice controllers:
```typescript
// apps/identity-service/src/presentation/microservice/users.microservice.controller.ts
@MessagePattern({ cmd: 'get_user_by_id' })
async getUserById(@Payload() data) { ... }
```

Each service runs dual transports: `NestFactory.create()` (HTTP) + `app.connectMicroservice()` (TCP).

### Asynchronous — RabbitMQ + Outbox Pattern

**Exchanges** (`libs/rabbitmq/src/exchanges/exchanges.ts`):
- `user.events.exchange` — topic exchange
- `notification.events.exchange` — x-delayed-message (supports delayed delivery)
- `payment.events.exchange` — topic exchange
- `blockchain.events.exchange` — topic exchange

**Routing keys** (`libs/rabbitmq/src/routing-keys/routing-keys.ts`):
- `payment.stripe.customer.created`, `payment.succeeded`, `payment.failed`
- `blockchain.auction.started`, `blockchain.bid.new`, `blockchain.auction.ended`
- `notification.message.new`, `send_transactional_email`

**Outbox processor** (`libs/outbox/src/outbox.processor.ts`):
- Cron job runs every 5 seconds
- Queries `OutboxEntity` records with `status = PENDING` and `attempts < maxAttempts`
- Publishes to RabbitMQ via `AmqpConnection.publish(exchange, routingKey, payload)`
- On failure: exponential backoff (`2^attempts * 1000ms`), max attempts tracked
- Status transitions: `PENDING → PUBLISHED` (success) or `PENDING → FAILED` (max retries)

**Event consumers** are `@app/rabbitmq` `@RabbitSubscribe` decorators in `application/event-handlers/`.

---

## API Gateway Role

The `api-gateway` (`BE/apps/api-gateway/`) is a **pure REST aggregator** (not GraphQL federation):

- **Entry point:** `apps/api-gateway/src/main.ts` — Port 8081
- **Global prefix:** `/api`
- **Auth guard:** `JwtAuthGuard` from `@app/auth` applied per-controller or per-route
- **All routes:** defined in `apps/api-gateway/src/presentation/http/controllers/` mirroring service domains
- **Swagger:** Multi-document setup — main at `/api-docs`, per-service at `/api-docs/<service>`
- **WebSocket:** `MessagingGateway` in `presentation/http/gateways/` proxies WebSocket to messaging-service
- **Error handling:** `AllExceptionsFilter` + `RpcExceptionInterceptor` translates TCP errors to HTTP codes

Individual services also expose their own HTTP endpoints and Swagger (`/api` on their own ports) for direct access during development.

---

## Authentication Flow

**Provider:** Custom JWT — identity-service issues tokens; `@app/auth` validates everywhere

1. **Login:** Client → `POST /api/identity/auth/login` → api-gateway → TCP → identity-service
2. **Token issuance:** identity-service creates JWT (access + refresh) signed with `JWT_SECRET`
3. **Auth guard:** `JwtAuthGuard` (`libs/auth/src/guards/jwt-auth.guard.ts`) at api-gateway extracts Bearer token from `Authorization` header, validates via `JwtStrategy` (Passport)
4. **User context:** Validated user `{ id, roles }` injected into controller via `@CurrentUser()` decorator (`libs/auth/src/decorators/current-user.decorator.ts`)
5. **Role guard:** `RolesGuard` + `@Roles()` decorator enforces RBAC (ADMIN, SELLER, COLLECTOR)
6. **Google OAuth:** FE uses NextAuth to obtain Google `id_token` → sent to identity-service → `LoginByGoogleCommand` exchanges for app JWT
7. **Wallet auth:** `LoginByWalletCommand` — nonce-based signature verification
8. **M2M auth:** `M2mJwtGuard` / `M2mJwtStrategy` for service-to-service calls

Frontend stores tokens in `localStorage` under `artium.auth-storage` (Zustand `useAuthStore`), and injects `Authorization: Bearer <token>` on all authenticated API calls via `apiFetch` (`FE/artium-web/src/@shared/services/apiClient.ts`).

---

## Smart Contract Integration

**Contract:** `ArtAuctionEscrow.sol` — Ethereum Solidity 0.8.20 + OpenZeppelin ReentrancyGuard

**States:** `Started → Ended → Shipped → Disputed → Completed | Cancelled`

**Key contract functions:**
- `startAuction(orderId, ...)` — seller starts auction with escrow
- `placeBid(orderId)` — bidder places ETH bid (held in escrow)
- `endAuction(orderId)` — closes bidding
- `markShipped(orderId, trackingHash)` — seller confirms shipping
- `confirmDelivery(orderId)` — buyer confirms receipt, releases funds
- `openDispute(orderId)` / `resolveDispute(orderId, winner)` — dispute arbitration

**Backend bridge** (`libs/blockchain/`):
- `EscrowContractService` (`libs/blockchain/src/services/escrow-contract.service.ts`) — wraps ethers.js contract calls, uses DI tokens `ESCROW_CONTRACT` and `PLATFORM_SIGNER`
- `BlockchainEventListenerService` (`libs/blockchain/src/services/blockchain-event-listener.service.ts`) — listens to on-chain events
- ABI stored at `libs/blockchain/src/abi/ArtAuctionEscrow.json`
- `blockchain-event.handler.ts` in orders-service subscribes to `blockchain.events.exchange` routing keys
- `blockchain-event-cursor.entity.ts` and `blockchain-processed-event.entity.ts` track event processing state

**Deployment target:** Sepolia testnet (config in `smart-contracts/deployments/sepolia.json`)

**Blockchain event routing:** On-chain events → `BlockchainEventListenerService` → RabbitMQ `blockchain.events.exchange` → orders-service event-handlers → Order state update → further downstream events

---

## Frontend Architecture

**Framework:** Next.js (Pages Router, not App Router)
**Entry point:** `FE/artium-web/src/pages/_app.tsx`

**Architecture pattern:** Domain-driven feature modules (`@domains/`) + shared infrastructure (`@shared/`)

### Domain Modules (`src/@domains/`)
Each domain contains its own:
- `components/` — domain-specific React components
- `views/` — full page view components (composed from components)
- `hooks/` — domain hooks (data fetching, mutations)
- `services/` — API call functions
- `stores/` — Zustand state stores
- `types/` — TypeScript types
- `validations/` — Zod/yup schemas

Active domains: `auth`, `artwork-detail`, `inventory`, `inventory-upload`, `events`, `discover`, `messaging`, `community`, `portfolio`, `profile`, `checkout`, `quick-sell`, `pricing`, `moments`, `editorial`, `home`, `manage-plan`, `custom-website`

### Shared Layer (`src/@shared/`)
- `apis/` — per-resource API functions calling `apiFetch` (e.g., `artworkApis.ts`, `orderApis.ts`)
- `components/ui/` — shadcn/ui-based design system components
- `components/layout/` — `AppLayout`, `AuthLayout`, `SidebarLayout`, `MarketingLayout`
- `services/apiClient.ts` — base `apiFetch` wrapper with auth token injection
- `services/websocketClient.ts` — WebSocket connection to messaging gateway
- `hooks/` — shared hooks (pagination, debounce, etc.)
- `types/` — global TypeScript types

### State Management
- **Auth:** Zustand `useAuthStore` (`@domains/auth/stores/useAuthStore.ts`) — persisted to `localStorage`
- **Feature state:** Zustand stores per domain (e.g., `inventory/stores/`, `inventory-upload/stores/`)
- **Server state:** No React Query; manual fetch via `apiFetch` in hooks/services
- **Session:** NextAuth `SessionProvider` wraps app for Google OAuth session

### Routing
- **Router:** Next.js Pages Router (`src/pages/`)
- **Layout system:** `Component.getLayout` pattern — pages define their own layout or inherit default `AppLayout`
- **Auth routes:** NextAuth at `src/pages/api/auth/[...nextauth].ts` handles Google OAuth callbacks
- **Dynamic routes:** `[id].tsx`, `[username].tsx`, `[artworkId].tsx` patterns

---

## Data Flow Examples

### Buyer Places Artwork Order (REST path):
1. FE `POST /api/orders/create` → api-gateway (TCP sendRpc `create_order`) → orders-service
2. orders-service `CreateOrderCommand` → handler validates, saves Order entity, calls `OutboxService.createOutboxMessage()`
3. OutboxProcessor (cron) → publishes `payment.intent.created` to RabbitMQ
4. payments-service event-handler → creates Stripe PaymentIntent → outbox publishes result

### Blockchain Auction Flow:
1. Seller: FE calls `POST /api/orders/start-auction` → orders-service `StartAuctionCommand` → `EscrowContractService.startAuction()`
2. Buyers: On-chain `placeBid()` transactions directly via Ethereum wallet (FE uses ethers.js)
3. `BlockchainEventListenerService` receives `NewBid` event → RabbitMQ `blockchain.events.exchange`
4. orders-service `blockchain-event.handler.ts` → updates Order state → `OutboxService` notifies notification-service

### User Registration:
1. FE `POST /api/identity/auth/register/initiate` → api-gateway → identity-service `InitiateUserRegistrationCommand` → sends OTP email (via notifications-service via RabbitMQ `send_transactional_email`)
2. FE `POST /api/identity/auth/register/complete` → `CompleteUserRegistrationCommand` → issues JWT tokens

---

## Error Handling

**Strategy:** Layered translation — domain exceptions → RPC exceptions → HTTP exceptions

**Domain level:** Services throw custom `HttpException` subclasses (400, 401, 403, 404, 409, 422)

**TCP boundary:** `AllRpcExceptionsFilter` (`@app/common`) wraps exceptions as RPC error objects with `statusCode`, `message`, `errors`

**Gateway level:** `RpcExceptionInterceptor` + `sendRpc` helper maps RPC error codes back to `HttpException` with identical status codes

**Global:** `AllExceptionsFilter` at api-gateway catches any unhandled exceptions

---

## Cross-Cutting Concerns

**Logging:** NestJS built-in `Logger` (`new Logger(ClassName.name)`) — structured per-class, no external logging framework

**Validation:** `ValidationPipe` (global) with `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true`

**Database transactions:** `TransactionService` (`@app/common/services/transaction/`) wraps TypeORM `EntityManager`; all repository methods accept optional `transactionManager`

**Metrics:** `@app/metrics` library (minimal implementation, not fully detailed)

**Health checks:** Each service exposes `HealthController` at `GET /health` returning service status

---

*Architecture analysis: 2026-04-21*
