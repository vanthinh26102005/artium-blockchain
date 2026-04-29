# Codebase Structure

**Analysis Date:** 2026-04-21

## Top-Level Directory Layout

```
artium-blockchain/
├── BE/                    # NestJS microservices monorepo + Solidity smart contracts
├── FE/                    # Next.js frontend
├── docs/                  # Project-level documentation
├── .planning/             # GSD planning documents (this directory)
│   └── codebase/          # Codebase map documents
└── README.md
```

---

## BE/ — Backend Monorepo

```
BE/
├── apps/                          # NestJS microservice applications (10 services)
│   ├── api-gateway/               # REST API gateway — port 8081
│   ├── artwork-service/           # Artwork catalog — port 3002/3102
│   ├── community-service/         # Social features — port 3108
│   ├── crm-service/               # CRM / marketing — port 3109
│   ├── events-service/            # Art events — port 3107
│   ├── identity-service/          # Auth / users — port 3001/3101
│   ├── messaging-service/         # Real-time chat — port 3105
│   ├── notifications-service/     # Notification delivery — port 3106
│   ├── orders-service/            # Order lifecycle — port 3104
│   └── payments-service/          # Stripe payments — port 3003/3103
│
├── libs/                          # Shared NestJS libraries (@app/* aliases)
│   ├── api-clients/               # @app/api-clients — HTTP client helpers
│   ├── auth/                      # @app/auth — JWT guards, strategies, decorators
│   ├── blockchain/                # @app/blockchain — Ethers.js bridge, EscrowContractService
│   ├── common/                    # @app/common — entities, DTOs, interfaces, filters, enums
│   ├── metrics/                   # @app/metrics — monitoring
│   ├── outbox/                    # @app/outbox — transactional outbox entity + processor
│   └── rabbitmq/                  # @app/rabbitmq — exchanges, queues, routing keys
│
├── smart-contracts/               # Hardhat + Solidity project (standalone)
│   ├── contracts/                 # Solidity source files
│   ├── scripts/                   # Deploy scripts
│   ├── test/                      # Hardhat tests (TypeScript)
│   ├── deployments/               # Deployment artifacts per network
│   ├── typechain-types/           # Generated TypeScript bindings
│   ├── artifacts/                 # Hardhat compile artifacts
│   └── hardhat.config.ts
│
├── infrastructure/
│   ├── docker/                    # Dockerfile base configs + RabbitMQ configs
│   └── k8s/                       # Kubernetes manifests
│       ├── infras/                # Infrastructure: RabbitMQ, Redis, Mailhog, Postgres
│       └── services/              # Per-service K8s deployments (identity, artwork, etc.)
│
├── config/                        # Shared config files (if any)
├── plans/                         # Implementation plan documents
│   ├── 202603231157-enhanced-auction/
│   └── 202603231253-blockchain-integration/
│
├── .claude/                       # Claude AI project context
│   └── project/
│       ├── architecture.md        # Authoritative architecture reference
│       ├── commands.md            # Build/run/deploy commands
│       └── smart-contracts.md     # Contract deployment guide
│
├── docker-compose.yml             # Shared infra (RabbitMQ, Redis, Mailhog)
├── docker-compose.isolated.yml    # Per-service PostgreSQL databases
├── docker-compose.shared.yml      # Single shared PostgreSQL
├── nest-cli.json                  # NestJS monorepo config (all app/lib registrations)
├── package.json                   # Root workspace dependencies
├── tsconfig.json                  # Root TypeScript config
├── tsconfig.build.json            # Build TypeScript config
├── CLAUDE.md                      # Claude AI guidance document
└── yarn.lock
```

---

## BE/apps/ — Microservice Internal Structure

Every service follows **identical** four-layer DDD structure. Use `artwork-service` as the canonical reference:

