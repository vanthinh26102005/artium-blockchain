# Phase 26: Kubernetes Deployment Implementation & Production Platform Stack Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-27
**Phase:** 26-kubernetes-deployment-implementation-and-production-platform
**Areas discussed:** Kubernetes target, secret management, managed dependencies, singleton/background deployment model, artifact scope, verification bar

---

## Kubernetes Target

| Option | Description | Selected |
|--------|-------------|----------|
| Generic managed Kubernetes | Real managed Kubernetes target, portable across GKE/EKS/AKS with provider-specific values isolated. | ✓ |
| GKE-oriented | Optimize for Google Cloud because the app already uses GCS, while keeping Helm mostly portable. | |
| EKS | Optimize for AWS-managed Kubernetes. | |
| AKS | Optimize for Azure-managed Kubernetes. | |
| Self-managed/VPS Kubernetes | Target self-operated cluster infrastructure. | |

**User's choice:** Generic managed Kubernetes.
**Notes:** User asked whether the phase can proceed with real Kubernetes. The decision is real managed Kubernetes as the primary target; local `kind`/Minikube is optional validation only.

---

## Secret Management

| Option | Description | Selected |
|--------|-------------|----------|
| External Secrets Operator | Sync secrets from provider systems such as AWS Secrets Manager, Google Secret Manager, Azure Key Vault, or Vault. | |
| Plain Kubernetes Secrets | Simple templates, but risky for Git and secret lifecycle. | |
| Sealed Secrets | Git-safe encrypted `SealedSecret` resources decrypted by the in-cluster controller. | ✓ |
| the agent decides | Use the recommended provider-neutral default. | |

**User's choice:** Sealed Secrets.
**Notes:** User asked whether External Secrets Operator requires payment or cloud provider keys. After explanation, user selected Sealed Secrets. Context must capture that External Secrets Operator is not the default.

---

## Stateful Dependencies

| Option | Description | Selected |
|--------|-------------|----------|
| Managed external services | Use managed PostgreSQL, Redis, and RabbitMQ for production; optional local-only charts. | |
| Run all dependencies inside Kubernetes | Include production-shaped in-cluster PostgreSQL, Redis, and RabbitMQ. | ✓ |
| Hybrid | Managed PostgreSQL, with Redis/RabbitMQ optionally in-cluster. | |
| the agent decides | Use the recommended managed-external default. | |

**User's choice:** Run all dependencies inside Kubernetes.
**Notes:** This intentionally diverges from the earlier research recommendation to prefer managed stateful dependencies. Planning must include persistent storage, backup/restore, probes, resources, network access, and upgrade guidance.

---

## Singleton/Background Deployment Model

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated worker deployments | Represent side-effecting processors/listeners as worker workloads with `replicaCount: 1` and scaling guardrails. | ✓ |
| Keep embedded in service pods | Simpler but requires constraining API replicas where duplicate processors are risky. | |
| Add leader election/locking first | More robust but likely expands application-code scope. | |
| the agent decides | Use the recommended dedicated-worker model. | |

**User's choice:** Dedicated worker deployments.
**Notes:** Applies to outbox processing, blockchain event listening, notification scheduled processing, and Ethereum retry work.

---

## Artifact Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full Kubernetes foundation | Helm charts, values, SealedSecret examples, in-cluster dependencies, workers, ingress/TLS, probes/resources, smoke scripts, rollback docs. | ✓ |
| Helm charts only | Smaller first slice but weak for an implementation phase. | |
| Manifests only, no Helm | Simpler but less maintainable across environments. | |
| Include CI deployment workflow too | Broader and may overlap Phase 24. | |

**User's choice:** Full Kubernetes foundation.
**Notes:** CI deployment workflow should stay aligned with Phase 24 rather than being reinvented.

---

## Verification Bar

| Option | Description | Selected |
|--------|-------------|----------|
| Render and schema validation | `helm lint`, `helm template`, and schema validation only. | |
| Local cluster validation | Render/schema validation plus apply to `kind` or Minikube. | |
| Real cluster validation | Render/schema validation plus deploy to an actual managed Kubernetes cluster and run smoke checks. | ✓ |
| the agent decides | Use real-cluster validation while keeping credentials optional for local automation. | |

**User's choice:** Real cluster validation.
**Notes:** Real managed-cluster validation is the acceptance target. Local automation can make cloud credentials optional, but docs and artifacts must support real deployment and smoke checks.

---

## the agent's Discretion

- Chart structure and exact Helm dependency choices.
- Exact smoke test implementation.
- Initial resource sizing, as long as values are explicit and documented.

## Deferred Ideas

- External Secrets Operator and cloud secret-manager integrations.
- Managed external PostgreSQL, Redis, and RabbitMQ.
- Full CI/CD deployment workflow beyond hooks/documented deploy commands.
- Application-level leader election or distributed locking unless required by planning.
