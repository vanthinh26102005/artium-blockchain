# Local Development Setup

## Prerequisites

- Node.js >= 18
- Yarn (backend), npm (frontend)
- Docker & Docker Compose
- Git

## Backend

```bash
cd BE
yarn install
yarn docker:up          # Start PostgreSQL, MySQL, Redis, RabbitMQ
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/identity-service/.env.example apps/identity-service/.env
# Repeat for other services as needed
yarn dev:all             # Start all services
```

## Frontend

```bash
cd FE/artium-web
npm install
cp .env.example .env     # Configure .env
npm run dev               # http://localhost:3000
```

## Smart Contracts

```bash
cd contracts
npm install
npx hardhat node          # Local Ethereum network
npx hardhat test          # Run contract tests
```

## Verify

- API Gateway: http://localhost:3001/graphql
- Frontend: http://localhost:3000
- RabbitMQ UI: http://localhost:15672 (guest/guest)