```
apps/artwork-service/
├── src/
│   ├── app.module.ts              # Root module — wires all layers + DynamicDatabaseModule
│   ├── main.ts                    # Bootstrap: HTTP + TCP microservice, Swagger
│   │
│   ├── domain/                    # Business logic core (no framework deps)
│   │   ├── entities/              # TypeORM entities (extend AbstractEntity from @app/common)
│   │   │   ├── artworks.entity.ts
│   │   │   ├── artwork-folder.entity.ts
│   │   │   └── tags.entity.ts
│   │   ├── interfaces/            # Repository contracts with Symbol DI tokens
│   │   │   ├── artwork.repository.interface.ts
│   │   │   └── artwork-folder.repository.interface.ts
│   │   ├── dtos/                  # Service-local input/output objects
│   │   │   ├── artworks/          # create-artwork.input.ts, artwork.object.ts, etc.
│   │   │   └── artwork-folder/
│   │   └── services/              # Stateless domain services (e.g., GcsStorageService)
│   │
│   ├── application/               # CQRS use-case layer
│   │   ├── commands/              # Write use-cases
│   │   │   ├── artworks/          # CreateArtwork.command.ts, UpdateArtwork.command.ts, etc.
│   │   │   │   └── handlers/      # CreateArtwork.command.handler.ts, etc.
│   │   │   ├── artwork-folders/
│   │   │   └── tags/
│   │   ├── queries/               # Read use-cases
│   │   │   ├── artworks/          # GetArtwork.query.ts, ListArtworks.query.ts, etc.
│   │   │   │   └── handlers/
│   │   │   ├── artwork-folders/
│   │   │   └── tags/
│   │   └── event-handlers/        # RabbitMQ event consumers
│   │
│   ├── infrastructure/            # External adapters
│   │   └── repositories/          # TypeORM implementations of domain interfaces
│   │       ├── artwork.repository.ts
│   │       └── artwork-folder.repository.ts
│   │
│   ├── presentation/              # Inbound adapters
│   │   ├── http/                  # REST controllers for direct HTTP access
│   │   │   ├── controllers/       # artworks.controller.ts, tags.controller.ts, etc.
│   │   │   ├── filters/           # all-exceptions.filter.ts
│   │   │   └── interceptors/      # logging.interceptor.ts
│   │   └── microservice/          # TCP @MessagePattern controllers (used by api-gateway)
│   │       ├── artworks.microservice.controller.ts
│   │       └── artwork-folders.microservice.controller.ts
│   │
│   └── db/                        # Seeding scripts
│       └── seeds/                 # artwork.seed.ts, run-seeds.ts
│
└── tsconfig.app.json
```

### Variations per service

| Service | Extra Presentation Layer | Notes |
|---------|--------------------------|-------|
| `api-gateway` | `presentation/http/controllers/<domain>/` | No domain/application/infrastructure layers; only proxies |
| `api-gateway` | `presentation/http/gateways/messaging.gateway.ts` | WebSocket gateway |
| `messaging-service` | `presentation/gateways/`, `presentation/graphql/` | WebSocket + GraphQL |
| `payments-service` | `presentation/graphql/` | GraphQL resolvers |
| `orders-service` | `presentation/graphql/` | GraphQL resolvers |
| `events-service` | `presentation/graphql/` | GraphQL resolvers |
| `identity-service` | `domain/enums/` | Extra enum directory |
| `notifications-service` | `domain/processor/`, `templates/` | Notification templates directory |

---

## BE/libs/ — Shared Libraries

### `libs/common/src/` — `@app/common`

