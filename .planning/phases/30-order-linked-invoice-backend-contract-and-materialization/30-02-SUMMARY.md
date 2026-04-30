---
phase: 30-order-linked-invoice-backend-contract-and-materialization
plan: 02
subsystem: api
tags: [nestjs, gateway, authorization, orders, invoices, frontend-api]
requires:
  - phase: 30
    provides: Payments-service `get_or_materialize_order_invoice` RPC
provides:
  - Authenticated `GET /orders/:id/invoice` gateway endpoint
  - Authorization-before-materialization ordering tests
  - Frontend `orderApis.getOrderInvoice` contract method
affects: [phase-31, order-detail, invoice-preview, frontend-api]
tech-stack:
  added: []
  patterns: [gateway authorization before downstream RPC, shared frontend response typing]
key-files:
  created:
    - BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts
  modified:
    - BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts
    - BE/libs/common/src/dtos/payments/invoices/order-invoice.dto.ts
    - FE/artium-web/src/@shared/apis/orderApis.ts
key-decisions:
  - "Authorize with getAuthorizedOrder before calling payments-service materialization."
  - "Keep Phase 30 frontend work to API typing only; no invoice UI was added."
patterns-established:
  - "Private order-derived resources preserve existing non-disclosing 404 behavior."
  - "Gateway builds the payments source DTO from the authorized order object, never from request body data."
requirements-completed: [OINV-01, OINV-02, OINV-03]
duration: 4min
completed: 2026-04-30
---

# Phase 30: Gateway Order Invoice Route Summary

**Authenticated order invoice endpoint with authorization-first payments RPC and frontend API contract**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-30T08:21:30Z
- **Completed:** 2026-04-30T08:25:47Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Added `GET /orders/:id/invoice` before the generic `GET /orders/:id` route.
- Injected the payments-service client into `OrdersController`.
- Built `OrderInvoiceSourceOrderDto` from the authorized order snapshot only after `getAuthorizedOrder(id, req.user?.id)` succeeds.
- Added Jest tests proving buyer/seller access, unauthorized 404 behavior, and no payments RPC before authorization.
- Added `OrderInvoiceResponse` types and `orderApis.getOrderInvoice` for Phase 31 UI work.

## Task Commits

1. **Task 1: Add authorized gateway route for order invoice reads** - `5181b8d1` (feat)
2. **Task 2: Add gateway unit tests for authorization and payment RPC ordering** - `738592dc` (test)
3. **Task 3: Add frontend API contract method without building UI** - `ec0b8795` (feat)

## Files Created/Modified

- `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts` - Authenticated invoice route and source DTO mapping.
- `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts` - Authorization and RPC ordering tests.
- `BE/libs/common/src/dtos/payments/invoices/order-invoice.dto.ts` - Added source item fields needed by gateway mapping.
- `FE/artium-web/src/@shared/apis/orderApis.ts` - Frontend invoice response types and API method.

## Decisions Made

- Unauthorized users continue to receive `Order not found`, matching the existing private order behavior.
- The frontend API layer exposes only the typed fetch method; UI controls remain deferred to Phase 31.

## Deviations from Plan

- Added `orderId`, `currency`, and `payoutStatus` to `OrderInvoiceSourceItemDto` so the gateway source mapping can be fully typed.

## Issues Encountered

- `yarn build:gateway` initially failed inside the sandbox because Corepack could not write to its home cache. The same command passed with approved escalation.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd BE && npx jest apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts --runInBand` - passed
- `cd BE && yarn build:gateway` - passed
- `cd FE/artium-web && npx tsc --noemit` - passed
- Structural `rg` checks for route, authorization call, payments RPC command, gateway tests, and frontend API method - passed

## Next Phase Readiness

Phase 31 can build invoice preview/export UI against `orderApis.getOrderInvoice`.

---
*Phase: 30-order-linked-invoice-backend-contract-and-materialization*
*Completed: 2026-04-30*
