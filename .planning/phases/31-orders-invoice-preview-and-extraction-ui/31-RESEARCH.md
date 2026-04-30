---
phase: 31
slug: orders-invoice-preview-and-extraction-ui
status: complete
created: 2026-04-30
---

# Phase 31 - Research

## Research Question

What needs to be known to plan the Orders invoice preview and extraction UI well?

## Source Inputs

- `.planning/phases/31-orders-invoice-preview-and-extraction-ui/31-CONTEXT.md` locks placement, modal, document layout, state, and extraction behavior.
- `.planning/phases/31-orders-invoice-preview-and-extraction-ui/31-UI-SPEC.md` locks design tokens, copy, responsive behavior, print behavior, and data-truth rules.
- `.planning/phases/30-order-linked-invoice-backend-contract-and-materialization/30-VERIFICATION.md` verifies the backend invoice endpoint and seller redaction behavior.
- `FE/artium-web/src/@shared/apis/orderApis.ts` exposes `OrderInvoiceResponse` and `orderApis.getOrderInvoice`.

## Standard Stack

| Area | Finding |
|------|---------|
| Framework | Next.js Pages Router with React 19 and TypeScript. |
| Styling | Tailwind CSS utilities are the local norm; do not add SCSS files. |
| Component library | shadcn-style shared UI exists through `@shared/components/ui`; use `Button`, `Dialog`, `Badge`, existing display primitives, and local Orders components. |
| Icons | Orders domain already uses `lucide-react`; continue using lucide icons for invoice controls. |
| Data fetching | Existing Orders views currently use local `useEffect` state and direct `orderApis` calls. Follow this local pattern for Phase 31 to avoid a cross-domain fetch refactor. |
| Verification | FE has `lint` and TypeScript dependencies but no frontend test runner script. Phase 31 should use `npx tsc --noemit`, targeted `npm run lint -- --file ...` where supported by Next/ESLint config, and structural `rg` checks. |

## Existing Orders Architecture

- `OrdersPageView` loads paginated orders, hydrates order items, preserves `scope`, `statusFilter`, `searchTerm`, `page`, and `pageSize`, and renders `OrderListCard`.
- `OrderListCard` is a single `Link` card with artwork, order number, status badge, total, next-step label, and role-aware descriptions.
- `OrderDetailPageView` owns order fetch state, role derivation, timeline, shipping/payment records, `OrderActionPanel`, and order totals in a right-column stack.
- `OrderActionPanel` owns lifecycle actions only. Phase 31 invoice controls must remain separate.
- `orderPresentation.ts` already owns money/date/status/role helpers and should be extended for invoice helpers instead of duplicating formatting logic.

## Backend Contract Findings

- `GET /orders/:id/invoice` is authenticated and calls existing order authorization before materialization.
- Unauthorized and buyerless cases return non-disclosing private-order behavior.
- Seller invoice responses redact buyer-sensitive fields and filter line items to seller-visible items.
- The frontend must treat missing/redacted fields as data state, not as errors or placeholders to invent.
- `OrderInvoiceResponse` contains invoice identity, order identity, status, issue/due/paid dates, currency, totals, buyer/seller, shipping/billing addresses, payment identifiers, items, and timestamps.

## UI Implementation Strategy

### Core Components

Create order-domain invoice components rather than expanding `OrderDetailPageView` into a large mixed component:

- `OrderInvoicePanel.tsx` for the right-column panel, state labels, retry, preview, and print controls.
- `OrderInvoicePreviewModal.tsx` for the Radix Dialog wrapper, modal actions, loading/unavailable/retry states, and scroll containment.
- `OrderInvoiceDocument.tsx` for the print-native invoice document body.
- `OrderInvoiceStatusChip.tsx` for the compact list-card chip.

### Helpers

Extend or add helpers under `FE/artium-web/src/@domains/orders/utils/`:

- `orderInvoicePresentation.ts` for availability states, labels, address normalization, safe field labels, invoice date/money wrappers, and print readiness.
- Reuse `formatOrderMoney`, `formatOrderDate`, `formatOrderDateTime`, and local `trimHash`-style behavior rather than recomputing financial values.

### State

Use a small local invoice state object in `OrderDetailPageView`:

- `status`: `checking | ready | unavailable | retry`
- `invoice`: `OrderInvoiceResponse | null`
- `errorMessage`: `string | null`
- `isModalOpen`: boolean

The detail page should prefetch after the order is loaded. The modal should still call the same loader if opened before prefetch completes. Retry should call only `orderApis.getOrderInvoice(order.id)` and should not reload the whole order.

### Routing

The list chip should navigate to detail with the current `scope` and a focus/open hint such as `invoice=1`. The detail page can focus the panel or open the modal according to the final implementation, but the minimum contract is that the Invoice panel receives focus and stays visible without losing order detail context.

## Print Strategy

- Use browser print/save-as-PDF through `window.print()`.
- Add print-scoped CSS in the component or existing global stylesheet only if necessary. If global CSS is touched, scope selectors to order invoice classes such as `.order-invoice-print-root`, `.order-invoice-print-only`, and `.order-invoice-screen-only`.
- During print, hide app chrome, modal frame, controls, workspace background, filters, pagination, and navigation.
- Print only the invoice document plus a minimal Artium footer.
- Do not introduce `jspdf`, `html2canvas`, or another PDF dependency.

## Security And Privacy Considerations

- Treat unauthorized, not-found, buyerless, and redacted backend cases as non-disclosing unavailable UI states.
- Do not expose raw backend error messages if they reveal authorization details.
- Do not infer buyer/seller names, addresses, payment identifiers, totals, or line items from the order page when the invoice endpoint omits them.
- Keep invoice controls behind the authenticated Orders workspace; do not add a public invoice route in Phase 31.

## Validation Architecture

| Behavior | Validation Method |
|----------|-------------------|
| Invoice components compile with backend DTO types | `cd FE/artium-web && npx tsc --noemit` |
| Order list chip routes to detail with invoice focus/query | Structural `rg` for `invoice=1`, `OrderInvoiceStatusChip`, and `scope` query preservation in `OrderListCard.tsx` |
| Detail page uses backend invoice endpoint only | Structural `rg` for `orderApis.getOrderInvoice` in order detail/invoice hook code and absence of client subtotal/tax/total recomputation in invoice components |
| Modal handles checking/ready/unavailable/retry states | Structural `rg` for the four state strings and retry handler in `OrderInvoicePanel.tsx` / `OrderInvoicePreviewModal.tsx` |
| Print behavior uses browser print | Structural `rg` for `window.print()`, `order-invoice-print-root`, and print-scoped classes/CSS |
| Responsive document layout exists | Structural `rg` for desktop row and mobile stacked classes in `OrderInvoiceDocument.tsx`; manual browser check remains recommended because no FE visual test runner exists |

## Risks

- The entire `OrderListCard` is currently a `Link`; nested buttons inside it would be invalid. The invoice chip should either be a styled part of the card navigation or the card structure must be refactored carefully to avoid nested interactive elements.
- `OrderDetailPageView` is already large. New invoice rendering should be pushed into components to keep the view responsible for orchestration only.
- Print CSS can accidentally print the full modal/app. Use explicit screen/print classes and verify with browser print preview when possible.
- Seller redaction must be tested manually or through mocked API responses because Phase 31 has no frontend test runner.

## RESEARCH COMPLETE
