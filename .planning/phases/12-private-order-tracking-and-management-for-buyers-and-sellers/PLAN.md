# Phase 12: Private Order Tracking and Management for Buyers and Sellers

## Goal

Give authenticated users a professional private orders workspace where they can review purchases or sales, inspect order details, and complete the next valid order action without relying on public profile surfaces or ad hoc admin tooling.

This phase plans directly from the roadmap, the prior discuss-phase research, and the live codebase. No separate research artifact is required because the current gap is already clear in the existing routes, API clients, and dashboard UI patterns.

---

## Root Cause (confirmed by code audit)

### 1) Order APIs exist, but there is no routed product surface for them

The frontend already has `orderApis` support for:

- `getMyOrders()`
- `getOrderById(id)`
- `getOrderItems(orderId)`
- `cancelOrder(id)`

And the backend already exposes order-management endpoints for:

- list
- detail
- cancel
- mark shipped
- confirm delivery
- open dispute
- resolve dispute

But there is no actual user-facing route or domain UI for orders. The platform can create orders during checkout, yet users have nowhere to track or manage them after payment.

### 2) The current navigation and IA do not provide a private home for orders

Current routed areas are top-level app pages such as:

- `/inventory`
- `/events`
- `/manage-plan`
- `/artist/invoices`

Public profile tabs are content-oriented (`overview`, `artworks`, `moments`, `moodboards`) and are the wrong information architecture for private order management. Orders should live in an authenticated workspace, not on public profile surfaces.

### 3) The list endpoint shape is not yet safe enough for a true "my orders" product surface

`GET /orders` currently forwards raw query filters from the client. The orders query handler can filter by `buyerId` or `sellerId`, but the gateway path shown today does not inject those scopes from `req.user` for list reads.

That is acceptable for internal scaffolding, but it is not acceptable for a production-quality private orders workspace. The shipped feature must enforce user-scoped reads server-side and never trust arbitrary foreign user IDs from the browser.

### 4) The design system for this feature already exists elsewhere in the product

The existing app already has strong private-workspace patterns that should be reused:

- `InventoryPage.tsx` for page shell, sticky toolbar, content card, pagination, and empty-state structure
- `QuickSellInvoicesListView.tsx` for professional list-card rhythm, filters, and row actions
- `SideBar.tsx` / `SidebarLayout.tsx` for authenticated navigation entry points

So the right move is not a new visual language. The right move is a new orders domain that composes these existing dashboard patterns cleanly.

---

## Architecture Direction

Phase 12 should introduce a dedicated private orders domain and top-level authenticated routes:

- `/orders`
- `/orders/[orderId]`

Recommended product shape:

- one authenticated orders workspace with a segmented view for `Purchases` and `Sales`
- a professional list page for scanning/filtering orders
- a detail page for lifecycle tracking and role-aware actions
- a sidebar entry point labeled `Orders`

Recommended technical split:

- `@domains/orders` owns routes, views, hooks, types, and UI composition
- `@shared/apis/orderApis.ts` becomes the typed boundary for all FE order requests
- backend order list/detail access is hardened so the authenticated user only sees orders where they are the buyer or seller

Recommended access model:

- buyer scope and seller scope are explicit
- the frontend requests a scope such as `purchases` or `sales`
- the backend resolves that scope using `req.user.id`, not a caller-supplied foreign ID

This keeps the UX professional and the security model defensible.

---

## Plan 12.1 — Harden the order data contract for a real private workspace

**Goal:** Make order listing and detail reads safe and expressive enough for a user-facing orders product.

### Files to Modify

**1. `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts`**

Refine the list and detail surface so the browser cannot request arbitrary users' orders.

Recommended direction:

- add an explicit list scope contract, for example `scope = buyer | seller`
- derive `buyerId` / `sellerId` from `req.user.id` inside the gateway instead of trusting raw IDs from the client
- verify detail/item reads also enforce order ownership or seller participation before returning data

If the current service layer already performs these checks, confirm and preserve them. If it does not, add them before the UI is built.

**2. `BE/libs/common/src/dtos/orders/get-orders.dto.ts`**

Add or refine the query DTO for workspace use:

- `scope`
- optional `status`
- optional pagination
- optional lightweight search support only if the backend can support it cleanly

Do not expose raw `buyerId` / `sellerId` fields as the public FE contract for this private feature unless they are strictly internal and overwritten server-side.

**3. `BE/apps/orders-service/src/application/queries/handlers/GetOrders.query.handler.ts`**

Verify that:

- buyer scope returns only orders where `collectorId = currentUserId`
- seller scope returns only orders where the current seller is represented in order items
- ordering is newest-first
- pagination works deterministically

If needed, add or tighten query branching for workspace scope.

**4. `FE/artium-web/src/@shared/apis/orderApis.ts`**

Upgrade the FE API client from a minimal checkout helper into a typed orders boundary.

Recommended additions:

```ts
type OrderScope = 'buyer' | 'seller'

type GetMyOrdersInput = {
  scope: OrderScope
  status?: string
  skip?: number
  take?: number
}
```

Also add FE wrappers for the actions already present on the backend:

- `markShipped`
- `confirmDelivery`
- `openDispute`

Keep the API layer thin and typed. Do not bury UI mapping logic here.

### Outcome

After this plan, the UI can trust the API boundary for:

- scoped order lists
- scoped order details
- role-valid mutations

without leaking security decisions into components.

---

## Plan 12.2 — Build the private orders workspace list page

**Goal:** Add a professional orders list page that matches the existing authenticated dashboard style.

### Files to Create

**5. `FE/artium-web/src/pages/orders/index.tsx`**

Create the routed page entry and wrap it in `SidebarLayout`.

**6. `FE/artium-web/src/@domains/orders/views/OrdersPageView.tsx`**

