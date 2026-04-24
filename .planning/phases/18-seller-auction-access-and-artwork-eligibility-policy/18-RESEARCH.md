---
phase: 18
slug: seller-auction-access-and-artwork-eligibility-policy
status: complete
created: 2026-04-25
---

# Phase 18 Research - Seller Auction Access and Artwork Eligibility Policy

## Research Complete

Phase 18 should be implemented as a backend-owned eligibility contract consumed by a seller-only frontend page. The safest implementation is not to reuse the generic artwork list endpoint directly, because that endpoint accepts `sellerId` as a client filter. The auction candidate endpoint must derive seller identity from the authenticated request and apply server-side policy before returning eligible and blocked items.

## Source Inputs

- `.planning/phases/18-seller-auction-access-and-artwork-eligibility-policy/18-CONTEXT.md`
- `.planning/phases/18-seller-auction-access-and-artwork-eligibility-policy/18-UI-SPEC.md`
- `.planning/REQUIREMENTS.md` - SAUC-01, SAUC-02, SAUC-03
- `.planning/ROADMAP.md` - Phase 18 success criteria

## Codebase Findings

### Access Control

- `BE/libs/common/src/enums/user-role.enum.ts` defines `UserRole.SELLER = 'seller'`.
- `BE/libs/auth/src/guards/roles.guard.ts` already supports `@Roles(UserRole.SELLER)` when paired with `JwtAuthGuard`.
- `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts` demonstrates current server-side identity derivation by replacing client filters with `req.user?.id` for buyer/seller order scopes.
- `FE/artium-web/src/@domains/auth/hooks/useRequireAuth.ts` redirects unauthenticated users before protected pages render.
- `FE/artium-web/src/@shared/types/auth.ts` exposes `user.roles: string[]`, which can be used for client-side seller guidance while backend remains authoritative.

### Artwork Eligibility

- `BE/apps/artwork-service/src/domain/entities/artworks.entity.ts` contains the fields needed for intrinsic artwork eligibility: `sellerId`, `status`, `isPublished`, `quantity`, `images`, `title`, `creatorName`, and `onChainAuctionId`.
- `BE/libs/common/src/enums/artwork-status.enum.ts` includes all blocking lifecycle statuses: `SOLD`, `RESERVED`, `INACTIVE`, `DELETED`, `PENDING_REVIEW`, and `IN_AUCTION`.
- `BE/apps/artwork-service/src/infrastructure/repositories/artwork.repository.ts` already has `findManyBySellerId`, so candidate retrieval should build from that repository method instead of broad public listing filters.
- Primary image detection should prefer `images.find((image) => image.isPrimary)` and fall back to `images[0]` only for display URL, not for eligibility. The Phase 18 policy requires an actual primary image.

### Active Order/Auction Locks

- `BE/apps/orders-service/src/domain/entities/order_items.entity.ts` indexes `artworkId` and `sellerId`.
- `BE/apps/orders-service/src/domain/entities/orders.entity.ts` stores order `status`, `paymentMethod`, and auction fields such as `onChainOrderId`.
- `BE/apps/orders-service/src/infrastructure/repositories/order.repository.ts` already joins `orders` to `order_items` in `findBySellerIdViaItems`.
- A new order lock query should return artwork IDs that have non-terminal order states for the current seller. Treat `PENDING`, `CONFIRMED`, `PROCESSING`, `AUCTION_ACTIVE`, `ESCROW_HELD`, and `DISPUTE_OPEN` as active locks. Treat `CANCELLED`, `REFUNDED`, and `DELIVERED` as terminal for Phase 18 lock purposes.

### Frontend Candidate Picker

