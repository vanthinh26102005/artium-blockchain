---
phase: 18
slug: seller-auction-access-and-artwork-eligibility-policy
status: complete
created: 2026-04-25
---

# Phase 18 Pattern Map

## Backend Patterns

| New Area | Closest Existing Analog | Pattern To Follow |
|----------|-------------------------|-------------------|
| Shared auction candidate DTOs | `BE/libs/common/src/dtos/auctions/auction-read.dto.ts` | Put auction-facing DTOs under `dtos/auctions`, export through `dtos/auctions/index.ts` and `BE/libs/common/src/index.ts`. |
| Artwork-service seller candidate query | `ListArtworksQuery` and `ListArtworksHandler` | Add CQRS query class, handler, microservice `@MessagePattern`, and register handler in `ArtworkServiceModule.QueryHandlers`. |
| Orders-service active lock query | `GetOrdersQuery` and `findBySellerIdViaItems` | Use repository join through `order_items` and filter by seller/artwork/status. |
| API gateway seller-scoped route | `OrdersController.getOrders` | Read `req.user?.id` and overwrite any client-supplied identity filters. |
| Seller role guard | `OrdersController.resolveDispute` | Use `@UseGuards(JwtAuthGuard, RolesGuard)` plus `@Roles(UserRole.SELLER)`. |

## Frontend Patterns

| New Area | Closest Existing Analog | Pattern To Follow |
|----------|-------------------------|-------------------|
| Seller auction route | `FE/artium-web/src/pages/inventory/index.tsx` | Dynamic import page view, `useRequireAuth`, `SidebarLayout`. |
| Seller candidate API | `FE/artium-web/src/@shared/apis/auctionApis.ts` | Add typed API function under auction API adapter using `apiFetch`, auth default enabled, no `sellerId` parameter. |
| Candidate loading hook | `useAuctionLots` | Hook owns `isLoading`, `error`, `refresh`, and maps API response into view types. |
| Artwork cards | `InventoryArtworkGridViewItem` | Rounded card, image block, selection ring, metadata, lucide actions. |
| Seller commercial workflow | `QuickSellCreateInvoicePageView` | Clear header, left-to-right workflow copy, inline error banner, no toast-only failure. |

## Specific Mapping

### DTO Exports

- Create: `BE/libs/common/src/dtos/auctions/seller-auction-artwork-candidates.dto.ts`
- Update: `BE/libs/common/src/dtos/auctions/index.ts`
- Confirm: `BE/libs/common/src/index.ts` already exports `./dtos/auctions`.

### Artwork Service

- Create query: `BE/apps/artwork-service/src/application/queries/artworks/ListSellerAuctionArtworkCandidates.query.ts`
- Create handler: `BE/apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.ts`
- Add microservice pattern: `BE/apps/artwork-service/src/presentation/microservice/artworks.microservice.controller.ts`
- Register handler: `BE/apps/artwork-service/src/app.module.ts`

### Orders Service

- Create query: `BE/apps/orders-service/src/application/queries/GetArtworkOrderLocks.query.ts`
- Create handler: `BE/apps/orders-service/src/application/queries/handlers/GetArtworkOrderLocks.query.handler.ts`
- Update interface/repository: `BE/apps/orders-service/src/domain/interfaces/order.repository.interface.ts`, `BE/apps/orders-service/src/infrastructure/repositories/order.repository.ts`
- Add microservice pattern: `BE/apps/orders-service/src/presentation/microservice/orders.microservice.controller.ts`
- Register handler: `BE/apps/orders-service/src/app.module.ts`

### API Gateway

- Update: `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts`
- Inject `ARTWORK_SERVICE` in addition to `ORDERS_SERVICE`.
- Add `GET /auctions/seller/artwork-candidates` before `GET /auctions/:auctionId`.

### Frontend

- Update API adapter: `FE/artium-web/src/@shared/apis/auctionApis.ts`
- Add hook: `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionArtworkCandidates.ts`
- Add view: `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx`
- Add route: `FE/artium-web/src/pages/artist/auctions/create.tsx`

## Pitfalls To Avoid

- Do not add `sellerId` to the frontend candidate API input.
- Do not put eligibility reason logic in React. React only maps backend reason codes to the copy contract from UI-SPEC.
- Do not collect reserve price, duration, bid increment, wallet readiness, or submit/start actions in Phase 18.
- Do not place `GET /auctions/seller/artwork-candidates` after `GET /auctions/:auctionId` in a way that lets `seller` be captured as an auction ID.
- Do not expose order IDs, buyer IDs, or payment details when reporting `ACTIVE_ORDER_LOCK`.
