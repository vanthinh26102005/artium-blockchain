---
phase: 22
plan: 01
subsystem: planning-docs
tags: [deployment-strategy, architecture-analysis, service-roles, communication-paths]
requires:
  - phase: 21
    provides: authoritative runtime inventory, dependency map, drift audit, and Phase 22 handoff
provides:
  - service-role catalog grounded in Phase 21 artifacts and direct source evidence
  - communication-path matrix across TCP RPC, RabbitMQ/outbox, websocket, and external provider boundaries
affects: [ARCH-01, ARCH-02, phase-22-wave-2, phase-23]
tech-stack:
  added: []
  patterns:
    - architecture analysis before platform topology design
    - explicit unresolved communication ambiguity tracking
key-files:
  created:
    - .planning/phases/22-service-architecture-and-dependency-risk-analysis/22-01-service-role-catalog.md
    - .planning/phases/22-service-architecture-and-dependency-risk-analysis/22-02-communication-path-matrix.md
    - .planning/phases/22-service-architecture-and-dependency-risk-analysis/22-01-SUMMARY.md
  modified: []
key-decisions:
  - "Use Phase 21 artifacts as the authority for current service roles instead of legacy Kubernetes YAML."
  - "Keep messaging websocket duplication, notifications transport mismatch, and events/community port ambiguity unresolved for risk analysis rather than normalizing them in the catalog."
patterns-established:
  - "Role and communication artifacts separate current-state evidence from later platform choices."
  - "Every communication category has direct evidence paths and an architectural note."
requirements-completed: [ARCH-01, ARCH-02]
duration: 28 min
completed: 2026-04-27
---

# Phase 22 Plan 01: Service Roles and Communication Paths Summary

**Current backend architecture model covering workload roles and communication paths without platform-design decisions.**

## Performance

- **Duration:** 28 min
- **Started:** 2026-04-27T14:30:00Z
- **Completed:** 2026-04-27T14:58:06Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `22-01-service-role-catalog.md` with a role taxonomy, service-role catalog, dependency graph summary, and open architecture questions for every current workload and grouped infrastructure.
- Created `22-02-communication-path-matrix.md` covering gateway TCP RPC, service-to-service RPC, RabbitMQ/outbox flow, websocket surfaces, Stripe/Google/SMTP/GCS/blockchain provider boundaries, and current communication ambiguities.
- Preserved Phase 22 scope by avoiding platform topology terms and keeping unresolved drift visible for Plan 22-02.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build the authoritative Phase 22 service-role catalog** - `77ed5d56` (docs)
2. **Task 2: Build the evidence-backed communication-path matrix** - `ab896d89` (docs)

## Files Created/Modified

- `.planning/phases/22-service-architecture-and-dependency-risk-analysis/22-01-service-role-catalog.md` - Current service role and dependency catalog.
- `.planning/phases/22-service-architecture-and-dependency-risk-analysis/22-02-communication-path-matrix.md` - Communication-path matrix and ambiguity register.
- `.planning/phases/22-service-architecture-and-dependency-risk-analysis/22-01-SUMMARY.md` - Execution summary and verification evidence.

## Decisions Made

- The catalog uses Phase 21 artifacts as source of truth and treats legacy Kubernetes YAML only as drift evidence.
- Messaging websocket duplication and notification/events/community transport mismatches remain unresolved architecture questions for Plan 22-02.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Referenced optional context files `22-RESEARCH.md` and `22-PATTERNS.md` were not present in the phase directory. Execution proceeded from Phase 21 artifacts and direct source files, which were sufficient for the planned deliverables.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 22-02 can now convert the role catalog and communication matrix into the production-risk register and legacy/dev-artifact disposition guidance.

## Verification

- `git --no-pager grep -n -E "## Scope and authority|## Role taxonomy|## Service role catalog|## Dependency graph summary|## Open architecture questions|api-gateway|notifications-service|events-service|community-service|crm-service|rabbitmq|db-shared|Primary role|Inbound surfaces|Outbound dependencies" -- .planning/phases/22-service-architecture-and-dependency-risk-analysis/22-01-service-role-catalog.md`
- `git --no-pager grep -n -E "## Internal RPC paths|## Async and event-driven paths|## Websocket and realtime paths|## External callback and provider boundaries|api-gateway.+identity-service|orders-service.+artwork-service|OutboxProcessor|websocket|Stripe webhook|Google OAuth|SMTP|GCS|Blockchain RPC|notifications-service|community-service|events-service" -- .planning/phases/22-service-architecture-and-dependency-risk-analysis/22-02-communication-path-matrix.md`
- Confirmed `22-01-service-role-catalog.md` does not contain `Ingress` or `Replica count`.
- Confirmed `22-02-communication-path-matrix.md` does not contain `HorizontalPodAutoscaler` or `Ingress`.

## Self-Check: PASSED

---
*Phase: 22-service-architecture-and-dependency-risk-analysis*
*Completed: 2026-04-27*
