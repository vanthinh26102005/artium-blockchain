# Phase 26: Kubernetes Deployment Implementation & Production Platform Stack Foundation - Context

**Gathered:** 2026-04-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 26 implements the production Kubernetes foundation approved by Phases 23-25. It should create deployable, production-shaped Kubernetes and Helm artifacts for the backend platform: application workloads, in-cluster stateful dependencies, gateway ingress/TLS, Sealed Secrets, dedicated worker workloads, probes/resources, smoke checks, rollback guidance, and real-cluster validation.

This phase is not another analysis-only phase. It should not redesign service architecture, invent a new CI/CD strategy independent of Phase 24, or copy legacy development Kubernetes YAML into production artifacts.

</domain>

<decisions>
## Implementation Decisions

### Kubernetes target
- **D-01:** Target a real managed Kubernetes cluster, not only local `kind`/Minikube or render-only manifests.
- **D-02:** Keep the implementation provider-portable across managed Kubernetes providers such as GKE, EKS, and AKS.
- **D-03:** Provider-specific configuration must be isolated behind values files, documented overlays, or optional examples rather than hardcoded into the core chart.
- **D-04:** Local `kind`/Minikube validation is optional and secondary; it must not define the production contract.

### Secret management
- **D-05:** Use Sealed Secrets as the default secret-management approach for Phase 26.
- **D-06:** Real secret values must never be committed as plain Kubernetes `Secret` manifests or planning examples.
- **D-07:** Produce `SealedSecret` examples and bootstrap documentation for installing the controller and using `kubeseal`.
- **D-08:** Include Sealed Secrets private key backup, restore, renewal, and rotation guidance. Planners must treat controller key loss as an operational recovery risk.
- **D-09:** External Secrets Operator is not the default for this phase. It may be mentioned as a future alternative, but Phase 26 should not require AWS/GCP/Azure secret-manager accounts or provider API keys.

### Stateful dependencies
- **D-10:** Run PostgreSQL, Redis, and RabbitMQ inside Kubernetes for this phase.
- **D-11:** In-cluster stateful dependencies must be production-shaped: persistent volumes, resource requests/limits, probes, backup/restore guidance, upgrade notes, and restricted network access.
- **D-12:** Prefer maintained Helm dependencies or operators over ad hoc hand-written development YAML where reasonable.
- **D-13:** Mailhog remains development-only and must not be part of production Kubernetes.
- **D-14:** Managed external PostgreSQL/Redis/RabbitMQ services are deferred alternatives, not the Phase 26 default.

### Singleton and background work
- **D-15:** Represent singleton/background responsibilities as dedicated worker deployments where practical.
- **D-16:** `OutboxProcessor`, blockchain event listening, notification scheduled processing, and Ethereum retry work must not be blindly replicated with stateless API pods.
- **D-17:** Default worker `replicaCount` is `1`.
- **D-18:** Scaling a worker above one replica requires explicit locking, leader-election, idempotency, or coordination evidence.
- **D-19:** API workloads can scale independently from worker workloads when their side-effecting processors are separated or otherwise constrained.

### Artifact scope
- **D-20:** Produce a full Kubernetes foundation, not a chart skeleton only.
- **D-21:** Scope includes Helm chart(s), environment values, SealedSecret examples, in-cluster PostgreSQL/Redis/RabbitMQ setup, dedicated worker deployments, gateway Ingress with TLS, internal ClusterIP services, ConfigMaps, runtime env wiring, probes, resources, smoke scripts, and rollback/runbook docs.
- **D-22:** CI deployment workflow remains dependent on Phase 24 outputs. Phase 26 may include deploy commands or hooks, but must not invent a separate CI/CD design.

### Verification
- **D-23:** Phase 26 is done only after real-cluster validation is planned and supported.
- **D-24:** Verification should include `helm lint`, `helm template`, schema validation such as `kubeconform`, deployment to an actual managed Kubernetes cluster when credentials are available, and smoke checks against the deployed gateway.
- **D-25:** Automated local runs may keep real-cluster credentials optional, but the implementation must document the real-cluster validation path as the primary acceptance bar.

### the agent's Discretion
- Exact chart layout, naming, values file structure, and dependency chart selection are left to the planner, provided the artifacts remain maintainable and provider-portable.
- Exact smoke test implementation is flexible, provided it validates gateway reachability and at least one representative internal dependency path without exposing private services publicly.
- Exact resource requests/limits may start conservative and documented, then be tuned in later operational work.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition and requirements
- `.planning/ROADMAP.md` — Phase 26 goal, dependency, requirements, and success criteria.
- `.planning/REQUIREMENTS.md` — K8S, DOCK, OPS, and DELV requirements that Phase 26 must satisfy or build upon.
- `.planning/PROJECT.md` — v1.2 backend deployment strategy milestone goals and deployment decision principles.
- `.planning/STATE.md` — Active deployment decisions and prior phase guardrails.

