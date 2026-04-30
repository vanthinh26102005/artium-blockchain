---
phase: 31
slug: orders-invoice-preview-and-extraction-ui
status: complete
created: 2026-04-30
---

# Phase 31 - Pattern Map

## Files To Create Or Modify

| Target | Role | Closest Existing Analog | Pattern To Reuse |
|--------|------|-------------------------|------------------|
| `FE/artium-web/src/@domains/orders/utils/orderInvoicePresentation.ts` | Invoice state/formatting helpers | `FE/artium-web/src/@domains/orders/utils/orderPresentation.ts` | Keep presentation helpers pure, typed, and exported from the domain utility file. Reuse existing money/date helpers. |
| `FE/artium-web/src/@domains/orders/components/OrderInvoiceStatusChip.tsx` | Compact list-card invoice state chip | `FE/artium-web/src/@domains/orders/components/OrderStatusBadge.tsx` | Use shared `Badge`, `cn`, explicit tone mapping, compact uppercase-ish status language. |
| `FE/artium-web/src/@domains/orders/components/OrderInvoicePanel.tsx` | Detail right-column invoice controls/state | `FE/artium-web/src/@domains/orders/components/OrderActionPanel.tsx` | Keep panel self-contained, use local state props, `Button`, inline error/retry panels, and no lifecycle-action mixing. |
| `FE/artium-web/src/@domains/orders/components/OrderInvoiceDocument.tsx` | Print-native invoice document | `FE/artium-web/src/@domains/quick-sell/components/create/QuickSellInvoicePreview.tsx` plus `OrderDetailPageView` totals/records | Use invoice sections, party blocks, totals, line items, but remove checkout/payment-form/mock content and render only `OrderInvoiceResponse`. |
| `FE/artium-web/src/@domains/orders/components/OrderInvoicePreviewModal.tsx` | Modal preview and modal actions | `FE/artium-web/src/@shared/components/ui/dialog.tsx` consumers | Use existing `Dialog`, `DialogContent`, title/description, close button, scroll containment, large desktop/full mobile classes. |
| `FE/artium-web/src/@domains/orders/components/index.ts` if present or imports in views | Component exports/imports | Existing Orders components imported directly | Use direct local imports if no barrel exists; do not add a new export barrel unless local pattern already exists. |
| `FE/artium-web/src/@domains/orders/components/OrderListCard.tsx` | List chip integration | Existing single-card `Link` structure | Avoid nested interactive children inside a `Link`; chip should be part of card navigation or the card structure must be carefully refactored. Preserve `scope` query. |
| `FE/artium-web/src/@domains/orders/views/OrderDetailPageView.tsx` | Invoice data loading, panel/modal integration | Existing order load `useEffect` and right-column stack | Keep order lifecycle state intact; add invoice prefetch after order load and reuse one loader for prefetch/modal/retry. |
| `FE/artium-web/src/styles/globals.css` if needed | Print-only CSS | Existing global Tailwind base file | Add narrowly scoped `@media print` selectors only for order invoice classes; do not add new global SCSS. |

## Code Excerpts To Preserve

### Existing Orders Page State

`OrdersPageView` owns pagination, filters, scope, and search. List chip navigation must not reset this state beyond normal route navigation.

```tsx
<OrderListCard
  key={order.id}
  order={order}
  scope={scope}
  currentUserId={user?.id}
/>
```

### Existing Card Link Shape

`OrderListCard` is currently a full-card `Link`. Avoid nested buttons inside it.

```tsx
<Link
  href={{
    pathname: `/orders/${order.id}`,
    query: { scope },
  }}
  className="group block rounded-[28px] border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
>
```

### Existing Detail Right Column

Invoice panel should join this right-column stack as a sibling, not inside `OrderActionPanel`.

```tsx
<div className="space-y-5">
  <OrderActionPanel ... />
  <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-xl font-semibold text-slate-900">Order totals</h2>
  </div>
</div>
```

### Existing API Contract

Phase 31 must consume this method as its only invoice source.

```ts
getOrderInvoice: async (id: string): Promise<OrderInvoiceResponse> => {
  return apiFetch<OrderInvoiceResponse>(`/orders/${encodePathSegment(id)}/invoice`)
}
```

## Implementation Notes

- Prefer direct component props over introducing global state.
- Keep invoice availability state local to the order detail/invoice components.
- Use `OrderInvoiceResponse` and related types from `@shared/apis/orderApis`.
- Do not add a dedicated invoice route in Phase 31.
- Do not add PDF dependencies.
- Treat seller-redacted values as first-class display states.

## PATTERN MAPPING COMPLETE
