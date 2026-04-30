# Phase 31: Orders invoice preview and extraction UI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-30T14:31:56Z
**Phase:** 31-orders-invoice-preview-and-extraction-ui
**Areas discussed:** Invoice Action Placement, Preview Surface, Document Layout, State Handling, Extraction Behavior

---

## Invoice Action Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Order detail primary action | Put invoice preview/download in `OrderActionPanel`; keeps list cards clean and makes invoice deliberate. | |
| List + detail | Compact invoice action on list cards plus fuller detail controls. | ✓ |
| Header summary on detail | Put invoice actions near order number/status. | |

**User's choice:** List + detail
**Notes:** Follow-up decisions locked status-aware list chip, dedicated detail Invoice panel, and list chip routing to detail with the Invoice panel focused.

---

## Preview Surface

| Option | Description | Selected |
|--------|-------------|----------|
| Modal document preview | Opens over order detail and preserves context. | ✓ |
| Right-side drawer | Good for scanning but cramped for document layout. | |
| Dedicated invoice route | Best space for print/export but more navigation. | |

**User's choice:** Modal document preview
**Notes:** Follow-up decisions locked a large centered desktop modal, full-screen mobile modal, lazy invoice prefetch after order load, and preserving detail context on dismiss.

---

## Document Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Print-native invoice | Clean document page, restrained borders, strong totals table, clear header/footer. | ✓ |
| Orders workspace style | Consistent in-app, but less invoice-like when printed. | |
| Quick-sell inspired | Adapt `QuickSellInvoicePreview` while removing checkout/mock content. | |

**User's choice:** Print-native invoice
**Notes:** Follow-up decisions locked invoice identity above the fold, explicit unavailable/redacted labels, and responsive hybrid line items.

---

## State Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Three states | `Invoice ready`, `Unavailable`, `Retry`. | |
| Four states | `Checking`, `Ready`, `Unavailable`, `Retry`. | ✓ |
| Status + tooltip | Short chip label with hover/focus explanation. | |

**User's choice:** Four states
**Notes:** Follow-up decisions locked disabled unavailable actions with reason, inline retry in panel/modal, and non-disclosing unavailable state for authorization failures.

---

## Extraction Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Browser print/save as PDF | Use print-optimized document and `window.print()`. | ✓ |
| Client-generated PDF file | Direct PDF download, higher dependency/rendering risk. | |
| Print route | Dedicated print route, more routing work. | |

**User's choice:** Browser print/save as PDF
**Notes:** Follow-up decisions locked print controls in both panel and modal, invoice document plus minimal Artium footer in print mode, and disabled print until invoice data is ready.

---

## the agent's Discretion

- Exact component boundaries, hook naming, chip styling, focus target mechanics, and print CSS implementation.

## Deferred Ideas

None.