### Deployment research
- `.planning/research/SUMMARY.md` — Deployment research summary and recommended defaults.
- `.planning/research/STACK.md` — Recommended platform stack and avoid list.
- `.planning/research/ARCHITECTURE.md` — Kubernetes translation guidance and exposure model.
- `.planning/research/PITFALLS.md` — Brownfield deployment risks this phase must avoid.
- `.planning/research/FEATURES.md` — Expected deployment features and anti-features.

### Prior phase artifacts
- `.planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-01-workload-classification.md` — Workload classes, websocket surfaces, stateful dependencies, and singleton/background findings.
- `.planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-03-runtime-drift-audit.md` — Runtime drift that must not be copied into production manifests.
- `.planning/phases/22-service-architecture-and-dependency-risk-analysis/22-03-risk-register.md` — Production risks for transport drift, singleton processors, database lifecycle, secrets, and callbacks.
- `.planning/phases/22-service-architecture-and-dependency-risk-analysis/22-04-legacy-artifact-disposition.md` — Legacy Kubernetes and Docker artifacts to exclude, revalidate, or treat as unresolved drift.

### External tool references
- `https://github.com/bitnami-labs/sealed-secrets` — Official Sealed Secrets project documentation for controller/kubeseal behavior, safe Git storage, certificate usage, and key backup/restore.
- `https://external-secrets.io/latest/introduction/overview/` — External Secrets Operator overview; considered during discussion but not selected as the Phase 26 default.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BE/apps/*/Dockerfile`: Existing per-service image contracts are starting points only; several `EXPOSE` values drift from runtime ports and must be revalidated before chart values use them.
- `BE/docker-compose*.yml`: Useful as dependency and service-shape evidence, but Compose startup ordering and missing `.env.compose` files must not become production assumptions.
- `BE/libs/outbox/src/outbox.processor.ts`: Defines scheduled outbox behavior that should be represented as singleton worker responsibility.
- `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts`: Defines blockchain listener behavior that needs single-active deployment semantics.
- `BE/apps/payments-service/src/application/event-handlers/RetryStuckEthereumConfirmations.worker.ts`: Defines retry worker behavior that must be separated or constrained.
- `BE/apps/notifications-service/src/domain/processor/notification.processor.ts`: Defines scheduled notification processing that should not scale accidentally.

### Established Patterns
- Backend is a NestJS monorepo with an API gateway plus multiple services using HTTP, TCP microservice transport, RabbitMQ events, websocket surfaces, and shared libraries.
- Public traffic should concentrate at the API gateway. Internal services should remain private behind Kubernetes Services.
- Runtime evidence has drift across code, Dockerfiles, Compose, missing env files, and legacy Kubernetes YAML; production artifacts must choose explicit contracts rather than copy existing manifests.
- The current backend has both stateless API behavior and side-effecting background behavior. Deployment topology must reflect that distinction.

### Integration Points
- Gateway Ingress must preserve Stripe webhook raw-body requirements and websocket paths where applicable.
- Internal ClusterIP services must support gateway-to-service TCP paths and any service-owned HTTP health/probe endpoints.
- PostgreSQL, Redis, and RabbitMQ charts/operators must provide stable service DNS and secrets consumed by backend env wiring.
- SealedSecret outputs must become normal Kubernetes Secrets referenced by Deployment env vars, volume mounts, and image pull configuration.

</code_context>

<specifics>
## Specific Ideas

- User explicitly chose real managed Kubernetes as the target while keeping provider-specific configuration portable.
- User explicitly chose Sealed Secrets over External Secrets Operator to avoid requiring cloud-provider secret-manager accounts or API keys during this phase.
- User explicitly chose in-cluster PostgreSQL, Redis, and RabbitMQ for production Phase 26 artifacts.
- User explicitly chose dedicated worker deployments for singleton/background tasks.
- User explicitly chose full Kubernetes foundation artifacts and real-cluster validation.

</specifics>

<deferred>
## Deferred Ideas

- External Secrets Operator integration with AWS/GCP/Azure/Vault is deferred. It can be revisited later if the project chooses a specific cloud secret manager.
- Managed external PostgreSQL, Redis, and RabbitMQ are deferred alternatives. Phase 26 defaults to in-cluster dependencies.
- Full CI/CD deployment workflow design remains governed by Phase 24 and should not be independently redesigned here.
- Leader election or distributed locking inside application code is deferred unless planning finds it already exists or is required to make worker separation safe.

</deferred>

---

*Phase: 26-kubernetes-deployment-implementation-and-production-platform*
*Context gathered: 2026-04-27*
