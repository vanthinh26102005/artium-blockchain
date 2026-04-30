# Phase 31: Orders invoice preview and extraction UI - Context

**Gathered:** 2026-04-30T14:31:56Z
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 31 adds invoice actions, preview, print/save extraction, and robust loading/error states inside the existing authenticated Orders workspace. It must build on the Phase 30 backend contract (`orderApis.getOrderInvoice`) and must not add new invoice persistence, recompute financial truth on the client, or bypass buyer/seller authorization boundaries.

</domain>

<decisions>
## Implementation Decisions

### Invoice Action Placement
- **D-01:** Invoice actions appear in both the `/orders` list and the order detail page.
- **D-02:** `OrderListCard` uses a compact status-aware invoice chip such as `Invoice ready`, `Invoice unavailable`, or `Retry invoice`.
- **D-03:** `OrderDetailPageView` gets a dedicated Invoice panel in the right column, separate from `OrderActionPanel` lifecycle actions.
- **D-04:** The list chip routes to the detail page with the Invoice panel focused rather than opening preview directly from the list.

### Preview Surface
- **D-05:** Invoice preview opens in a modal document preview over the order detail page.
- **D-06:** The preview modal is large and centered on desktop, and full-screen on mobile.
- **D-07:** Order detail lazily prefetches invoice data after the order loads; the modal still handles loading if prefetch has not completed.
- **D-08:** Dismissing the modal returns the user to the exact order detail context as much as practical.

### Document Layout
- **D-09:** Use a print-native invoice document layout with light Orders typography and colors.
- **D-10:** Prioritize invoice identity above the fold: invoice number, status, order number, issue/paid dates, and total.
- **D-11:** Render only backend-provided invoice data and label unavailable or redacted fields clearly.
- **D-12:** Use responsive hybrid line items: structured invoice rows on desktop/print and stacked readable line-item blocks on mobile.

### State Handling
- **D-13:** Represent invoice availability with four states: `Checking`, `Ready`, `Unavailable`, and `Retry`.
- **D-14:** Unavailable invoice actions stay visible but disabled with a reason; the detail Invoice panel explains the reason.
- **D-15:** Retryable backend failures use inline retry controls in the Invoice panel or modal.
- **D-16:** Authorization failures from the invoice endpoint render as a non-disclosing unavailable state.

### Extraction Behavior
- **D-17:** Download invoice uses browser print/save as PDF via a print-optimized document and `window.print()`.
- **D-18:** Print controls appear in both the detail Invoice panel and the preview modal.
- **D-19:** Print mode outputs the invoice document plus a minimal Artium footer while hiding app chrome, modal frame, controls, page background, and order workspace UI.
- **D-20:** Print is disabled until invoice data is ready.

### the agent's Discretion
- Exact component boundaries, hook naming, chip styling, focus target mechanics, and print CSS implementation are left to the planner/implementer, as long as they preserve the decisions above and existing Orders workspace patterns.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope And Requirements
- `.planning/ROADMAP.md` §Phase 31 — Phase goal, requirements OINV-04 through OINV-08, success criteria, dependency on Phase 30, and UI hint.
- `.planning/REQUIREMENTS.md` §v1.3 Requirements — Requirements OINV-04 through OINV-08 define Orders invoice UI and extraction obligations.
- `.planning/PROJECT.md` §Current Milestone / Current State / Key Decisions — Milestone intent and non-negotiables for backend-authorized invoice data and frontend truth source.

### Phase 30 Backend Contract
- `.planning/phases/30-order-linked-invoice-backend-contract-and-materialization/30-VERIFICATION.md` — Verified backend contract, seller redaction behavior, buyerless guard, and evidence for `orderApis.getOrderInvoice`.
- `.planning/phases/30-order-linked-invoice-backend-contract-and-materialization/30-01-SUMMARY.md` — Payments-service invoice DTO/materialization details.
- `.planning/phases/30-order-linked-invoice-backend-contract-and-materialization/30-02-SUMMARY.md` — Gateway route and frontend API method details.
- `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts` — Source of truth for route behavior, seller redaction, and non-disclosing failures.
- `FE/artium-web/src/@shared/apis/orderApis.ts` — `OrderInvoiceResponse` types and `getOrderInvoice` API method.

