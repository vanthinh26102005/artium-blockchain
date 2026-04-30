---
phase: 31-orders-invoice-preview-and-extraction-ui
plan: 01
subsystem: frontend
tags: [orders, invoices, ui, print, modal, typescript]
requires:
  - phase: 30
    provides: Typed `orderApis.getOrderInvoice` and backend `OrderInvoiceResponse`
provides:
  - Invoice availability and safe formatting helpers
  - Compact invoice status chip
  - Backend DTO driven invoice document
  - Detail Invoice panel and responsive preview modal
affects: [phase-31, orders, invoice-preview, print-extraction]
tech-stack:
  added: []
  patterns: [Tailwind Orders panels, Radix Dialog, lucide icons, typed DTO presentation]
key-files:
  created:
    - FE/artium-web/src/@domains/orders/utils/orderInvoicePresentation.ts
    - FE/artium-web/src/@domains/orders/components/OrderInvoiceStatusChip.tsx
    - FE/artium-web/src/@domains/orders/components/OrderInvoiceDocument.tsx
    - FE/artium-web/src/@domains/orders/components/OrderInvoicePanel.tsx
    - FE/artium-web/src/@domains/orders/components/OrderInvoicePreviewModal.tsx
  modified: []
requirements-completed: [OINV-05, OINV-06, OINV-07, OINV-08]
completed: 2026-04-30
---

# Phase 31 Plan 01 Summary

Built the reusable order invoice UI primitives needed before Orders workspace integration.

## Task Commits

1. `0daffe86` — `feat(31-01): add order invoice presentation helpers`
2. `e63e2be8` — `feat(31-01): add order invoice document primitives`
3. `4f7c2d14` — `feat(31-01): add invoice panel and preview modal`

## Accomplishments

- Added the four-state invoice availability model: `checking`, `ready`, `unavailable`, and `retry`.
- Added safe invoice field, party, address, money, and date presentation helpers.
- Added a compact status-aware invoice chip using existing badge/lucide patterns.
- Added a print-native invoice document that renders invoice identity, order identity, dates, parties, addresses, payment fields, line items, totals, and Artium footer from `OrderInvoiceResponse`.
- Added a dedicated detail Invoice panel and large responsive preview modal with preview, print, unavailable, loading, and retry states.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `cd FE/artium-web && npx tsc --noemit` - passed
- `rg -n "OrderInvoiceAvailabilityState|Checking invoice|Invoice ready|Invoice unavailable|Retry invoice|Invoice unavailable for this workspace|Redacted by access rules|Not provided|getOrderListInvoiceAvailability|formatInvoiceAddressLines|canPrintOrderInvoice|formatInvoiceMoney" FE/artium-web/src/@domains/orders/utils/orderInvoicePresentation.ts` - passed
- `rg -n "OrderInvoiceStatusChip|ReceiptText|Loader2|AlertCircle|RefreshCcw|availability.label|order-invoice-print-root|invoice.invoiceNumber|invoice.orderNumber|invoice.totalAmount|shippingAmount|Generated from backend invoice data|Not provided" FE/artium-web/src/@domains/orders/components/OrderInvoiceStatusChip.tsx FE/artium-web/src/@domains/orders/components/OrderInvoiceDocument.tsx` - passed
- `rg -n "OrderInvoicePanel|OrderInvoicePreviewModal|Preview invoice|Print invoice|Retry invoice|Invoice|canPrintOrderInvoice|DialogContent|DialogTitle|OrderInvoiceDocument|Checking invoice|Invoice unavailable|max-w-\\[96rem\\]|h-\\[100dvh\\]|size=.9xl" FE/artium-web/src/@domains/orders/components/OrderInvoicePanel.tsx FE/artium-web/src/@domains/orders/components/OrderInvoicePreviewModal.tsx` - passed

## Self-Check: PASSED

All Wave 1 files exist, all acceptance criteria passed, and TypeScript compilation passed.
