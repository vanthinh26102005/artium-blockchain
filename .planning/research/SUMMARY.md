# v1.2 Deployment Research Summary

## Key Findings

- Treat the backend as a brownfield multi-service platform and model the real runtime truth before designing Kubernetes.
- The safest first production topology is: API workloads in Kubernetes, public traffic only through the gateway, and stateful dependencies managed externally where possible.
- The biggest risks in this repo are runtime drift, dev-mode deployment artifacts, schema-sync assumptions, and background listeners/processors that do not scale like stateless APIs.

## Recommended Defaults

- Managed Kubernetes
- Helm-based deployments
- Ingress + TLS
- External secret manager integration
- Managed PostgreSQL and Redis; managed RabbitMQ if available
- Centralized logs, Prometheus-class metrics, and OpenTelemetry-ready tracing

## Explicit Avoids

- Service mesh
- Per-service public exposure
- In-cluster stateful stack by default
- Production manifests derived directly from current dev K8s YAML

## Downstream Planning Implications

1. First phase must inventory the backend runtime contract and reconcile drift.
2. A later phase should classify workloads and dependencies before choosing Kubernetes primitives.
3. Deployment design should separate stateless services from singleton/background workloads.
4. CI/CD, observability, health, secret handling, and recovery strategy should be treated as required outputs, not optional polish.