```
libs/common/src/
├── entities/
│   └── abstract.entity.ts         # AbstractEntity: createdAt, updatedAt (TypeORM base)
├── interfaces/
│   └── repository.interface.ts    # IRepository<T> — base CRUD contract for all repos
├── database/
│   ├── dynamic-database.module.ts # DynamicDatabaseModule.forRoot(serviceName) — per-service DB config
│   └── database.helper.ts         # getDatabaseConfig(), ensureSchemaExists() — ISOLATED/SHARED strategy
├── dtos/                          # Cross-service shared DTOs (used by api-gateway + services)
│   ├── artworks/                  # artwork.object.ts, create-artwork.input.ts, etc.
│   ├── identity/                  # login-email.dto.ts, register-initiate.dto.ts, etc.
│   ├── messaging/                 # send-message.dto.ts, create-conversation.dto.ts, etc.
│   ├── notifications/             # notification-history.object.ts, etc.
│   ├── orders/                    # create-order.dto.ts, order.object.ts, etc.
│   └── payments/                  # create-payment-intent.dto.ts, stripe/, invoices/, payouts/
├── enums/                         # Shared enumerations
│   ├── user-role.enum.ts          # ADMIN, SELLER, COLLECTOR
│   ├── artwork-status.enum.ts     # DRAFT, ACTIVE, SOLD, ARCHIVED
│   ├── order-status.enum.ts       # order lifecycle states
│   ├── escrow-state.enum.ts       # Started, Ended, Shipped, Disputed, Completed, Cancelled
│   ├── payment.enum.ts
│   ├── notification.enum.ts
│   └── ...
├── exceptions/
│   └── rpc-exceptions.ts          # Custom RPC exception types
├── filters/
│   └── rpc-exception.filter.ts    # AllRpcExceptionsFilter — wraps exceptions for TCP transport
├── helpers/
│   └── map-to-typeorm-where.helper.ts
├── graphql/
│   ├── json.scalar.ts             # Custom JSON GraphQL scalar
│   └── query-options.input.ts
├── services/transaction/
│   ├── transaction.service.ts     # TypeORM transaction wrapper
│   └── itransaction.service.ts
└── constants/
    ├── fees.ts                    # Platform fee constants
    └── index.ts
```

### `libs/auth/src/` — `@app/auth`

```
libs/auth/src/
├── auth.module.ts                 # AuthLibModule — exported for api-gateway and services
├── guards/
│   ├── jwt-auth.guard.ts          # JwtAuthGuard — validates Bearer tokens
│   ├── google-auth.guard.ts       # GoogleAuthGuard — OAuth flow guard
│   ├── roles.guard.ts             # RolesGuard — RBAC enforcement
│   └── m2m-jwt.guard.ts           # M2mJwtGuard — service-to-service auth
├── strategies/
│   ├── jwt.strategy.ts            # PassportStrategy('jwt') — validates JWT_SECRET
│   └── m2m-jwt.strategy.ts        # Machine-to-machine JWT strategy
├── decorators/
│   ├── current-user.decorator.ts  # @CurrentUser() — extracts user from request
│   └── roles.decorator.ts         # @Roles(UserRole.ADMIN, ...) — sets required roles
└── dtos/
    └── auth.payload.ts            # AuthPayload interface { sub, roles, scopes }
```

### `libs/rabbitmq/src/` — `@app/rabbitmq`

```
libs/rabbitmq/src/
├── app.module.ts                  # RabbitMQModule — configures @golevelup/nestjs-rabbitmq
├── exchanges/
│   ├── exchanges.ts               # ExchangeName + Exchanges config array
│   └── dl-exchange.ts             # Dead-letter exchange config
├── queues/
│   ├── queues.ts                  # Queue definitions
│   └── dl-queue.ts                # Dead-letter queue
└── routing-keys/
    ├── routing-keys.ts            # RoutingKey enum — all event routing keys
    └── dl-routing-keys.ts         # Dead-letter routing keys
```

### `libs/outbox/src/` — `@app/outbox`

```
libs/outbox/src/
├── outbox.module.ts               # OutboxModule — registers entity + processor
├── outbox.service.ts              # OutboxService.createOutboxMessage() — writes to outbox table
├── outbox.processor.ts            # OutboxProcessor — @Cron every 5s — publishes pending events
└── entities/
    └── outbox.entity.ts           # OutboxEntity: exchange, routingKey, payload, status, attempts
```

### `libs/blockchain/src/` — `@app/blockchain`

