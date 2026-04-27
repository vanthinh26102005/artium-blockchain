# v1.2 Deployment Feature Research

## Table Stakes

- Internal service discovery through Kubernetes Services
- One controlled public ingress path with TLS
- Rolling deployment strategy with rollback path
- Real readiness/startup/liveness checks
- Structured logging and baseline metrics
- Secret handling separated from images and manifests
- Resource requests/limits and selective autoscaling
- Backup/restore and disaster recovery guidance
- Clear boundary between in-cluster workloads and managed external dependencies

## Differentiators

- Gateway-focused progressive delivery
- Queue-aware autoscaling for worker workloads
- Synthetic smoke checks after deploy
- Distributed tracing for request plus async event flows
- Runbook-driven failure drills

## Anti-Features

- Service mesh in the first production deployment milestone
- Multi-cluster active-active design
- Canary/blue-green for every internal service
- Full platform rewrite before one stable production rollout exists
- Copying Docker Compose topology 1:1 into Kubernetes

## Milestone Output Expectations

- Text architecture diagram of the current and target topology
- Step-by-step deployment plan
- Sample Kubernetes manifests
- Risk register with brownfield-specific mitigations

