---
phase: 26-kubernetes-deployment-implementation-and-production-platform
plan: 03
subsystem: infra
tags: [helm, kubernetes, ingress, sealed-secrets, networkpolicy, pdb]
requires:
  - phase: 26-kubernetes-deployment-implementation-and-production-platform
    provides: Helm values and runtime worker gates from plans 26-01 and 26-02
provides:
  - API Deployment, worker Deployment, Service, Ingress, SealedSecret, NetworkPolicy, and PDB Helm templates
  - Sealed Secrets placeholder example and kubeseal helper script
affects: [kubernetes, helm, ingress, secrets, workers]
tech-stack:
  added: [Kubernetes Ingress, SealedSecret, NetworkPolicy, PodDisruptionBudget]
  patterns: [gateway-only ingress, ClusterIP service exposure, values-driven worker env flags]
key-files:
  created:
    - BE/infrastructure/helm/artium-backend/templates/configmap.yaml
    - BE/infrastructure/helm/artium-backend/templates/deployment.yaml
    - BE/infrastructure/helm/artium-backend/templates/worker-deployment.yaml
    - BE/infrastructure/helm/artium-backend/templates/service.yaml
    - BE/infrastructure/helm/artium-backend/templates/ingress.yaml
    - BE/infrastructure/helm/artium-backend/templates/sealedsecret.yaml
    - BE/infrastructure/helm/artium-backend/templates/networkpolicy.yaml
    - BE/infrastructure/helm/artium-backend/templates/pdb.yaml
    - BE/infrastructure/helm/artium-backend/examples/sealed-secrets.example.yaml
    - BE/infrastructure/helm/artium-backend/scripts/seal-secrets.sh
  modified: []
key-decisions:
  - "Ingress routes only to api-gateway; backend service templates remain ClusterIP."
  - "API deployments explicitly disable all worker flags; dedicated worker deployments enable one responsibility."
  - "Sealed Secrets examples use encrypted placeholders only and the helper script warns against committing plaintext Secrets."
patterns-established:
  - "Templates range over values to keep service catalog changes centralized."
  - "NetworkPolicy, SealedSecret, and ingress behavior are gated by values."
requirements-completed: [K8S-02, K8S-03, K8S-04, OPS-02, OPS-04, OPS-05, DELV-03]
duration: 16 min
completed: 2026-04-27
---

# Phase 26 Plan 03: Kubernetes Templates Summary

**Values-driven Helm templates for private backend Services, gateway-only Ingress, singleton workers, Sealed Secrets, NetworkPolicy, and PDBs**

## Performance

- **Duration:** 16 min
- **Started:** 2026-04-27T19:43:00Z
- **Completed:** 2026-04-27T19:59:15Z
- **Tasks:** 4
- **Files modified:** 10

## Accomplishments

- Added runtime ConfigMap and API Deployment templates with resources and probes.
- Added dedicated worker Deployment template with scale guardrails and runtime flag wiring.
- Added private ClusterIP Services and gateway-only TLS Ingress paths.
- Added SealedSecret, NetworkPolicy, PodDisruptionBudget templates, placeholder sealed-secret example, and `kubeseal` helper script.

## Task Commits

Each task was committed atomically:

1. **Task 1: Render ConfigMap and API Deployments from the service catalog** - `f40c11d2`
2. **Task 2: Render dedicated worker deployments with replicaCount 1** - `1dbbbefb`
3. **Task 3: Render private Services and gateway-only TLS Ingress** - `f185cfe5`
4. **Task 4: Add SealedSecret, NetworkPolicy, and disruption templates** - `3b267dc1`

## Files Created/Modified

- `BE/infrastructure/helm/artium-backend/templates/configmap.yaml` - Non-secret runtime configuration.
- `BE/infrastructure/helm/artium-backend/templates/deployment.yaml` - API/service Deployment template.
- `BE/infrastructure/helm/artium-backend/templates/worker-deployment.yaml` - Dedicated worker Deployment template.
- `BE/infrastructure/helm/artium-backend/templates/service.yaml` - Internal ClusterIP Service template.
- `BE/infrastructure/helm/artium-backend/templates/ingress.yaml` - Gateway-only TLS Ingress template.
- `BE/infrastructure/helm/artium-backend/templates/sealedsecret.yaml` - Optional SealedSecret template.
- `BE/infrastructure/helm/artium-backend/templates/networkpolicy.yaml` - Network boundary templates.
- `BE/infrastructure/helm/artium-backend/templates/pdb.yaml` - Disruption budget templates.
- `BE/infrastructure/helm/artium-backend/examples/sealed-secrets.example.yaml` - Encrypted placeholder example.
- `BE/infrastructure/helm/artium-backend/scripts/seal-secrets.sh` - `kubeseal` helper script.

## Decisions Made

- Kept public exposure concentrated on `api-gateway`.
- Used value gates for Sealed Secrets and NetworkPolicy so local validation can opt in/out without changing templates.
- Rendered worker pods as Deployments, not Jobs, because they are long-running processors.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed. **Impact on plan:** None.

## Issues Encountered

`helm` is not installed in this execution environment, so `helm lint BE/infrastructure/helm/artium-backend` and `helm template ...` could not be run here. File-level plan verification passed; Helm CLI validation remains part of user setup and Phase 26 operational validation.

## User Setup Required

Install `helm` before running chart lint/render/deploy commands.

## Next Phase Readiness

Ready for `26-04`: validation scripts and runbooks can now target the chart path and templates created here.

---
*Phase: 26-kubernetes-deployment-implementation-and-production-platform*
*Completed: 2026-04-27*