```
libs/blockchain/src/
├── blockchain.module.ts           # BlockchainModule — configures ethers.js + DI tokens
├── abi/
│   └── ArtAuctionEscrow.json      # Contract ABI (copied from smart-contracts/artifacts)
├── entities/
│   ├── blockchain-event-cursor.entity.ts    # Tracks last processed block per event type
│   └── blockchain-processed-event.entity.ts # Idempotency log for processed on-chain events
├── interfaces/
│   └── blockchain-config.interface.ts       # ESCROW_CONTRACT + PLATFORM_SIGNER DI tokens
└── services/
    ├── escrow-contract.service.ts  # EscrowContractService — wraps contract read/write calls
    └── blockchain-event-listener.service.ts # Subscribes to Ethereum events → publishes to RabbitMQ
```

---

## BE/smart-contracts/ — Hardhat Project

```
smart-contracts/
├── contracts/
│   └── ArtAuctionEscrow.sol       # Main contract — auction escrow, bidding, dispute resolution
├── scripts/
│   ├── deploy.ts                  # Mainnet/Sepolia deploy script
│   └── deploy.local.ts            # Local Hardhat node deploy
├── test/
│   └── ArtAuctionEscrow.test.ts   # Hardhat + Chai test suite
├── deployments/
│   └── sepolia.json               # Deployed contract address + ABI reference for Sepolia
├── typechain-types/               # Auto-generated TypeScript bindings (committed)
├── artifacts/                     # Compiled artifacts (committed)
├── hardhat.config.ts              # Hardhat config — networks (hardhat, sepolia), solidity version
├── package.json                   # Standalone Hardhat project dependencies
└── yarn.lock
```

---

## FE/ — Frontend

