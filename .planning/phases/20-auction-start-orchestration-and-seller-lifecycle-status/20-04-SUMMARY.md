---
phase: 20
plan: 04
subsystem: seller-surfaces
tags: [seller-auctions, inventory, orders, lifecycle-badges, recovery]
requires:
  - phase: 20
    provides: completed plans 02 and 03 seller lifecycle state plus authoritative activation convergence
provides:
  - authoritative seller auction lifecycle badges in seller inventory
  - seller order cards aligned with retry, failure, wallet, and active auction semantics
  - seller-only artwork lifecycle enrichment gated away from public seller/profile reads
affects: [SAUC-06, SAUC-09, phase-20-wave-3]
tech-stack:
  added: []
  patterns:
    - opt-in seller-only artwork lifecycle enrichment via artwork query flag
    - shared lifecycle badge registry for seller order and inventory surfaces
    - seller order lifecycle merge through canonical start-status lookups by hydrated artwork item
key-files:
  created:
    - BE/apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.spec.ts
    - .planning/phases/20-auction-start-orchestration-and-seller-lifecycle-status/20-04-SUMMARY.md
  modified:
    - BE/libs/common/src/dtos/artworks/artwork/get-artworks-query.dto.ts
    - BE/libs/common/src/dtos/artworks/artwork/find-many-artwork.input.ts
    - BE/libs/common/src/dtos/artworks/artwork/artwork.object.ts
    - BE/apps/artwork-service/src/domain/dtos/artworks/find-many-artwork.input.ts
    - BE/apps/artwork-service/src/domain/dtos/artworks/artwork.object.ts
    - BE/apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.ts
    - BE/apps/artwork-service/src/app.module.ts
    - FE/artium-web/src/@shared/apis/artworkApis.ts
    - FE/artium-web/src/@shared/apis/orderApis.ts
    - FE/artium-web/src/@domains/inventory/types/inventoryArtwork.ts
    - FE/artium-web/src/@domains/inventory/utils/inventoryApiMapper.ts
    - FE/artium-web/src/@domains/inventory/hooks/useInventoryBootstrap.ts
    - FE/artium-web/src/@domains/inventory/views/InventoryPage.tsx
    - FE/artium-web/src/@domains/inventory/components/InventoryArtworkGridViewItem.tsx
    - FE/artium-web/src/@domains/inventory/components/InventoryArtworkList.tsx
    - FE/artium-web/src/@domains/orders/utils/orderPresentation.ts
    - FE/artium-web/src/@domains/orders/components/OrderListCard.tsx
    - FE/artium-web/src/@domains/orders/views/OrdersPageView.tsx
key-decisions:
  - "Gate seller-only artwork lifecycle enrichment behind includeSellerAuctionLifecycle so public profile and discovery reads do not receive private retry/failure state."
  - "Reuse a shared order-status registry for seller lifecycle badges instead of inventing inventory-specific badge semantics."
  - "Attach seller order lifecycle state in the FE by matching hydrated artwork items back to the canonical getSellerAuctionStartStatus endpoint."
patterns-established:
  - "Seller-only status enrichments should be opt-in on shared read endpoints when the same backend read also powers public surfaces."
  - "Seller order cards can safely compose canonical auction lifecycle state from existing order plus artwork-linked lifecycle queries without widening the order contract late in the phase."
requirements-completed: [SAUC-06, SAUC-09]
completed: 2026-04-27
---

# Phase 20 Plan 04: Auction start orchestration and seller lifecycle status Summary

**Finished seller-facing lifecycle convergence by surfacing authoritative auction start status across inventory and seller order cards, while keeping private retry/failure state out of public artwork reads.**

## Accomplishments

- Added an opt-in artwork query flag and artwork-service enrichment path so seller inventory responses can include canonical auction lifecycle state from orders-service only when the authenticated seller workspace asks for it.
- Updated seller inventory mapping and card/list rendering to show authoritative lifecycle badges alongside existing visibility state instead of relying on optimistic FE-only status.
- Extended seller order presentation to use a shared lifecycle badge registry and canonical next-step messaging for pending wallet action, retryable failures, editable failures, and active auctions.
- Added focused artwork-service coverage for the new lifecycle enrichment path and kept public/profile artwork reads unchanged unless an auction is authoritatively active.

## Validation

- `cd BE && npx jest apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.spec.ts apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.spec.ts --runInBand`
- `cd BE && yarn build:artwork`
- `cd FE/artium-web && npx eslint src/@domains/inventory/views/InventoryPage.tsx src/@domains/inventory/hooks/useInventoryBootstrap.ts src/@domains/inventory/utils/inventoryApiMapper.ts src/@domains/inventory/components/InventoryArtworkGridViewItem.tsx src/@domains/inventory/components/InventoryArtworkList.tsx src/@domains/orders/utils/orderPresentation.ts src/@domains/orders/components/OrderListCard.tsx src/@domains/orders/components/OrderStatusBadge.tsx src/@domains/orders/views/OrdersPageView.tsx src/@shared/apis/artworkApis.ts src/@shared/apis/orderApis.ts && npx tsc --noEmit`

## Next Phase Readiness

- All four Phase 20 plans are now implemented, so the phase can move into verify/validate/secure follow-up without additional execution work.
- Seller inventory, seller orders, and public auction surfaces now converge on authoritative auction lifecycle state with seller-only recovery semantics kept private.
