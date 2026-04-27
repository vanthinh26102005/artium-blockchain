---
phase: 26-kubernetes-deployment-implementation-and-production-platform
plan: 01
subsystem: infra
tags: [helm, kubernetes, bitnami, postgres, redis, rabbitmq]
requires:
  - phase: 22-service-architecture-and-dependency-risk-analysis
    provides: legacy Kubernetes disposition and dependency guardrails
provides:
  - Production Helm chart root for the Artium backend platform
  - Provider-portable service catalog with immutable image inputs
  - Production and kind values overlays
  - Chart usage and legacy-manifest guardrail documentation
affects: [kubernetes, helm, deployment, phase-26]
tech-stack:
  added: [Helm chart, Bitnami PostgreSQL chart, Bitnami Redis chart, Bitnami RabbitMQ chart]
  patterns: [provider-portable values overlays, immutable image placeholders, legacy manifest exclusion]
key-files:
  created:
    - BE/infrastructure/helm/artium-backend/Chart.yaml
    - BE/infrastructure/helm/artium-backend/values.yaml
    - BE/infrastructure/helm/artium-backend/values-production.yaml
    - BE/infrastructure/helm/artium-backend/values-kind.yaml
    - BE/infrastructure/helm/artium-backend/templates/_helpers.tpl
    - BE/infrastructure/helm/artium-backend/templates/namespace.yaml
    - BE/infrastructure/helm/artium-backend/README.md
  modified: []
key-decisions:
  - "Pinned Bitnami chart dependencies: PostgreSQL 17.1.0, Redis 23.1.1, RabbitMQ 16.0.16."
  - "Kept production chart values provider-portable, with production and kind behavior isolated in overlay files."
  - "Defaulted all application Services to ClusterIP and all workload image tags to immutable placeholders."
patterns-established:
  - "Core chart values define the production contract; environment overlays tune cluster-specific behavior."
  - "Legacy BE/infrastructure/k8s manifests are reference-only and must not be copied into production templates."
requirements-completed: [K8S-01, K8S-02, DOCK-01, DOCK-02, DOCK-03, DELV-03]
duration: 24 min
completed: 2026-04-27
---

# Phase 26 Plan 01: Helm Chart Foundation Summary

**Provider-portable Helm chart foundation with pinned in-cluster PostgreSQL, Redis, RabbitMQ dependencies and immutable backend image inputs**

## Performance

- **Duration:** 24 min
- **Started:** 2026-04-27T19:28:00Z
- **Completed:** 2026-04-27T19:52:11Z
- **Tasks:** 4
- **Files modified:** 7

## Accomplishments

- Created the Helm chart root under `BE/infrastructure/helm/artium-backend/`.
- Added pinned Bitnami PostgreSQL, Redis, and RabbitMQ dependency declarations.
- Defined a provider-portable service catalog with exact backend ports, ClusterIP exposure, worker flags, and immutable image placeholders.
- Added production and kind values overlays with persistence, ingress, Sealed Secrets, and resource defaults.
- Documented the production target, first Helm validation commands, and legacy manifest exclusions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Helm chart root and dependency declarations** - `3138d08c`
2. **Task 2: Define provider-portable default values and service catalog** - `9d11769e`
3. **Task 3: Add production and local validation overlays** - `57a9a633`
4. **Task 4: Document chart usage and legacy-manifest guardrails** - `b8574cea`

## Files Created/Modified

- `BE/infrastructure/helm/artium-backend/Chart.yaml` - Helm chart root with pinned Bitnami dependencies.
- `BE/infrastructure/helm/artium-backend/values.yaml` - Default production-shaped service catalog and dependency values.
- `BE/infrastructure/helm/artium-backend/values-production.yaml` - Real-cluster production overlay.
- `BE/infrastructure/helm/artium-backend/values-kind.yaml` - Optional local validation overlay.
- `BE/infrastructure/helm/artium-backend/templates/_helpers.tpl` - Shared Helm naming, label, service, and image helpers.
- `BE/infrastructure/helm/artium-backend/templates/namespace.yaml` - Optional namespace creation template.
- `BE/infrastructure/helm/artium-backend/README.md` - Operator bootstrap and guardrail documentation.

## Decisions Made

- Used current upstream Bitnami chart metadata as the dependency pin source during execution.
- Chose immutable tag placeholders instead of defaulting to development or moving tags.
- Kept `kind` values explicitly secondary so local validation cannot redefine production.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed. **Impact on plan:** None.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required for this repository-side chart foundation.

## Next Phase Readiness

Ready for `26-02`: runtime worker gates can now align with the worker flags already declared in chart values.

---
*Phase: 26-kubernetes-deployment-implementation-and-production-platform*
*Completed: 2026-04-27*
