# v1.2 Deployment Architecture Research

## Recommended Translation To Kubernetes

- Put stateless application workloads in Kubernetes as `Deployment`s.
- Expose only the API gateway publicly through `Ingress`.
- Keep internal services private behind `ClusterIP` Services.
- Prefer one namespace per environment for the backend application.
- Keep PostgreSQL, Redis, and RabbitMQ managed externally first unless there is an explicit reason to operate them in-cluster.
- Use `Job`s for migrations and bootstrap tasks instead of relying on startup ordering.

## Brownfield Mapping Rules

1. Model the current service graph before changing topology.
2. Preserve current communication patterns first: gateway-to-service TCP, RabbitMQ async flows, websocket messaging, webhook callbacks.
3. Do not combine Kubernetes adoption with a database architecture rewrite unless the milestone explicitly chooses that scope.

## Exposure Model

- **Public:** API gateway, webhook-capable HTTP ingress
- **Private internal:** identity, artwork, payments, orders, messaging, notifications, events, community
- **External managed:** PostgreSQL, Redis, RabbitMQ, object storage, SMTP, Stripe, blockchain RPC

## Stateful Workload Guidance

- Use `StatefulSet` only if the team intentionally chooses to run RabbitMQ, Redis, or PostgreSQL in-cluster.
- Treat Mailhog as development-only and replace it with a real email provider in production.

