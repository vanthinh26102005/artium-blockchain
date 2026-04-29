# Technology Stack

**Analysis Date:** 2026-04-21

## Languages

**Primary:**
- TypeScript ~5.9 — All backend microservices and frontend
- Solidity ^0.8.20 — Smart contracts (`BE/smart-contracts/contracts/ArtAuctionEscrow.sol`)

**Secondary:**
- JavaScript — Config files (ESLint, webpack, Tailwind)

## Runtime

**Environment:**
- Node.js (ES2023 target in `BE/tsconfig.json`)
- Timezone: Asia/Ho_Chi_Minh (set in all Docker services)

**Package Manager:**
- Yarn 1.22.22 (classic) — declared in `BE/package.json` via `"packageManager": "yarn@1.22.22"`
- Yarn Workspaces covering `apps/*`, `libs/*`, `packages/*`
- Lockfile: `BE/yarn.lock` present

## Frameworks

**Backend Core:**
- NestJS ^11.1.6 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) — monorepo microservice framework
- NestJS CQRS ^11.0.3 (`@nestjs/cqrs`) — Command/Query separation in all services
- NestJS Microservices ^11.1.11 (`@nestjs/microservices`) — TCP transport between API Gateway and services
- NestJS GraphQL ^13.2.0 + Apollo Server ^5.0.0 — GraphQL support (via `@nestjs/apollo`, `@nestjs/graphql`)
- NestJS WebSockets ^11.1.8 + Socket.IO — real-time messaging (`@nestjs/platform-socket.io`, `@nestjs/websockets`)
- NestJS Schedule ^6.0.1 — cron/scheduled tasks

**Frontend:**
- Next.js 16.1.1 (`FE/artium-web/package.json`) — React 19.2.3 app with App Router
- Tailwind CSS ^4 — utility-first CSS, configured in `FE/artium-web/tailwind.config.js`
- Radix UI — headless component primitives (accordion, dialog, dropdown, select, etc.)
- shadcn/ui pattern via `class-variance-authority` ^0.7.1 + `clsx`
- Zustand ^5.0.10 — client-side state management
- React Hook Form ^7.71.1 + Zod ^4.3.6 — form validation
- Recharts ^3.6.0 — data visualization/charts
- next-auth ^4.24.13 — authentication session management

**Smart Contracts:**
- Hardhat ^2.22.0 — compile, test, deploy framework (`BE/smart-contracts/`)
- OpenZeppelin Contracts ^5.0.2 — base contracts (`ReentrancyGuard` used in `ArtAuctionEscrow.sol`)
- Hardhat Ignition ^0.15.16 — deployment scripting
- TypeChain ^8.3.0 + `@typechain/ethers-v6` — TypeScript bindings for contracts
- ethers.js ^6.4.0 — blockchain interaction in both smart-contracts and backend (`@app/blockchain`)

**Testing:**
- Jest ^30.2.0 — test runner, configured in `BE/package.json`
- ts-jest ^29.4.4 — TypeScript Jest transformer
- `@nestjs/testing` ^11.1.6 — NestJS test utilities
- Supertest ^7.1.4 — HTTP integration testing
- Chai ^4.x + Mocha ^9.x — smart contract test assertions (Hardhat)
- `@nomicfoundation/hardhat-chai-matchers` — Hardhat-specific matchers
- `solidity-coverage` ^0.8.1 — Solidity test coverage

**Build/Dev:**
- Webpack ^5 + `run-script-webpack-plugin` — HMR for development (`BE/webpack-hmr.config.js`)
- SWC (`@swc/core`, `@swc/cli`) — fast TypeScript compilation
- `tsx` ^4.21.0 — TypeScript execution for seeds and scripts
- `concurrently` ^9.2.1 — run all services simultaneously

## Key Dependencies

