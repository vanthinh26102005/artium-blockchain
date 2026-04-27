---
phase: 21
plan: 01
subsystem: planning-docs
tags: [deployment-strategy, runtime-inventory, compose, docker, k8s-drift]
requires:
  - phase: 21
    provides: verified Phase 21 execution plans
provides:
  - authoritative runtime workload inventory for current backend workloads and infra
  - workload classification across HTTP+TCP, TCP-only, websocket, stateful, and singleton/background modes
affects: [DISC-01, DISC-04, phase-21-wave-1]
tech-stack:
  added: []
  patterns:
    - evidence-backed runtime inventory before deployment design
    - workload classification tied to bootstrap and gateway code instead of assumptions
key-files:
  created:
    - .planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-01-runtime-workload-inventory.md
    - .planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-01-workload-classification.md
    - .planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-01-SUMMARY.md
key-decisions:
  - "Treat the current Compose, env, bootstrap, and Dockerfile evidence as runtime truth inputs and keep Kubernetes recommendations out of Plan 21-01."
  - "Classify crm-service as an orphan candidate because package, bootstrap, and Dockerfile evidence exists while the current compose runtime omits it."
patterns-established:
  - "Phase 21 runtime artifacts cite exact source files for every workload row instead of relying on historical assumptions."
  - "Singleton/background behaviors are documented alongside transport classes so later phases do not treat every workload as stateless."
requirements-completed: [DISC-01, DISC-04]
completed: 2026-04-27
---

# Phase 21 Plan 01: Backend runtime inventory and drift reconciliation Summary

**Captured the current backend runtime baseline: every evidenced workload, its active runtime mode, startup contract, port wiring, and the singleton/websocket traits that Phase 22 must respect.**

## Accomplishments

- Created `21-01-runtime-workload-inventory.md` as the single runtime inventory source for active services, supporting infra, per-service databases, and the orphaned `crm-service` candidate.
- Added a dedicated ports/startup matrix that makes the current code/env/compose/Dockerfile differences visible without drifting into design recommendations.
- Created `21-01-workload-classification.md` to separate HTTP+TCP, TCP-only, websocket-enabled, stateful, and singleton/background workloads from the same evidence set.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Phase 21 now has an authoritative workload baseline that Plan 21-02 can use to map internal dependencies and external integrations without re-inventorying the repo.
- The largest runtime inconsistencies are now isolated to dependency wiring and drift analysis rather than workload discovery.

## Verification

- `rg "## Workload inventory|## Ports and startup matrix|Runtime mode|Startup command|Env source|Dockerfile path|\\| api-gateway \\||\\| notifications-service \\||\\| crm-service \\||\\| db-shared \\||\\| rabbitmq \\||\\| mailhog \\||Orphaned or legacy workload evidence" .planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-01-runtime-workload-inventory.md`
- `rg "HTTP\\+TCP|TCP-only|websocket-enabled|stateful|singleton/background|OutboxProcessor|blockchain-event-listener" .planning/phases/21-backend-runtime-inventory-and-drift-reconciliation/21-01-workload-classification.md`
- Confirmed the inventory does not contain `Ingress` or `HorizontalPodAutoscaler`, and the classification does not contain `StatefulSet`.

## Self-Check: PASSED

---
*Phase: 21-backend-runtime-inventory-and-drift-reconciliation*
*Completed: 2026-04-27*
