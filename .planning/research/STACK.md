# v1.2 Deployment Stack Research

## Brownfield Constraints From This Repo

- Backend is a NestJS monorepo with an API gateway plus multiple domain services.
- Local runtime depends on PostgreSQL, RabbitMQ, Redis, and Mailhog.
- Some services require Stripe, blockchain RPC, platform private keys, SMTP, and GCS credentials.
- Existing Kubernetes manifests are dev-oriented and should be treated as topology clues, not production templates.

## Recommended Platform Stack

| Area | Recommendation | Why |
|---|---|---|
| Cluster | Managed Kubernetes | Avoid owning control-plane ops during first production rollout |
| Packaging | Helm | Reusable service pattern with environment-specific values |
| Registry | OCI registry with immutable tags | Safe rollback and repeatable deploys |
| Edge | Ingress controller + TLS automation | One public entrypoint, practical HTTP routing |
| Secrets | External secret manager synced to Kubernetes Secrets | Better rotation and separation from manifests |
| Identity | Workload identity where possible | Prefer cloud identity over mounted long-lived key files |
| Database | Managed PostgreSQL | Lower ops burden than many in-cluster databases |
| Cache | Managed Redis preferred | Keeps Kubernetes focused on app workloads |
| Broker | Managed RabbitMQ preferred; self-host only if necessary | Current app depends on RabbitMQ, but broker ops are non-trivial |
| Observability | Prometheus/Grafana baseline + centralized logs + OpenTelemetry | Enough for cross-service, webhook, and blockchain visibility |
| Delivery | GitHub Actions pipeline | Lowest-friction fit for this repository |

## Add Immediately

- Multi-stage production image strategy
- Immutable image tags or digests
- Readiness, startup, and liveness probe standards
- Resource requests/limits for every workload
- Rollback-friendly deployment process
- Explicit secret/config separation
- Backup and restore plan for stateful dependencies

## Avoid For v1.2

- Service mesh
- Per-service public ingress exposure
- Self-hosting every stateful dependency in-cluster by default
- Deploying `latest`
- Shipping `yarn dev:*`, source mounts, or mutable app directories to production

