---
phase: 31-orders-invoice-preview-and-extraction-ui
verified: 2026-04-30T15:08:23Z
status: passed
score: 6/6 must-haves verified
---

# Phase 31: Orders invoice preview and extraction UI Verification Report

**Phase Goal:** Buyers and sellers can open invoice preview and extraction actions directly from the Orders workspace, with a polished responsive document layout that derives all financial truth from backend invoice/order DTOs.
**Verified:** 2026-04-30T15:08:23Z
**Status:** passed

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `/orders` buyer/seller cards expose invoice actions where invoice preview is available. | VERIFIED | `OrderListCard.tsx:6-17` imports invoice availability/chip, `OrderListCard.tsx:31` computes availability, and `OrderListCard.tsx:65` renders the chip. |
| 2 | List invoice navigation preserves order scope and focuses invoice detail context. | VERIFIED | `OrderListCard.tsx:35-38` links to `/orders/{id}` with `{ scope, invoice: '1' }`; `OrderDetailPageView.tsx:188-201` focuses `invoicePanelRef` when `router.query.invoice === '1'`. |
| 3 | Order detail launches invoice preview without losing existing context. | VERIFIED | `OrderInvoicePanel` is rendered as a sibling after `OrderActionPanel` at `OrderDetailPageView.tsx:500-519`; modal is rendered separately at `OrderDetailPageView.tsx:563-571`. |
| 4 | Invoice preview uses a polished backend DTO-driven document layout. | VERIFIED | `OrderInvoiceDocument.tsx:82-232` renders invoice number/status, order number, dates, buyer/seller, addresses, artwork items, payment identifiers, totals, and Artium footer from `invoice`. |
| 5 | Loading, unavailable, unauthorized, and retry states are represented without breaking workspace navigation. | VERIFIED | `OrderDetailPageView.tsx:91-128` fetches invoice independently, maps non-disclosing authorization/not-found errors to unavailable, maps other failures to retry, and `OrderInvoicePreviewModal`/`OrderInvoicePanel` consume shared availability state. |
| 6 | Print/save extraction is browser-native and scoped to invoice-only output. | VERIFIED | `OrderDetailPageView.tsx:234-240` gates `window.print()` by ready availability; `globals.css:168-226` hides chrome/controls and prints only `.order-invoice-print-root`. |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `FE/artium-web/src/@domains/orders/utils/orderInvoicePresentation.ts` | Invoice availability and safe formatting helpers | EXISTS + SUBSTANTIVE | Four-state availability model, unavailable/retry copy, safe missing/redacted formatting, and print gating helper. |
| `FE/artium-web/src/@domains/orders/components/OrderInvoiceStatusChip.tsx` | Compact invoice state chip | EXISTS + SUBSTANTIVE | Renders state-aware labels/icons for checking, ready, unavailable, and retry. |
| `FE/artium-web/src/@domains/orders/components/OrderInvoiceDocument.tsx` | Backend DTO-driven invoice document | EXISTS + SUBSTANTIVE | Uses `OrderInvoiceResponse`; no `order.*` totals are referenced. |
| `FE/artium-web/src/@domains/orders/components/OrderInvoicePanel.tsx` | Detail page Invoice panel | EXISTS + SUBSTANTIVE | Contains preview, print, retry, disabled-state behavior, and focusable panel root. |
| `FE/artium-web/src/@domains/orders/components/OrderInvoicePreviewModal.tsx` | Responsive preview modal | EXISTS + SUBSTANTIVE | Renders document, loading fallback, unavailable/retry fallback, toolbar, and print control. |
| `FE/artium-web/src/@domains/orders/components/OrderListCard.tsx` | Orders list invoice navigation | EXISTS + SUBSTANTIVE | Adds chip and `invoice=1` deep link without nested buttons. |
| `FE/artium-web/src/@domains/orders/views/OrderDetailPageView.tsx` | Invoice fetch and orchestration | EXISTS + SUBSTANTIVE | Calls `orderApis.getOrderInvoice(order.id)`, prefetches after order load, handles retry, focus, modal, and print. |
| `FE/artium-web/src/styles/globals.css` | Scoped invoice print CSS | EXISTS + SUBSTANTIVE | Adds `@media print`, hides workspace chrome/controls, and isolates `.order-invoice-print-root`. |

**Artifacts:** 8/8 verified

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| Order list card | Order detail invoice panel | `Link` query `{ scope, invoice: '1' }` | WIRED | `OrderListCard.tsx:35-38`; `OrderDetailPageView.tsx:188-201`. |
| Order detail page | Backend invoice endpoint | `orderApis.getOrderInvoice(order.id)` | WIRED | `OrderDetailPageView.tsx:91-128`. |
| Detail invoice state | Panel and modal | Shared `invoiceAvailability`, `invoice`, retry and print handlers | WIRED | `OrderDetailPageView.tsx:207-240`, `OrderDetailPageView.tsx:512-571`. |
| Print button | Browser print | `handlePrintInvoice` and `window.print()` | WIRED | `OrderDetailPageView.tsx:234-240`. |
| Print CSS | Invoice document | `.order-invoice-print-root` class | WIRED | `OrderInvoiceDocument.tsx:75-80`; `globals.css:203-226`. |

**Wiring:** 5/5 connections verified

## Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| OINV-04 | SATISFIED | - |
| OINV-05 | SATISFIED | - |
| OINV-06 | SATISFIED | - |
| OINV-07 | SATISFIED | - |
| OINV-08 | SATISFIED | - |

**Coverage:** 5/5 requirements satisfied

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| - | - | - | - | No Phase 31 blockers found. Full-project lint still has unrelated baseline failures outside touched files. |

**Anti-patterns:** 0 blockers found

## Human Verification Required

None for phase completion. Browser-level responsive and print visual QA is intentionally covered by Phase 32 validation.

## Gaps Summary

**No gaps found.** Phase goal achieved. Ready to proceed.

## Verification Metadata

**Verification approach:** Goal-backward verification against Phase 31 roadmap goal and plan must-haves.
**Must-haves source:** `31-01-PLAN.md`, `31-02-PLAN.md`, roadmap success criteria, and summaries.
**Automated checks:** TypeScript passed; structural guards passed; targeted ESLint passed; schema drift check passed.
**Known baseline issue:** `npm run lint` fails on unrelated pre-existing files outside Phase 31 touched files.
**Human checks required:** 0 for phase completion; deferred visual validation belongs to Phase 32.
**Total verification time:** Inline verifier pass during `$gsd-execute-phase 31`.

---
*Verified: 2026-04-30T15:08:23Z*
*Verifier: Codex inline verifier*
