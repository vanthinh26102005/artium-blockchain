---
phase: 30-order-linked-invoice-backend-contract-and-materialization
source_review: 30-REVIEW.md
status: fixed
fixed: 2026-04-30T08:35:00Z
findings_fixed:
  critical: 2
  warning: 0
  info: 0
---

# Phase 30 Code Review Fix Summary

## Fixed Findings

- **CR-01:** Seller invoice responses now redact shipping address, billing address, raw payment identifiers, transaction hashes, and non-seller line items.
- **CR-02:** Buyerless orders now fail before payments-service materialization instead of mapping `collectorId` to an invalid empty UUID.

## Verification

- `cd BE && npx jest apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts --runInBand` - passed
- `cd BE && npx nest build api-gateway` - passed
- `cd FE/artium-web && npx tsc --noemit` - passed

## Fix Commit

- `ea1e9c46` - `fix(30): redact seller order invoice responses`