```
FE/
└── artium-web/                    # Next.js application
    ├── src/
    │   ├── pages/                 # Next.js Pages Router (file-based routing)
    │   │   ├── _app.tsx           # App entry point — SessionProvider + AuthBootstrap + layout
    │   │   ├── _document.tsx      # HTML document customization
    │   │   ├── index.tsx          # Root redirect
    │   │   ├── api/auth/[...nextauth].ts  # NextAuth Google OAuth handler
    │   │   ├── login.tsx          # Login page
    │   │   ├── artworks/[id].tsx  # Artwork detail
    │   │   ├── inventory/         # Seller inventory management
    │   │   ├── events/            # Art events listing + detail + guests
    │   │   ├── profile/[username]/ # Public user profiles + moments + moodboards
    │   │   ├── checkout/[artworkId].tsx
    │   │   ├── discover/          # Discovery / browse
    │   │   ├── artist/invoices/   # Invoice management
    │   │   ├── auction.tsx        # Blockchain auction UI
    │   │   └── ...
    │   │
    │   ├── @domains/              # Feature domain modules (co-located logic)
    │   │   ├── auth/              # Login, register, password reset
    │   │   │   ├── components/    # LoginForm, RegisterForm
    │   │   │   ├── hooks/         # useLogin, useRegister
    │   │   │   ├── services/      # authService.ts — API calls
    │   │   │   ├── stores/        # useAuthStore.ts — Zustand auth state
    │   │   │   └── views/         # Full-page view components
    │   │   ├── artwork-detail/    # Single artwork display
    │   │   ├── inventory/         # Seller artwork management
    │   │   ├── inventory-upload/  # Multi-step artwork upload wizard
    │   │   ├── events/            # Event creation + management
    │   │   ├── discover/          # Artwork/seller discovery + search
    │   │   ├── messaging/         # Chat conversations
    │   │   ├── portfolio/         # Seller portfolio display
    │   │   ├── profile/           # User profile view + edit
    │   │   ├── checkout/          # Purchase checkout flow
    │   │   ├── quick-sell/        # Invoice-based quick sale
    │   │   ├── community/         # (via moments, moodboards pages)
    │   │   ├── moments/           # Story-style moments
    │   │   ├── pricing/           # Subscription pricing
    │   │   ├── manage-plan/       # Subscription management
    │   │   ├── editorial/         # Editorial content
    │   │   └── home/              # Landing page sections
    │   │
    │   ├── @shared/               # Cross-domain shared infrastructure
    │   │   ├── apis/              # Per-resource API functions
    │   │   │   ├── artworkApis.ts
    │   │   │   ├── orderApis.ts
    │   │   │   ├── paymentApis.ts
    │   │   │   ├── eventsApis.ts
    │   │   │   ├── messagingApis.ts
    │   │   │   ├── profileApis.ts
    │   │   │   └── usersApi.ts
    │   │   ├── components/
    │   │   │   ├── ui/            # shadcn/ui design system components
    │   │   │   │   ├── button.tsx
    │   │   │   │   ├── dialog.tsx
    │   │   │   │   ├── input.tsx
    │   │   │   │   └── ... (40+ components)
    │   │   │   ├── layout/        # AppLayout, AuthLayout, SidebarLayout, MarketingLayout
    │   │   │   ├── auth/          # AuthBootstrap.tsx — hydrates auth on mount
    │   │   │   ├── LandingPage/   # Landing page sections
    │   │   │   ├── display/       # PageItemGroup, SideBar
    │   │   │   ├── address/       # AddressFormFields
    │   │   │   └── modals/        # PlanUpgradeModal
    │   │   ├── hooks/             # Shared hooks (pagination, debounce, etc.)
    │   │   ├── services/
    │   │   │   ├── apiClient.ts   # apiFetch — base fetch with auth token injection
    │   │   │   └── websocketClient.ts  # WebSocket connection to messaging gateway
    │   │   ├── types/             # Global TypeScript types
    │   │   ├── constants/         # Shared constants
    │   │   ├── utils/             # Utility functions
    │   │   ├── lib/               # Third-party library wrappers
    │   │   ├── mocks/             # Test/dev mock data
    │   │   └── styles/            # Shared CSS
    │   │
    │   ├── @types/                # Global TypeScript augmentations
    │   ├── components/            # Legacy/misc components
    │   │   └── SEO/               # SEO meta components
    │   ├── styles/                # Global CSS (globals.css)
    │   ├── types/                 # Page-level type declarations
    │   └── views/                 # Legacy view components
    │
    ├── public/                    # Static assets
    │   ├── images/                # Auth, blog, discover, homepage, logo images
    │   ├── fonts/
    │   └── videos/
    │
    ├── shared/                    # SVG icon components (outside src)
    │   └── icons/
    ├── conventions/               # FE coding conventions documentation
    ├── next.config.js             # Next.js config
    ├── tailwind.config.js         # Tailwind CSS config
    ├── tsconfig.json
    └── package.json
```

---

## Key Entry Points

| Entry Point | Location | Purpose |
|-------------|----------|---------|
| API Gateway bootstrap | `BE/apps/api-gateway/src/main.ts` | Starts gateway on port 8081 |
| Identity Service bootstrap | `BE/apps/identity-service/src/main.ts` | HTTP 3001 + TCP 3101 |
| Artwork Service bootstrap | `BE/apps/artwork-service/src/main.ts` | HTTP 3002 + TCP 3102 |
| Orders Service bootstrap | `BE/apps/orders-service/src/main.ts` | TCP 3104 |
| FE app entry | `FE/artium-web/src/pages/_app.tsx` | Next.js app root |
| FE Google OAuth | `FE/artium-web/src/pages/api/auth/[...nextauth].ts` | NextAuth handler |
| Smart contract | `BE/smart-contracts/contracts/ArtAuctionEscrow.sol` | Main Solidity contract |
| Contract deploy | `BE/smart-contracts/scripts/deploy.ts` | Sepolia deployment |
| RabbitMQ exchanges | `BE/libs/rabbitmq/src/exchanges/exchanges.ts` | Exchange definitions |
| Routing keys | `BE/libs/rabbitmq/src/routing-keys/routing-keys.ts` | Event routing key constants |
| Outbox processor | `BE/libs/outbox/src/outbox.processor.ts` | Event publishing cron |

---

## Configuration File Locations

