# Phase 12 Execution Summary

## Outcome

Phase 12 is implemented.

Authenticated users now have a private `/orders` workspace with:

- segmented `Purchases` and `Sales` views
- scoped backend reads tied to `req.user.id`
- a routed order detail page with lifecycle timeline, payment/shipping details, and role-aware actions
- sidebar navigation entry for `Orders`

## Backend Changes

### Scoped order reads

- `BE/libs/common/src/dtos/orders/get-orders.dto.ts`
  - added `OrdersWorkspaceScope`
  - normalized pagination parsing with `@Type(() => Number)`

- `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts`
  - `GET /orders` now derives `buyerId` or `sellerId` from the authenticated user instead of trusting browser-supplied IDs
  - `GET /orders/:id`, `GET /orders/:id/items`, and `GET /orders/on-chain/:onChainOrderId` now enforce private workspace access and return a safe `404` when the user is neither the buyer nor a participating seller

- `BE/apps/orders-service/src/application/queries/handlers/GetOrders.query.handler.ts`
  - seller-scoped list queries now honor the same status/payment/on-chain filters as buyer-scoped queries

- `BE/apps/orders-service/src/domain/interfaces/order.repository.interface.ts`
- `BE/apps/orders-service/src/infrastructure/repositories/order.repository.ts`
  - expanded seller list query options
  - added filter support and distinct counting for seller-scoped order queries

## Frontend Changes

### Shared order API boundary

- `FE/artium-web/src/@shared/apis/orderApis.ts`
  - added typed scoped list API
  - expanded order response shape for detail pages
  - added wrappers for `markShipped`, `confirmDelivery`, and `openDispute`

### Orders domain

- `FE/artium-web/src/pages/orders/index.tsx`
- `FE/artium-web/src/pages/orders/[orderId].tsx`
  - added authenticated routed entry points under the existing sidebar shell

- `FE/artium-web/src/@domains/orders/views/OrdersPageView.tsx`
  - added the main private orders workspace
  - reused existing dashboard patterns: sticky toolbar, rounded content card, filter chips, pagination

- `FE/artium-web/src/@domains/orders/views/OrderDetailPageView.tsx`
  - added order detail UX with:
    - artwork summary
    - payment/shipping records
    - lifecycle timeline
    - success banner handling

- `FE/artium-web/src/@domains/orders/components/*`
- `FE/artium-web/src/@domains/orders/utils/orderPresentation.ts`
- `FE/artium-web/src/@domains/orders/types/orderTypes.ts`
  - added focused presentation helpers and role-aware action logic

- `FE/artium-web/src/@shared/components/display/SideBar.tsx`
  - added `Orders` navigation
  - improved active-path matching so `/orders/[orderId]` keeps the Orders nav item highlighted

## UX Notes

- The orders workspace follows the existing authenticated dashboard visual language instead of using public profile tabs.
- Unauthorized direct detail navigation is handled as a safe unavailable-state page rather than exposing order data or logging the user out.
- Wallet and card orders both render through the same detail surface, including payment method labeling and transaction metadata where available.
