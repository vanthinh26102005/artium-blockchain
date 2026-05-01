# Backend Architecture

## Overview

NestJS microservices monorepo using DDD, Clean Architecture, CQRS, and Event-Driven patterns.

## Service Map

| Service | Port | Responsibility |
|---------|------|----------------|
| api-gateway | 3001 | GraphQL/REST entry point |
| identity-service | 3002 | Auth, JWT, Firebase |
| artwork-service | 3003 | Artwork CRUD, metadata |
| orders-service | 3004 | Checkout, auctions |
| payments-service | 3005 | Stripe, blockchain escrow |
| messaging-service | 3006 | Real-time chat |
| community-service | 3007 | Forums, discussions |
| events-service | 3008 | Events, RSVPs |
| crm-service | 3009 | Marketing automation |
| notifications-service | 3010 | Email, push notifications |

## Layered Architecture

```
src/
├── domain/        # Pure business logic (entities, DTOs, events)
├── application/   # Use cases (commands, queries, handlers)
├── infrastructure/ # Repositories, cache, external APIs
└── presentation/  # Controllers, GraphQL resolvers
```

## Key Patterns

- **CQRS**: Commands (writes) separated from Queries (reads)
- **Event-Driven**: Domain events via RabbitMQ, outbox pattern for reliability
- **Dependency Inversion**: Domain defines interfaces, infrastructure implements them

## Infrastructure

- PostgreSQL (most services), MySQL (identity)
- Redis (caching, sessions)
- RabbitMQ (inter-service messaging)
- Docker Compose for local dev
