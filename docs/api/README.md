# API Reference

## Overview

Artium uses a hybrid API approach: **GraphQL** (primary) via API Gateway and **REST** endpoints for specific services.

## API Gateway

- **URL**: `http://localhost:3001`
- **GraphQL Endpoint**: `http://localhost:3001/graphql`
- **Playground**: Available in development mode at `/graphql`

## Authentication

Most endpoints require JWT authentication:

```
Authorization: Bearer <jwt-token>
```

Obtain token via:
- `POST /auth/login` (REST)
- GraphQL `login` mutation

## Key Endpoints

### Identity Service (port 3002)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |
| GET | `/auth/profile` | Get current user |

### Artwork Service (port 3003)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/artworks` | List artworks |
| GET | `/artworks/:id` | Get artwork detail |
| POST | `/artworks` | Create artwork (auth) |
| PUT | `/artworks/:id` | Update artwork (auth) |

### Orders Service (port 3004)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/orders` | Create order |
| GET | `/orders/:id` | Get order detail |
| POST | `/orders/:id/checkout` | Initiate checkout |

### Payments Service (port 3005)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/payments/stripe` | Stripe payment |
| POST | `/payments/escrow` | Blockchain escrow |
| GET | `/payments/:id/status` | Payment status |

## Event-Driven Communication

Services communicate asynchronously via **RabbitMQ**:

- Domain events published to message queue
- Event handlers process side effects
- Outbox pattern ensures reliable delivery

## GraphQL Schema

See API Gateway's GraphQL schema via the Playground at `http://localhost:3001/graphql` in development mode.
