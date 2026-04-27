---
phase: 22
plan: 02
subsystem: planning-docs
tags: [deployment-strategy, architecture-risks, legacy-disposition, production-readiness]
requires:
  - phase: 22-01
    provides: service-role catalog and communication-path matrix
  - phase: 21
    provides: runtime drift audit and Phase 22 handoff
provides:
  - architecture risk register for current backend production concerns
  - legacy and dev-artifact disposition guidance for downstream platform phases
affects: [ARCH-03, ARCH-04, phase-23, phase-24, phase-25]
tech-stack:
  added: []
  patterns:
    - evidence-backed risk register with downstream owners
    - explicit exclude/revalidate/unresolved-drift disposition language
key-files:
  created:
    - .planning/phases/22-service-architecture-and-dependency-risk-analysis/22-03-risk-register.md
    - .planning/phases/22-service-architecture-and-dependency-risk-analysis/22-04-legacy-artifact-disposition.md
    - .planning/phases/22-service-architecture-and-dependency-risk-analysis/22-02-SUMMARY.md
  modified: []
key-decisions:
  - "Treat notifications transport mismatch, websocket ownership, DB strategy, singleton processors, Stripe raw-body handling, and mounted GCS credentials as high-priority production concerns."
  - "Use `exclude`, `revalidate`, and `analyze as unresolved current-state drift` as the only disposition labels for legacy/dev artifacts in Phase 22."
patterns-established:
  - "Risk rows include component, concern, evidence, disposition, and next phase owner."
  - "Legacy artifact guidance blocks direct production mirroring without choosing the later platform design."
requirements-completed: [ARCH-03, ARCH-04]
duration: 21 min
completed: 2026-04-27
---

# Phase 22 Plan 02: Architecture Risk and Legacy Artifact Disposition Summary

**Evidence-backed risk register and legacy-artifact disposition guide for the backend deployment strategy milestone.**

## Performance

- **Duration:** 21 min
- **Started:** 2026-04-27T14:40:00Z
- **Completed:** 2026-04-27T15:01:12Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `22-03-risk-register.md` with concrete production concerns covering transport drift, websocket trust boundaries, database strategy, singleton/background processors, Stripe raw-body handling, GCS mounted credentials, missing env files, Dockerfile port drift, and dormant CRM evidence.
- Created `22-04-legacy-artifact-disposition.md` with explicit guidance for dev K8s commands, `emptyDir`, `NodePort`, `artworks-service`, stale Dockerfile `EXPOSE` values, partial isolated-db mode, `crm-service`, and `CRM_SERVICE`.
- Preserved Phase 22 boundaries by ranking risks and assigning downstream owners without selecting topology, workload kind, exposure, or provider-hosting choices.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the architecture risk register from current-state evidence** - `18015183` (docs)
2. **Task 2: Create legacy and dev-artifact disposition guidance for downstream design** - `bf60b2b8` (docs)

## Files Created/Modified

- `.planning/phases/22-service-architecture-and-dependency-risk-analysis/22-03-risk-register.md` - Architecture risk register and highest-priority production concerns.
- `.planning/phases/22-service-architecture-and-dependency-risk-analysis/22-04-legacy-artifact-disposition.md` - Artifact disposition matrix and revalidate/exclude guidance.
- `.planning/phases/22-service-architecture-and-dependency-risk-analysis/22-02-SUMMARY.md` - Execution summary and verification evidence.

## Decisions Made

- Risk entries stay current-state and evidence-backed; later phases own solution choices.
- Legacy/dev artifact language is intentionally limited to `exclude`, `revalidate`, and unresolved-drift analysis so Phase 23 does not inherit stale YAML as production truth.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Referenced optional context files `22-RESEARCH.md` and `22-PATTERNS.md` were not present. Plan 22-02 had enough source evidence from Phase 21 plus Plan 22-01 artifacts, so no deliverable was blocked.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 23 can now consume `22-03-risk-register.md` and `22-04-legacy-artifact-disposition.md` as guardrails before any Kubernetes platform topology or workload design begins.

## Verification

- `git --no-pager grep -n -E "## Risk register|notifications-service|events-service|community-service|websocket|DB_STRATEGY|DB_SYNCHRONIZE|OutboxProcessor|blockchain-event-listener|Stripe|rawBody|GCS|Highest-priority production concerns" -- .planning/phases/22-service-architecture-and-dependency-risk-analysis/22-03-risk-register.md`
- `git --no-pager grep -n -E "## Disposition rules|## Artifact disposition matrix|## Revalidate-before-reuse items|## Explicit exclusions from direct production mirroring|artworks-service|emptyDir|NodePort|EXPOSE|crm-service|CRM_SERVICE|isolated-db|exclude|revalidate" -- .planning/phases/22-service-architecture-and-dependency-risk-analysis/22-04-legacy-artifact-disposition.md`
- Confirmed `22-03-risk-register.md` does not contain `StatefulSet` or `Replica count`.
- Confirmed `22-04-legacy-artifact-disposition.md` does not contain `Ingress` or `HorizontalPodAutoscaler`.

## Self-Check: PASSED

---
*Phase: 22-service-architecture-and-dependency-risk-analysis*
*Completed: 2026-04-27*