### Existing Orders UI
- `FE/artium-web/src/@domains/orders/views/OrdersPageView.tsx` — List data loading, filters, pagination, scope handling, and `OrderListCard` integration.
- `FE/artium-web/src/@domains/orders/components/OrderListCard.tsx` — Existing order card layout where status-aware invoice chip should integrate.
- `FE/artium-web/src/@domains/orders/views/OrderDetailPageView.tsx` — Existing detail layout, right column, payment records, totals, and lifecycle context.
- `FE/artium-web/src/@domains/orders/components/OrderActionPanel.tsx` — Lifecycle action panel that invoice controls must remain separate from.
- `FE/artium-web/src/@domains/orders/utils/orderPresentation.ts` — Existing formatting/status/role helpers to reuse or extend.

### Invoice Presentation Reference
- `FE/artium-web/src/@domains/quick-sell/components/create/QuickSellInvoicePreview.tsx` — Prior invoice preview structure to study but not copy directly; Phase 31 should remove checkout/payment-form/mock content and build a print-native order invoice document.
- `FE/artium-web/src/@shared/apis/invoiceApis.ts` — Existing quick-sell invoice API concepts for naming contrast only; Phase 31 must use `orderApis.getOrderInvoice`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `OrderListCard`: add a compact invoice chip without turning the whole card into a dense action surface.
- `OrderDetailPageView`: add Invoice panel in the existing right-column stack beside action/totals cards.
- `OrderActionPanel`: keep lifecycle actions isolated; do not mix invoice preview/download into this component.
- `orderApis.getOrderInvoice`: use as the only Phase 31 invoice data source.
- `formatOrderMoney`, `formatOrderDate`, `formatOrderDateTime`, `trimHash`-style presentation helpers: reuse or extract for invoice identity, dates, totals, and identifiers.
- `CopyValueField`: useful for invoice identifiers/payment identifiers where backend returns values.
- `QuickSellInvoicePreview`: useful as an invoice presentation reference, but it contains checkout-specific and hardcoded/mock content that should not be carried into order invoices.

### Established Patterns
- Orders workspace uses local React state, `useEffect` data loading, explicit `isLoading` / `errorMessage` state, and inline retry/error panels rather than a global query cache.
- `/orders` list preserves `scope`, pagination, filters, and search locally; invoice chip navigation should not disturb those more than normal detail navigation does.
- Existing Orders UI uses rounded white panels on `#F7F8FA`, slate typography, and lucide icons. Invoice document should use this only lightly because the chosen direction is print-native.
- Frontend API modules live in `FE/artium-web/src/@shared/apis/*Apis.ts` and domain code consumes typed methods from there.

### Integration Points
- Add invoice chip/state handling in `OrderListCard`, likely driven by order state and/or a lightweight invoice availability model.
- Add invoice data loading/prefetch, panel state, modal state, and print handling in `OrderDetailPageView` or nearby order invoice components/hooks.
- Add reusable invoice document/modal components under `FE/artium-web/src/@domains/orders/components/` or a nearby invoice-specific subfolder.
- Add print styles scoped so app chrome, modal frame, controls, page background, and workspace UI are hidden during print.

</code_context>

<specifics>
## Specific Ideas

- The list chip should communicate status with compact labels like `Invoice ready`, `Invoice unavailable`, `Retry invoice`, and `Checking`.
- The detail page should have a dedicated Invoice panel in the right column with preview and print actions.
- The preview should feel like an invoice document, not another dashboard card.
- Print/save extraction should rely on browser print/save as PDF, not a client PDF rendering dependency.
- Seller/redacted fields should remain visible as unavailable/redacted labels when the backend omits them.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 31 scope.

</deferred>

---

*Phase: 31-Orders invoice preview and extraction UI*
*Context gathered: 2026-04-30T14:31:56Z*
