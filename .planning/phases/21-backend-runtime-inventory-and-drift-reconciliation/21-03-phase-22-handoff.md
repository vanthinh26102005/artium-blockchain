# 21-03 Phase 22 Handoff

## Authoritative runtime contract

Phase 21 establishes the current backend runtime baseline from repository evidence, not from a desired deployment model.

- `21-01-runtime-workload-inventory.md` is the workload inventory source. It identifies active Compose workloads, supporting infrastructure, service startup commands, Dockerfile contracts, and current port evidence.
- `21-01-workload-classification.md` is the workload class source. It separates HTTP gateway, HTTP+TCP services, TCP-only services, websocket-enabled surfaces, stateful dependencies, and singleton/background processors.
- `21-02-dependency-environment-inventory.md` is the internal dependency and env-source map. It records gateway TCP edges, the non-gateway `orders-service -> artwork-service` RPC edge, database strategy wiring, broker/cache dependencies, and mounted-file assumptions.
- `21-02-external-integration-matrix.md` is the external system inventory. It covers PostgreSQL, Redis, RabbitMQ, Mailhog/SMTP, GCS, Stripe, blockchain RPC, and Google OAuth by variable name and mounted path only.
- `21-03-runtime-drift-audit.md` is the drift register. It records concrete mismatches across bootstraps, Dockerfiles, Compose, missing `.env.compose` evidence, and legacy Kubernetes artifacts.

The active local runtime truth is still Docker Compose plus service bootstraps. Legacy Kubernetes YAML is evidence of prior deployment experiments and dev-mode assumptions, not production truth. Dockerfiles are important image-contract evidence, but several `EXPOSE` values conflict with the active Compose/bootstrap runtime and must not be copied forward uncritically.

## Phase 22 inputs

Phase 22 should consume these Phase 21 artifacts directly:

| Input | Use in Phase 22 |
|---|---|
| `21-01-runtime-workload-inventory.md` | Build the service-role catalog from current workloads, ports, runtime modes, and active/orphan status. |
| `21-01-workload-classification.md` | Preserve distinctions between HTTP+TCP, TCP-only, websocket-enabled, stateful, and singleton/background workloads. |
| `21-02-dependency-environment-inventory.md` | Build the communication-path matrix from gateway TCP clients, service-to-service RPC, DB strategy, RabbitMQ, Redis, and mounted credentials. |
| `21-02-external-integration-matrix.md` | Include Stripe, RabbitMQ, BLOCKCHAIN_RPC_URL, GCS, SMTP/Mailhog, Google OAuth, and database dependencies in risk analysis. |
| `21-03-runtime-drift-audit.md` | Convert known drift into explicit service architecture risks and legacy/dev-artifact disposition guidance. |

Specific items Phase 22 must carry forward:

- Gateway is the public HTTP edge and also owns websocket gateway surfaces for auction and messaging namespaces.
- `identity-service`, `artwork-service`, `payments-service`, `orders-service`, and `messaging-service` are HTTP+TCP workloads in the current codebase.
- `events-service` and `community-service` are TCP-only bootstraps despite HTTP-style Compose/Dockerfile ports.
- `notifications-service` is HTTP-only in `main.ts`, while gateway dependency evidence expects a TCP target.
- `OutboxProcessor`, blockchain listener logic, payment confirmation retries, and notification cron behavior are singleton/background concerns that do not scale like plain stateless HTTP handlers.
- Shared-vs-isolated database strategy exists in repo artifacts, but the isolated runtime contract is not uniformly switched.
- The current checkout has no readable `BE/apps/**/.env.compose` files even though Compose and prior inventory artifacts reference them.
- Legacy Kubernetes manifests include `artworks-service`, `dev:artworks`, `emptyDir`, invalid volume names, and `NodePort` examples that require disposition before any production design reuses them.

## Open questions for architecture analysis

1. Which workloads are public edge, internal API/RPC services, worker-style services, websocket surfaces, stateful dependencies, and singleton/background processors?
2. Which communication paths are synchronous gateway TCP calls, direct service-to-service RPC, asynchronous RabbitMQ/outbox events, websocket traffic, or external callbacks/webhooks?
3. Should notifications remain HTTP-only, gain/restore TCP microservice bootstrap, or be treated as a drift risk for later implementation?
4. Are `events-service` and `community-service` intentionally TCP-only, or are Compose/Dockerfile HTTP-style ports legacy residue?
5. Is the split websocket ownership between `api-gateway` and `messaging-service` intentional architecture or overlapping experimentation?
6. Which background processors must be singleton-active, and what risk exists if they are horizontally scaled without coordination?
7. How should the architecture classify missing `.env.compose` evidence when Compose still references those files?
8. Which legacy Kubernetes files should be retired, rewritten from scratch, or kept only as historical reference?
9. Which current Dockerfile `EXPOSE` values are stale metadata versus still meaningful image-contract signals?
10. Which dependencies are safe local-dev conveniences and which must become production-grade service dependencies in later phases?

## Out-of-scope guardrails

Do not propose Kubernetes topology in Phase 21. Phase 21 stops at inventory, dependency mapping, and drift reconciliation.

Phase 22 may classify roles, map communication paths, identify risks, and disposition legacy/dev artifacts. It must still avoid choosing concrete Kubernetes namespace, ingress, service exposure, replica count, autoscaling, managed-vs-self-hosted dependency, or manifest implementation details; those belong to later phases after the architecture analysis is complete.

Do not treat legacy Kubernetes YAML as production design. Treat it as evidence to analyze, especially where it contains `NodePort`, `emptyDir`, dev commands, invalid volume names, or stale labels.

Do not treat missing `.env.compose` files as if their values are currently readable repository truth. Prior Phase 21 artifacts preserve the values they observed or planned against; Phase 22 should flag the missing files as config-source risk and keep analysis traceable to artifact filenames.

Do not collapse singleton/background behavior into generic stateless service guidance. Outbox publishing, blockchain listeners, payment confirmation retries, and notification cron processors need explicit architecture risk treatment before later workload design.
