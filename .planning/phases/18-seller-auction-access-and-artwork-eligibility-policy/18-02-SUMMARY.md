---
phase: 18-seller-auction-access-and-artwork-eligibility-policy
plan: 02
subsystem: api
tags: [nestjs, api-gateway, orders-service, roles, authorization]
requires:
  - phase: 18-01
    provides: Shared seller auction candidate DTOs and artwork-service candidate query
provides:
  - Seller-only `GET /auctions/seller/artwork-candidates` gateway endpoint
  - Orders-service active artwork lock query
  - Backend merge of `ACTIVE_ORDER_LOCK` into auction candidate eligibility
affects: [seller-auctions, api-gateway, orders-service, frontend-auction-picker]
tech-stack:
  added: []
  patterns: [JWT-derived seller identity, role-protected seller endpoint, order-lock reason merge]
key-files:
  created:
    - BE/apps/orders-service/src/application/queries/GetArtworkOrderLocks.query.ts
    - BE/apps/orders-service/src/application/queries/handlers/GetArtworkOrderLocks.query.handler.ts
    - BE/apps/orders-service/src/application/queries/handlers/GetArtworkOrderLocks.query.handler.spec.ts
  modified:
    - BE/apps/orders-service/src/domain/interfaces/order.repository.interface.ts
    - BE/apps/orders-service/src/infrastructure/repositories/order.repository.ts
    - BE/apps/orders-service/src/presentation/microservice/orders.microservice.controller.ts
    - BE/apps/orders-service/src/app.module.ts
    - BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts
key-decisions:
  - "The gateway derives seller identity only from `req.user.id` and accepts no client `sellerId`."
  - "Active order locks return only artwork IDs, not order or buyer details."
patterns-established:
  - "Seller-scoped gateway endpoints require `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.SELLER)`."
  - "Order lock state is merged at the gateway after artwork-service intrinsic eligibility."
requirements-completed: [SAUC-01, SAUC-02, SAUC-03]
duration: 4 min
completed: 2026-04-24
---

# Phase 18 Plan 02: Seller Gateway Candidate Endpoint Summary

**Seller-only auction candidate API with active order lock detection and secure seller scoping**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-24T18:06:25Z
- **Completed:** 2026-04-24T18:10:18Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- Added orders-service `GetArtworkOrderLocksQuery` and repository lookup for active order statuses.
- Added tests documenting active statuses and terminal statuses excluded from auction locks.
- Added protected `GET /auctions/seller/artwork-candidates` before the dynamic auction ID route and merged `ACTIVE_ORDER_LOCK` into candidate responses.

## Task Commits

1. **Plan implementation and tests** - `651f56c6` (feat)

**Plan metadata:** pending docs commit

## Files Created/Modified

- `BE/apps/orders-service/src/application/queries/GetArtworkOrderLocks.query.ts` - Active lock query input.
- `BE/apps/orders-service/src/application/queries/handlers/GetArtworkOrderLocks.query.handler.ts` - Active artwork lock handler.
- `BE/apps/orders-service/src/application/queries/handlers/GetArtworkOrderLocks.query.handler.spec.ts` - Handler and status list tests.
- `BE/apps/orders-service/src/infrastructure/repositories/order.repository.ts` - Distinct artwork ID lookup through `order_items`.
- `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts` - Seller-only candidate endpoint and lock merge.

## Decisions Made

The endpoint performs authorization at the gateway and never accepts a seller ID from query/body, while the frontend still remains a convenience-only gate.

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd BE && yarn test --runInBand GetArtworkOrderLocks` - passed
- `cd BE && yarn build:orders` - passed
- `cd BE && yarn build:gateway` - passed

## Next Phase Readiness

Plan 18-03 can consume `/auctions/seller/artwork-candidates` without passing `sellerId` and render backend-provided eligibility reasons.

## Self-Check: PASSED

---
*Phase: 18-seller-auction-access-and-artwork-eligibility-policy*
*Completed: 2026-04-24*
