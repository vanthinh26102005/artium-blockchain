# v1.2 Deployment Pitfalls Research

## High-Risk Pitfalls In This Repo

1. **Runtime drift across sources of truth**
   - Compose, `.env.compose`, Dockerfiles, and `main.ts` do not always agree on ports or runtime behavior.
   - Example: `payments-service` runs on `PORT=3003` in compose env but its Dockerfile exposes `3005`.
   - Example: `orders-service` runs on `PORT=3004` in compose env but its Dockerfile exposes `3006`.
   - Example: `events-service` and `community-service` default microservice ports in `main.ts` do not match `.env.compose`.

2. **Compose thinking leaking into Kubernetes**
   - Local startup relies on `depends_on` and service health ordering.
   - Kubernetes should use retries, readiness/startup probes, and migration jobs instead.

3. **Development-only container behavior**
   - Compose and old manifests run `yarn dev:*`, bind-mount the repo, and use mutable app paths.
   - Existing K8s manifests use `emptyDir` at `/app` and `NodePort`, which are not production-safe defaults.

4. **Schema sync and shared/isolated DB duality**
   - `.env.compose` files enable `DB_SYNCHRONIZE=true`.
   - The shared database helper creates schemas automatically in shared mode.
   - The milestone must choose a production database operating model instead of carrying both forever.

5. **In-process singleton/background work**
   - `OutboxProcessor` runs every 5 seconds via `ScheduleModule`.
   - `BlockchainEventListenerService` starts listeners on module init.
   - Scaling these workloads blindly can duplicate background side effects.

6. **Shallow or inconsistent health signals**
   - Some health endpoints are mock-like and do not verify real dependencies.
   - Old K8s manifests use TCP probes only.

7. **Webhook and secret sensitivity**
   - Stripe webhook verification depends on preserving the raw request body.
   - Production design must protect secrets without breaking webhook behavior.