Own the private orders workspace orchestration:

- current segment (`Purchases` vs `Sales`)
- current filters
- pagination
- loading / empty / error states

**7. `FE/artium-web/src/@domains/orders/components/...`**

Create the minimum composable UI pieces needed, for example:

- `OrdersToolbar`
- `OrdersSegmentedControl`
- `OrderStatusBadge`
- `OrderListCard`
- `OrdersEmptyState`
- `OrdersLoadingState`

### UX Direction

Base the list-page UX on the existing private app surfaces:

- sticky header / toolbar rhythm from `InventoryPage.tsx`
- clean rounded white content card from `QuickSellInvoicesListView.tsx`
- badge/filter language already used across checkout and dashboard surfaces

The page should feel like part of the current app:

- white cards
- slate borders
- rounded containers
- restrained blue primary CTA usage
- responsive stacked cards on mobile

### Required behavior

The list page should provide:

1. a clear page title such as `Orders`
2. a primary segmented control:
   - `Purchases`
   - `Sales`
3. status filters, e.g.:
   - `All`
   - `Processing`
   - `Shipped`
   - `Delivered`
   - `Cancelled`
   - `Dispute`
4. search by order number and, if data is available cleanly, artwork title
5. pagination or deterministic "load more" behavior
6. professional empty states for:
   - no purchases yet
   - no sales yet
   - no results for current filters

Each list item should surface at minimum:

- order number
- created date
- primary artwork thumbnail/title
- status badge
- total paid
- payment method
- next recommended action or `View details`

### Important scope guard

Do not add cross-phase features such as:

- returns portal
- messaging center
- shipment tracking integrations
- analytics dashboards

This phase is about private order tracking and lifecycle management, not adjacent commerce expansion.

---

## Plan 12.3 — Build the order detail page with role-aware lifecycle actions

**Goal:** Let users understand one order fully and complete the next valid action professionally.

### Files to Create

**8. `FE/artium-web/src/pages/orders/[orderId].tsx`**

Create the routed detail page entry under the same authenticated shell.

**9. `FE/artium-web/src/@domains/orders/views/OrderDetailPageView.tsx`**

Own data loading, role detection, mutation state, and page-level recovery UX.

**10. `FE/artium-web/src/@domains/orders/components/...`**

Create detail-level UI pieces, for example:

- `OrderDetailHeader`
- `OrderTimeline`
- `OrderArtworkSummaryCard`
- `OrderPaymentCard`
- `OrderShippingCard`
- `OrderActionPanel`
- `MarkShippedModal` or action form

### Required detail surface

The detail page should present:

- order number and created date
- current order status and payment status
- artwork/item summary
- shipping address and shipping/tracking metadata when available
- payment method and transaction summary
- timeline-style lifecycle presentation
- a next-step panel describing what the user can do now

### Role-aware actions

The UI must only expose actions that are valid for the current role and current status.

Recommended minimum action set:

- **Buyer**
  - cancel order when still eligible
  - confirm delivery when shipped / awaiting confirmation
  - open dispute when dispute window rules allow
- **Seller**
  - mark shipped with carrier / tracking number when eligible

Hide or disable invalid actions with clear explanation. Do not show impossible buttons.

### Interaction guidance

Use existing modal / confirmation patterns where appropriate. Prefer:

- inline success/error banners
- optimistic disable states during mutation
- destructive confirmation only where genuinely needed

Do not use browser `alert()` or ad hoc prompt flows.

---

## Plan 12.4 — Integrate navigation, status mapping, and verification

**Goal:** Make the orders experience discoverable, consistent, and verifiable.

### Files to Modify

**11. `FE/artium-web/src/@shared/components/display/SideBar.tsx`**

Add an `Orders` navigation entry in the authenticated app shell, positioned near adjacent commerce tools such as `Invoices`.

**12. `FE/artium-web/src/@domains/orders/...` shared utilities**

Create small mapping helpers for:

- status-to-badge copy/color
- payment method display
- role-aware action gating
- timeline step derivation

These helpers should keep view components declarative and reduce duplicated branching logic.

### Verification requirements

The phase is only complete when a developer can verify all of the following:

1. logged-in buyer sees only their own purchase orders in `Purchases`
2. logged-in seller sees only their own sold orders in `Sales`
3. direct navigation to an unauthorized order detail returns a safe error state rather than leaking data
4. buyer can confirm delivery only on an eligible shipped order
5. seller can mark shipped only on an eligible order
6. list and detail layouts remain professional and usable on mobile and desktop
7. build/typecheck pass after changes

### Suggested validation commands

Frontend:

- `cd FE/artium-web && npx tsc --noemit`
- `cd FE/artium-web && npm run build`

Backend:

- `cd BE && yarn build:gateway`
- `cd BE && ./node_modules/.bin/nest build orders-service`

If access-control changes are made, add targeted tests around scoped reads and role-valid actions before execution is considered complete.

---

## UAT Scenarios

1. Buyer completes checkout, later opens `/orders`, and sees the new order in `Purchases`.
2. Seller opens `/orders`, switches to `Sales`, and sees the corresponding sale.
3. Buyer opens an order detail page and can review artwork, payment, and shipping information without leaving the page.
4. Seller marks an eligible order as shipped and sees the detail page update cleanly.
5. Buyer confirms delivery on an eligible order and sees the lifecycle state advance.
6. Unauthorized users cannot read or manage someone else's order by changing the URL.

---

## Notes for Execution

- Keep the information architecture private and app-scoped. Do not extend public profile tabs for this feature.
- Preserve the current visual language. Reuse inventory/invoice/dashboard patterns instead of designing a new orders UI from scratch.
- Treat access control as part of the feature, not an optional backend cleanup. A polished private orders page without secure scoping is not a valid completion.
