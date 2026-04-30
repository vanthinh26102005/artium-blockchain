---
phase: 30
slug: order-linked-invoice-backend-contract-and-materialization
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-30
---

# Phase 30 - Validation Strategy

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Jest |
| Config file | `BE/package.json` |
| Quick run command | `cd BE && npx jest apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts --runInBand` |
| Full suite command | `cd BE && npx jest apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts --runInBand && npx nest build payments-service && yarn build:orders && yarn build:gateway` |
| Estimated runtime | ~90 seconds |

## Sampling Rate

- After every task commit: run the relevant targeted Jest command for the touched service.
- After every plan wave: run the full suite command above.
- Before `$gsd-verify-work`: full suite must be green or any unrelated failures must be documented in the phase summary.
- Max feedback latency: 90 seconds.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 30-01-01 | 01 | 1 | OINV-02 | T-30-02 | DTO has only invoice preview/export fields | structural | `rg -n "OrderInvoiceObject|OrderInvoiceItemObject|OrderInvoicePaymentObject" BE/libs/common/src/dtos/payments/invoices` | yes | pending |
| 30-01-02 | 01 | 1 | OINV-03 | T-30-03 | Missing invoice is created once per order using deterministic invoice number | unit | `cd BE && npx jest apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts --runInBand` | no | pending |
| 30-02-01 | 02 | 2 | OINV-01 | T-30-01 | Gateway authorizes with existing order policy before payment RPC | unit | `cd BE && npx jest apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts --runInBand` | no | pending |
| 30-02-02 | 02 | 2 | OINV-02 | T-30-02 | API and frontend type expose backend invoice read shape | build | `cd BE && yarn build:gateway` | yes | pending |

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

## Manual-Only Verifications

All Phase 30 behaviors have automated or structural verification. Preview/export manual checks belong to Phase 31.

## Validation Sign-Off

- [x] All tasks have automated verify or structural commands.
- [x] Sampling continuity has no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target is less than 90 seconds.
- [x] `nyquist_compliant: true` set in frontmatter.

Approval: approved 2026-04-30