**Critical:**
- `typeorm` ^0.3.27 + `@nestjs/typeorm` ^11.0.0 — ORM for all PostgreSQL services
- `pg` ^8.16.3 — PostgreSQL driver
- `stripe` ^20.1.2 — payment processing (payments-service)
- `ethers` ^6.4.0 — Ethereum interaction (blockchain lib + smart contract tests)
- `@golevelup/nestjs-rabbitmq` ^6.0.2 — RabbitMQ integration for event-driven messaging
- `firebase-admin` ^13.5.0 — Firebase Admin SDK (present in root dependencies)
- `@google-cloud/storage` ^7.18.0 — Google Cloud Storage for file uploads
- `cloudinary` ^2.5.1 — alternative/additional image CDN
- `@nestjs/jwt` ^11.0.0 + `passport-jwt` ^4.0.1 — JWT-based auth
- `bcrypt` ^6.0.0 / `bcryptjs` ^3.0.2 — password hashing
- `@nestjs-modules/mailer` ^2.0.2 + Handlebars adapter — transactional email
- `class-validator` ^0.14.2 + `class-transformer` ^0.5.1 — DTO validation
- `cache-manager` ^7.2.3 + `cache-manager-redis-store` ^3.0.1 — Redis caching

**Infrastructure:**
- `rxjs` ^7.8.2 — reactive streams (NestJS core)
- `multer` ^2.0.2 — multipart file upload handling
- `@nestjs/axios` ^4.0.1 — HTTP client module
- `google-auth-library` ^10.4.0 — Google OAuth verification

## Shared Libraries (BE/libs/)

All libraries are accessible via path aliases (`@app/<name>`):

| Alias | Path | Purpose |
|---|---|---|
| `@app/common` | `BE/libs/common/src/` | Shared filters, enums, `DynamicDatabaseModule`, transaction service |
| `@app/auth` | `BE/libs/auth/src/` | JWT strategies, guards (roles, jwt, m2m, google), decorators |
| `@app/rabbitmq` | `BE/libs/rabbitmq/src/` | Exchange/queue/routing-key definitions, RabbitMQ module |
| `@app/outbox` | `BE/libs/outbox/src/` | Transactional outbox pattern (outbox entity, service, processor) |
| `@app/blockchain` | `BE/libs/blockchain/src/` | Ethers provider, wallet signer, `EscrowContractService`, event listener |
| `@app/metrics` | `BE/libs/metrics/src/` | Metrics service (observability) |
| `@app/api-clients` | `BE/libs/api-clients/src/` | Inter-service HTTP clients |

## Configuration

**Environment:**
- Each service loads `.env.local` via `ConfigModule.forRoot({ envFilePath: './apps/<service>/.env.local' })`
- `DB_STRATEGY` env var controls `SHARED` vs `ISOLATED` database mode (see `DynamicDatabaseModule`)
- Key env vars per service: `PORT`, `MICROSERVICE_PORT`, `DB_*`, `REDIS_HOST/PORT`, `RABBITMQ_URI`, `JWT_SECRET`

**Build:**
- `BE/tsconfig.json` — root TypeScript config, ES2023 target, CommonJS module
- `BE/tsconfig.build.json` — build-specific, excludes tests
- `BE/nest-cli.json` — NestJS monorepo project definitions, webpack enabled per app
- `BE/eslint.config.mjs` — ESLint flat config with TypeScript-ESLint + Prettier
- `BE/.prettierrc` — `singleQuote: true`, `trailingComma: all`
- `FE/artium-web/next.config.ts` — Next.js config with remote image patterns
- `BE/smart-contracts/hardhat.config.ts` — Hardhat config, Solidity 0.8.20, Sepolia network

## Platform Requirements

**Development:**
- Docker + Docker Compose (two profiles: `shared` for single DB, `isolated` for per-service DBs)
- Yarn 1.22.22
- Node.js (ES2023 compatible)

**Production:**
- Docker Compose (`BE/docker-compose.yml`)
- Container orchestration via Skaffold (`BE/skaffold.yaml`)
- API Gateway at port 8081; each service at ports 3001–3008; TCP microservice ports 3101–3108

---

*Stack analysis: 2026-04-21*
