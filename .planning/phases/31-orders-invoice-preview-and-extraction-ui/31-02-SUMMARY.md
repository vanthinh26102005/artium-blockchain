---
phase: 31-orders-invoice-preview-and-extraction-ui
plan: 02
subsystem: frontend
tags: [orders, invoices, ui, print, routing, typescript]
requires:
  - phase: 31
    plan: 01
    provides: Invoice presentation primitives, panel, modal, and document
provides:
  - Orders list invoice status chip navigation
  - Order detail invoice fetch, panel, preview modal, retry, and focus flow
  - Browser print extraction scoped to invoice-only output
affects: [phase-31, orders, invoice-preview, print-extraction]
tech-stack:
  added: []
  patterns: [Next router query deep link, typed order invoice DTO fetch, scoped print CSS]
key-files:
  created: []
  modified:
    - FE/artium-web/src/@domains/orders/components/OrderListCard.tsx
    - FE/artium-web/src/@domains/orders/views/OrderDetailPageView.tsx
    - FE/artium-web/src/styles/globals.css
requirements-completed: [OINV-04, OINV-05, OINV-06, OINV-07, OINV-08]
completed: 2026-04-30
---

# Phase 31 Plan 02 Summary

Integrated the Phase 31 invoice primitives into the authenticated Orders workspace.

## Task Commits

1. `e72d841f` - `feat(31-02): deep link order cards to invoice`
2. `0e08cfef` - `feat(31-02): connect invoice panel to order details`
3. `c51c761c` - `feat(31-02): isolate invoice printing`
4. `157700cd` - `fix(31-02): keep invoice fetch tied to order dto`

## Accomplishments

- Added a compact `OrderInvoiceStatusChip` to order list cards without adding nested interactive controls.
- Updated order card navigation to preserve `scope` and add `invoice=1` for detail-page invoice focus.
- Added order detail invoice state, lazy prefetch through `orderApis.getOrderInvoice(order.id)`, non-disclosing unavailable mapping, retry mapping, and shared retry handling.
- Rendered a dedicated right-column Invoice panel separately from `OrderActionPanel`.
- Added the invoice preview modal to order detail while preserving the surrounding order context.
- Added print controls in the panel and modal, gated by ready invoice availability.
- Added scoped print CSS for invoice-only browser print/save-as-PDF output, hiding app chrome and controls.

## Deviations from Plan

- `npm run lint` still fails on pre-existing repository-wide issues outside Phase 31 files. The Phase 31 touched files pass targeted ESLint.

## Verification

- `cd FE/artium-web && npx tsc --noemit` - passed
- `cd FE/artium-web && npm run lint` - failed on pre-existing unrelated files
- `cd FE/artium-web && npx eslint src/@domains/orders/components/OrderListCard.tsx src/@domains/orders/views/OrderDetailPageView.tsx src/styles/globals.css src/@domains/orders/components/OrderInvoicePanel.tsx src/@domains/orders/components/OrderInvoicePreviewModal.tsx src/@domains/orders/components/OrderInvoiceDocument.tsx src/@domains/orders/components/OrderInvoiceStatusChip.tsx src/@domains/orders/utils/orderInvoicePresentation.ts` - passed with one CSS ignore warning
- `rg -n "OrderInvoiceStatusChip|invoice: '1'|OrderInvoicePanel|OrderInvoicePreviewModal|getOrderInvoice\\(order.id\\)|window.print\\(\\)|@media print|order-invoice-print-root" FE/artium-web/src` - passed
- `rg -n "order\\.subtotal|order\\.taxAmount|order\\.discountAmount|order\\.shippingCost|order\\.totalAmount" FE/artium-web/src/@domains/orders/components/OrderInvoiceDocument.tsx` - returned no matches, as expected
- `rg -n "<button" FE/artium-web/src/@domains/orders/components/OrderListCard.tsx` - returned no matches, as expected
- `rg -n "pdf|jspdf|html2canvas" FE/artium-web/package.json` - returned no matches, as expected

## Self-Check: PASSED

All Wave 2 acceptance criteria passed except full-project lint, which is blocked by unrelated baseline issues and documented above.
