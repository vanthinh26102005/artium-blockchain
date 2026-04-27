---
phase: 26-kubernetes-deployment-implementation-and-production-platform
plan: 02
subsystem: backend
tags: [nestjs, workers, kubernetes, cron, runtime-flags]
requires:
  - phase: 21-backend-runtime-inventory-and-drift-reconciliation
    provides: singleton/background workload classification
  - phase: 22-service-architecture-and-dependency-risk-analysis
    provides: singleton and side-effecting worker risk register
provides:
  - Runtime gates for outbox, blockchain listener, Ethereum confirmation retry, and notification retry processors
  - Worker responsibility contract for Helm chart templates
affects: [kubernetes, workers, background-processing, phase-26]
tech-stack:
  added: []
  patterns: [default-enabled env gates for local compatibility, singleton worker deployment contract]
key-files:
  created:
    - BE/infrastructure/helm/artium-backend/docs/workers.md
  modified:
    - BE/libs/outbox/src/outbox.processor.ts
    - BE/libs/blockchain/src/services/blockchain-event-listener.service.ts
    - BE/apps/payments-service/src/application/event-handlers/RetryStuckEthereumConfirmations.worker.ts
    - BE/apps/notifications-service/src/domain/processor/notification.processor.ts
key-decisions:
  - "Worker gates default to enabled so existing local/dev behavior remains unchanged."
  - "API pods will set worker flags to false while dedicated worker pods set one responsibility to true."
  - "Worker replicaCount remains 1 unless locking, leader election, or idempotency evidence exists."
patterns-established:
  - "Side-effecting processors check env gates before database/provider/transaction work."
  - "Helm worker docs define API-vs-worker flag values before templates wire them."
requirements-completed: [K8S-03, OPS-04]
duration: 27 min
completed: 2026-04-27
---

# Phase 26 Plan 02: Runtime Worker Gates Summary

**Default-enabled NestJS runtime gates that let Kubernetes API pods disable singleton background work while dedicated worker pods own it**

## Performance

- **Duration:** 27 min
- **Started:** 2026-04-27T19:28:00Z
- **Completed:** 2026-04-27T19:55:03Z
- **Tasks:** 4
- **Files modified:** 5

## Accomplishments

- Added `OUTBOX_PROCESSOR_ENABLED` before outbox database reads.
- Added `BLOCKCHAIN_LISTENER_ENABLED` before provider connection, cursor setup, backfill, polling, or live listener startup.
- Added `ETHEREUM_CONFIRMATION_RETRY_ENABLED` and `NOTIFICATION_PROCESSOR_ENABLED` before retry processor work.
- Documented API pod values, worker pod values, default replicas, and scale-out requirements.
- Verified the backend test suite with `yarn test --runInBand --passWithNoTests`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Gate the shared outbox scheduler with OUTBOX_PROCESSOR_ENABLED** - `b078d7f7`
2. **Task 2: Gate blockchain listener startup with BLOCKCHAIN_LISTENER_ENABLED** - `73bae358`
3. **Task 3: Gate payment and notification retry processors** - `42f81d08`
4. **Task 4: Document worker runtime contract for chart implementation** - `02222139`

## Files Created/Modified

- `BE/libs/outbox/src/outbox.processor.ts` - Adds the outbox scheduler env gate.
- `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts` - Adds the blockchain listener startup env gate.
- `BE/apps/payments-service/src/application/event-handlers/RetryStuckEthereumConfirmations.worker.ts` - Adds the Ethereum confirmation retry env gate.
- `BE/apps/notifications-service/src/domain/processor/notification.processor.ts` - Adds the notification requeue env gate.
- `BE/infrastructure/helm/artium-backend/docs/workers.md` - Documents worker responsibilities and scale-safety policy.

## Decisions Made

- Defaults remain enabled to avoid breaking local development and existing non-Kubernetes runs.
- Disabled branches return before expensive or side-effecting work, not after partial initialization.
- Dedicated worker scale-out is documented as blocked until coordination evidence exists.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed. **Impact on plan:** None.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required for runtime gates.

## Next Phase Readiness

Ready for `26-03`: Helm templates can wire API deployments with worker flags disabled and worker deployments with exactly one worker flag enabled.

---
*Phase: 26-kubernetes-deployment-implementation-and-production-platform*
*Completed: 2026-04-27*
