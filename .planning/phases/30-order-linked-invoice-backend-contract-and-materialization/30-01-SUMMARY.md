---
phase: 30-order-linked-invoice-backend-contract-and-materialization
plan: 01
subsystem: payments
tags: [nestjs, cqrs, invoices, orders, materialization, jest]
requires:
  - phase: 29
    provides: Current order and payment service contracts
provides:
  - Shared order invoice DTOs for backend and frontend consumers
  - Payments-service `get_or_materialize_order_invoice` RPC
  - Idempotent order invoice materialization backed by existing invoice tables
affects: [phase-31, orders, payments, invoice-preview]
tech-stack:
  added: []
  patterns: [CQRS query handler, deterministic invoice number, duplicate reread idempotency]
key-files:
  created:
    - BE/libs/common/src/dtos/payments/invoices/order-invoice.dto.ts
    - BE/apps/payments-service/src/application/queries/invoices/GetOrderInvoice.query.ts
    - BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.ts
    - BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts
  modified:
    - BE/libs/common/src/dtos/payments/invoices/index.ts
    - BE/libs/common/src/index.ts
    - BE/apps/payments-service/src/application/index.ts
    - BE/apps/payments-service/src/application/queries/invoices/index.ts
    - BE/apps/payments-service/src/application/queries/invoices/handlers/index.ts
    - BE/apps/payments-service/src/presentation/microservice/payments.microservice.controller.ts
    - BE/apps/payments-service/src/app.module.ts
key-decisions:
  - "Use existing payments-service Invoice and InvoiceItem entities with order_id."
  - "Use INV-${orderNumber} as the stable deterministic invoice number."
  - "Handle duplicate invoice creation by rereading the existing invoice."
patterns-established:
  - "Order invoice reads are CQRS queries that receive a gateway-authorized order snapshot."
  - "Invoice materialization links payment transactions back to the created invoice."
requirements-completed: [OINV-02, OINV-03]
duration: 15min
completed: 2026-04-30
---

# Phase 30: Order Invoice Payments Contract Summary

**Payments-service order invoice DTO and idempotent materialization RPC using existing invoice persistence**

## Performance

- **Duration:** 15 min active resume work after partial executor handoff
- **Started:** 2026-04-30T08:06:00Z
- **Completed:** 2026-04-30T08:21:16Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Added shared `OrderInvoiceObject` and source order DTOs for the invoice preview/export contract.
- Implemented `GetOrderInvoiceHandler` to return existing order invoices or create a missing invoice once from source order data.
- Registered payments-service RPC command `get_or_materialize_order_invoice`.
- Added focused Jest coverage for existing invoice reads, paid order materialization, duplicate reread idempotency, and payment transaction linking.

## Task Commits

1. **Task 1: Add shared order invoice DTOs** - `50f5aeb7` (feat)
2. **Task 2: Implement payments-service order invoice query and idempotent materialization** - `4d772ae4` (feat)
3. **Task 3: Add focused payments-service tests for materialization and mapping** - `22fc56c1` (test)

## Files Created/Modified

- `BE/libs/common/src/dtos/payments/invoices/order-invoice.dto.ts` - Shared invoice read DTO and source order snapshot DTO.
- `BE/apps/payments-service/src/application/queries/invoices/GetOrderInvoice.query.ts` - CQRS query wrapper.
- `BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.ts` - Existing invoice lookup, materialization, duplicate reread, and DTO mapping.
- `BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts` - Focused materialization behavior tests.
- `BE/apps/payments-service/src/presentation/microservice/payments.microservice.controller.ts` - RPC endpoint for gateway calls.
- `BE/apps/payments-service/src/app.module.ts` and application indexes - Handler registration and exports.

## Decisions Made

- Existing payments invoice persistence remains the source of truth; no order-service invoice table was added.
- Materialized invoice numbers are deterministic: `INV-${sourceOrder.orderNumber}`.
- Duplicate invoice creation attempts are treated as idempotent reads by checking `orderId` and then `invoiceNumber`.

## Deviations from Plan

- Added `BE/libs/common/src/index.ts` export for the new order invoice DTOs so `@app/common` consumers compile.

## Issues Encountered

- The initial executor was interrupted after Task 1 and left Task 2 uncommitted. Work resumed inline from the partial files, preserving the existing DTO commit.
- `TransactionStatus.COMPLETED` does not exist in this codebase; the test fixture uses `TransactionStatus.SUCCEEDED`.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd BE && npx jest apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts --runInBand` - passed
- `cd BE && npx nest build payments-service` - passed
- Structural `rg` checks for DTO, query, RPC, deterministic invoice number, paid status mapping, and payment transaction update - passed

## Next Phase Readiness

Wave 2 can now add the authenticated gateway route and frontend API method against `get_or_materialize_order_invoice`.

---
*Phase: 30-order-linked-invoice-backend-contract-and-materialization*
*Completed: 2026-04-30*