- `FE/artium-web/src/pages/inventory/index.tsx` shows the protected route plus `SidebarLayout` pattern.
- `FE/artium-web/src/@domains/inventory/views/InventoryPage.tsx` shows current seller inventory loading, but it calls generic artwork APIs with `sellerId: user.id`. The new auction page should call an auction-specific endpoint without `sellerId`.
- `FE/artium-web/src/@domains/inventory/components/InventoryArtworkGridViewItem.tsx` and `InventoryArtworkListViewItem.tsx` provide reusable card/list visual patterns.
- `FE/artium-web/src/@domains/quick-sell/views/QuickSellCreateInvoicePageView.tsx` and `QuickSellArtworkItemRow.tsx` provide seller commercial-workflow precedent, but invoice price editing is not in scope for Phase 18.
- `FE/artium-web/src/@shared/apis/auctionApis.ts` already exists for public auction reads; it is the right place to add seller candidate API types/functions because the endpoint is under `/auctions`.

## Recommended Implementation Architecture

1. Add shared DTOs under `BE/libs/common/src/dtos/auctions/` for seller auction artwork candidates.
2. Add an artwork-service query that returns current seller-owned artwork candidates with intrinsic eligibility reason codes.
3. Add an orders-service query that returns active order locks by seller and artwork IDs.
4. Add an authenticated seller-only gateway endpoint, recommended path `GET /auctions/seller/artwork-candidates`, that derives `sellerId` from `req.user?.id`, calls artwork-service and orders-service, merges `ACTIVE_ORDER_LOCK`, and returns the final candidate list.
5. Add frontend seller auction candidate types and hook/view under `@domains/auction`, plus route `/artist/auctions/create`.

## DTO Contract Recommendation

Use stable reason codes:

- `NOT_ACTIVE`
- `NOT_PUBLISHED`
- `SOLD`
- `DELETED`
- `RESERVED`
- `IN_AUCTION`
- `HAS_ON_CHAIN_AUCTION`
- `ACTIVE_ORDER_LOCK`
- `MULTI_QUANTITY`
- `MISSING_PRIMARY_IMAGE`
- `MISSING_METADATA`

Use response shape:

```ts
type SellerAuctionArtworkCandidatesResponse = {
  eligible: SellerAuctionArtworkCandidateObject[];
  blocked: SellerAuctionArtworkCandidateObject[];
  total: number;
  eligibleCount: number;
  blockedCount: number;
};
```

This shape satisfies the context decision that planners may choose grouped lists as long as reason codes and recovery hints exist.

## Security Notes

- Do not accept `sellerId` from query or body for the seller candidate endpoint.
- Use `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(UserRole.SELLER)` on the API gateway endpoint.
- Return `403` for authenticated non-sellers at the backend, even if the frontend shows a friendlier seller-profile CTA.
- Do not expose order IDs, buyer IDs, collector IDs, shipping details, payment IDs, or internal notes in eligibility responses. Only expose `ACTIVE_ORDER_LOCK` reason metadata.

## Validation Architecture

### Automated Validation

- Backend unit tests should cover intrinsic artwork eligibility reason generation with table cases for each reason code.
- Backend unit tests should cover order lock classification for active vs terminal statuses.
- Gateway/controller tests or build-time static checks should verify the route uses `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.SELLER)`.
- Frontend static checks should verify the route exists, calls the seller candidate API without `sellerId`, and renders the UI-SPEC copy strings.

### Commands

- Backend quick command: `cd BE && yarn test --runInBand`
- Backend build command: `cd BE && yarn build:artwork && yarn build:orders && yarn build:gateway`
- Frontend build/lint command: `cd FE/artium-web && npm run lint`

### Manual Validation

- Visit `/artist/auctions/create` unauthenticated and confirm login redirect or auth-required behavior.
- Visit as a collector/non-seller and confirm seller-profile CTA with no picker data.
- Visit as seller and confirm eligible and blocked groups render from backend response.
- Confirm the network request does not include a client-supplied `sellerId`.

## Planning Risks

- The generic artwork endpoint currently uses `/artworks` in FE while the API gateway controller is `@Controller('artwork')`; existing base URL normalization hides some route differences. The new seller candidate call should use the same API client conventions as `auctionApis`.
- Existing frontend has no dedicated test script. The plan should rely on lint/build checks unless test infrastructure is added in a future testing phase.
- Orders-service does not yet have an artwork-lock query, so Phase 18 must add one rather than trying to infer active orders in the frontend.
