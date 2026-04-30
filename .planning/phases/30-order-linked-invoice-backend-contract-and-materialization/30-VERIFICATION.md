---
phase: 30-order-linked-invoice-backend-contract-and-materialization
verified: 2026-04-30T08:36:09Z
status: passed
score: 8/8 must-haves verified
overrides_applied: 0
---

# Phase 30: Order-linked invoice backend contract and materialization Verification Report

**Phase Goal:** Orders can expose a trustworthy invoice read model by reusing payments-service invoice persistence, enforcing the same buyer/seller access rules as `/orders`, and materializing a missing invoice from canonical order/payment data when needed.
**Verified:** 2026-04-30T08:36:09Z
**Status:** passed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Authenticated `GET /orders/:id/invoice` exists for bought/sold orders and unauthorized users get non-disclosing private-order behavior. | VERIFIED | `orders.controller.ts:221-242` defines guarded route; `getAuthorizedOrder` checks buyer/seller access and throws `NotFoundException('Order not found')` at `orders.controller.ts:72-86`; specs cover buyer, seller, unauthorized, and buyerless cases at `orders.controller.spec.ts:94-202`. |
| 2 | Gateway calls payments-service only after existing order authorization succeeds. | VERIFIED | `getOrderInvoice` calls `getAuthorizedOrder(id, req.user?.id)` before `sendRpc(... get_or_materialize_order_invoice ...)` at `orders.controller.ts:228-235`; tests assert call ordering and no payments RPC on unauthorized/buyerless orders at `orders.controller.spec.ts:103-114`, `173-202`. |
| 3 | Invoice lookup/materialization reuses payments-service `Invoice` and `InvoiceItem` persistence with `order_id`; no orders-service invoice table is introduced. | VERIFIED | `Invoice.orderId` exists on payments entity at `invoices.entity.ts:45-46`; `InvoiceItem` belongs to invoices at `invoice_items.entity.ts:19-23`, `90-92`; `InvoiceRepository.findByOrderId` uses the existing invoice table at `invoice.repository.ts:161-168`; `rg` found no order invoice entity/table in `BE/apps/orders-service/src`. |
| 4 | Missing invoices materialize through `get_or_materialize_order_invoice` with stable `INV-${order.orderNumber}` invoice numbers from backend order/payment data. | VERIFIED | Payments RPC is wired at `payments.microservice.controller.ts:186-191`; handler creates `invoiceNumber = INV-${sourceOrder.orderNumber}` and persists order totals/status/payment fields at `GetOrderInvoice.query.handler.ts:94-130`; gateway builds source data from authorized order object, not request body, at `orders.controller.ts:89-130`. |
| 5 | Repeated materialization returns stable invoice identity and avoids duplicate invoices. | VERIFIED | Handler first reads `findByOrderId(sourceOrder.id)` at `GetOrderInvoice.query.handler.ts:45-58`; duplicate invoice-number errors trigger reread by `orderId` then `invoiceNumber` at `GetOrderInvoice.query.handler.ts:175-195`; spec verifies repeated materialization at `GetOrderInvoice.query.handler.spec.ts:182-198`. |
| 6 | DTO exposes the backend invoice read model needed for preview/export without leaking unrelated buyer/seller private data across workspace scopes. | VERIFIED | `OrderInvoiceObject` includes invoice identity, order, dates, totals, currency, buyer/seller, addresses, payment, items, and timestamps at `order-invoice.dto.ts:105-177`; seller responses redact shipping/billing and raw payment identifiers and filter items at `orders.controller.ts:140-157`; seller redaction spec covers multi-seller filtering at `orders.controller.spec.ts:117-171`. |
| 7 | Payment transaction rows are linked to materialized invoices when `paymentTransactionId` is present. | VERIFIED | Materialization persists `paymentTransactionId` and calls `transactionRepo.update(..., { invoiceId: invoice.id })` at `GetOrderInvoice.query.handler.ts:123-158`; spec verifies linking at `GetOrderInvoice.query.handler.spec.ts:200-212`. |
| 8 | Frontend shared API exposes a typed `getOrderInvoice` method only; no Phase 30 invoice UI is implemented. | VERIFIED | `orderApis.ts:97-160` defines response types matching backend shape and `orderApis.ts:187-188` calls `/orders/${encodePathSegment(id)}/invoice`; `rg getOrderInvoice` finds usage only in `orderApis.ts`, consistent with Phase 31 owning UI. |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `BE/libs/common/src/dtos/payments/invoices/order-invoice.dto.ts` | Shared order invoice read/source DTOs | VERIFIED | `gsd-sdk verify.artifacts` passed; exports complete DTO classes and required payment/shipping/on-chain fields. |
| `BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.ts` | Lookup, materialization, idempotency, DTO mapping | VERIFIED | `gsd-sdk verify.artifacts` passed; substantive CQRS handler wired to repositories and transaction service. |
| `BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts` | Existing, missing, repeated, payment-link tests | VERIFIED | `gsd-sdk verify.artifacts` passed; orchestrator run passed with combined Jest suite. |
| `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts` | Authenticated route and source mapping | VERIFIED | `gsd-sdk verify.artifacts` passed; route, authorization, seller redaction, and buyerless guard are present. |
| `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts` | Gateway auth/RPC ordering/redaction evidence | VERIFIED | `gsd-sdk verify.artifacts` passed; includes review-fix tests for seller redaction and buyerless orders. |
| `FE/artium-web/src/@shared/apis/orderApis.ts` | Frontend API contract for Phase 31 | VERIFIED | `gsd-sdk verify.artifacts` passed; typed response and path-safe API method present. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| Gateway route | Existing private order authorization | `this.getAuthorizedOrder(id, req.user?.id)` | WIRED | `orders.controller.ts:228-235`; tests assert order RPC precedes payments RPC. |
| Gateway route | Payments-service materialization RPC | `sendRpc(this.paymentsClient, { cmd: 'get_or_materialize_order_invoice' }, ...)` | WIRED | `orders.controller.ts:232-235`; payments client registered in gateway app module. |
| Payments microservice | CQRS handler | `queryBus.execute(new GetOrderInvoiceQuery(data.order))` | WIRED | `payments.microservice.controller.ts:186-191`; handler included in `QueryHandlers` at `app.module.ts:121-127`. |
| Handler | Invoice persistence | `invoiceRepo.findByOrderId`, `invoiceRepo.create`, `invoiceItemRepo.createMany` | WIRED | Uses existing `Invoice`/`InvoiceItem` repositories in a transaction at `GetOrderInvoice.query.handler.ts:45-172`. |
| Handler | Payment transaction persistence | `transactionRepo.findByOrderId`, `transactionRepo.update` | WIRED | Reads transactions for DTO mapping and back-links materialized invoice at `GetOrderInvoice.query.handler.ts:48-63`, `153-158`. |
| Frontend API | Gateway endpoint | `apiFetch('/orders/${encodePathSegment(id)}/invoice')` | WIRED | `orderApis.ts:187-188`; no UI consumer in Phase 30 by design. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `orders.controller.ts` | `order` / source DTO | `sendRpc(... get_order_by_id ...)` then `buildOrderInvoiceSource(order)` | Yes | FLOWING - source data comes from orders-service authorized order object, not request body. |
| `payments.microservice.controller.ts` | `data.order` | Gateway RPC payload | Yes | FLOWING - creates `GetOrderInvoiceQuery(data.order)`. |
| `GetOrderInvoice.query.handler.ts` | `existingInvoice` / `invoice` / `paymentTransactions` | `InvoiceRepository`, `InvoiceItemRepository`, `PaymentTransactionRepository` | Yes | FLOWING - repository reads include invoice items, materialization persists invoice/items and maps persisted data to DTO. |
| `orderApis.ts` | `OrderInvoiceResponse` | Gateway endpoint response | Yes | FLOWING - typed fetch path points to the authenticated gateway route; UI consumption is deferred to Phase 31. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Payments handler and gateway controller behavior | `cd BE && npx jest apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts --runInBand` | Orchestrator evidence: passed, 2 suites / 9 tests | PASS |
| Payments-service build | `cd BE && npx nest build payments-service` | Orchestrator evidence: passed | PASS |
| API-gateway build | `cd BE && npx nest build api-gateway` | Orchestrator evidence: passed | PASS |
| Frontend API typing | `cd FE/artium-web && npx tsc --noemit` | Orchestrator evidence: passed | PASS |
| Schema drift | schema drift check | Orchestrator evidence: `drift_detected=false` | PASS |
| Codebase drift | codebase drift check | Orchestrator evidence: non-blocking pre-existing/unrelated structural drift warning | PASS_WITH_NOTE |
| Documented commits | `gsd-sdk query verify.commits 50f5aeb7 4d772ae4 22fc56c1 5181b8d1 738592dc ec0b8795 ea1e9c46` | `all_valid: true` | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| OINV-01 | 30-02 | Buyers and sellers can request invoice data only when existing `/orders` access policy authorizes them. | SATISFIED | `getAuthorizedOrder` enforces buyer/seller access before payments RPC; unauthorized and buyerless tests prevent materialization. |
| OINV-02 | 30-01, 30-02 | Backend returns order-linked invoice read model with invoice/order/items/totals/payment/buyer/seller/shipping/billing context without cross-user leakage. | SATISFIED | DTO exposes required fields; payments handler maps persisted invoice/order/payment data; seller response redacts buyer-sensitive fields and filters seller line items. |
| OINV-03 | 30-01, 30-02 | Backend idempotently materializes invoice from canonical order/item/payment records using payments-service invoice persistence and `order_id`. | SATISFIED | Handler uses payments invoice repository, `orderId`, deterministic invoice number, duplicate reread, invoice-item creation, and payment transaction back-link. |

No orphaned Phase 30 requirements found in `.planning/REQUIREMENTS.md`; OINV-01, OINV-02, and OINV-03 are all claimed by phase plans.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None in phase-scoped files | - | - | - | Targeted scan found no TODO/FIXME/placeholders, empty handlers, hardcoded empty rendered data, or console-only implementations in the Phase 30 files. `return null` occurrences in the handler are legitimate helper returns, not stubs. |

### Human Verification Required

None. Phase 30 is a backend/API contract phase and the observable behavior is covered by code trace, unit tests, builds, and typecheck evidence. UI preview/extraction behavior is explicitly assigned to later phases.

### Gaps Summary

No blocking gaps found. The review-fix outcomes are present in code: seller invoice responses are redacted before returning to seller callers, and buyerless seller-visible orders throw before payments-service materialization. Phase 31 owns invoice actions, preview UI, and extraction; Phase 32 owns milestone-wide validation.

---

_Verified: 2026-04-30T08:36:09Z_
_Verifier: the agent (gsd-verifier)_