| Config | Location |
|--------|----------|
| Service environment | `BE/apps/<service>/.env.local` |
| NestJS monorepo config | `BE/nest-cli.json` |
| Root TypeScript | `BE/tsconfig.json` |
| Path aliases | `BE/tsconfig.json` (`@app/*` → `libs/*/src`) |
| Docker infra (shared) | `BE/docker-compose.yml` |
| Docker databases (isolated) | `BE/docker-compose.isolated.yml` |
| Docker databases (shared) | `BE/docker-compose.shared.yml` |
| K8s service manifests | `BE/infrastructure/k8s/services/<service>/` |
| K8s infra manifests | `BE/infrastructure/k8s/infras/` |
| Hardhat config | `BE/smart-contracts/hardhat.config.ts` |
| Contract deployments | `BE/smart-contracts/deployments/sepolia.json` |
| Next.js config | `FE/artium-web/next.config.js` |
| Tailwind config | `FE/artium-web/tailwind.config.js` |
| FE TypeScript paths | `FE/artium-web/tsconfig.json` (`@shared/*`, `@domains/*`) |

---

## Naming Conventions

**Backend files:**
- Commands: `PascalCase.command.ts` (e.g., `CreateArtwork.command.ts`)
- Command handlers: `PascalCase.command.handler.ts`
- Queries: `PascalCase.query.ts`
- Query handlers: `PascalCase.query.handler.ts`
- Entities: `kebab-case.entity.ts` (e.g., `artwork-folder.entity.ts`)
- Repositories: `kebab-case.repository.ts`
- Interfaces: `kebab-case.repository.interface.ts`
- Controllers: `kebab-case.controller.ts`, `kebab-case.microservice.controller.ts`
- DTOs: `kebab-case.input.ts` (write), `kebab-case.object.ts` (read/response)

**Frontend files:**
- React components: `PascalCase.tsx` (e.g., `ArtworkCard.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useAuthStore.ts`)
- API functions: `camelCaseApis.ts` (e.g., `artworkApis.ts`)
- Domain directories: `kebab-case/` under `@domains/`
- Stores: `useNounStore.ts` pattern

---

## Where to Add New Code

**New microservice feature (command):**
1. Command class: `apps/<service>/src/application/commands/<Feature>.command.ts`
2. Handler: `apps/<service>/src/application/commands/handlers/<Feature>.command.handler.ts`
3. Register in `handlers/index.ts` array
4. HTTP controller: `apps/<service>/src/presentation/http/controllers/`
5. Microservice controller: `apps/<service>/src/presentation/microservice/`
6. Add TCP route to api-gateway: `apps/api-gateway/src/presentation/http/controllers/<domain>/`

**New shared DTO (cross-service):**
- `BE/libs/common/src/dtos/<service-domain>/`

**New domain entity:**
- Entity: `apps/<service>/src/domain/entities/<entity>.entity.ts`
- Repository interface: `apps/<service>/src/domain/interfaces/<entity>.repository.interface.ts`
- Repository implementation: `apps/<service>/src/infrastructure/repositories/<entity>.repository.ts`
- Bind in `app.module.ts`

**New RabbitMQ event:**
- Add routing key to `BE/libs/rabbitmq/src/routing-keys/routing-keys.ts`
- Publisher: `OutboxService.createOutboxMessage(exchange, routingKey, payload)` in command handler
- Consumer: `@RabbitSubscribe` in `apps/<service>/src/application/event-handlers/`

**New FE domain:**
1. Create `FE/artium-web/src/@domains/<domain-name>/`
2. Add subdirs: `components/`, `views/`, `hooks/`, `services/`, `types/`
3. Add page at `FE/artium-web/src/pages/<route>.tsx` importing from domain `views/`
4. Add API functions to `FE/artium-web/src/@shared/apis/<domain>Apis.ts`

**New shared UI component:**
- `FE/artium-web/src/@shared/components/ui/<ComponentName>.tsx`

---

*Structure analysis: 2026-04-21*
