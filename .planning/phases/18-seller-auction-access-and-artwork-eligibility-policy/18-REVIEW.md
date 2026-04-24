---
phase: 18
status: clean
depth: standard
files_reviewed: 22
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
created: 2026-04-25
---

# Phase 18 Code Review

## Scope

Reviewed source files created or modified by Phase 18 summaries:

- `BE/libs/common/src/dtos/auctions/seller-auction-artwork-candidates.dto.ts`
- `BE/libs/common/src/dtos/auctions/index.ts`
- `BE/apps/artwork-service/src/application/queries/artworks/ListSellerAuctionArtworkCandidates.query.ts`
- `BE/apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.ts`
- `BE/apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.spec.ts`
- `BE/apps/artwork-service/src/application/index.ts`
- `BE/apps/artwork-service/src/presentation/microservice/artworks.microservice.controller.ts`
- `BE/apps/artwork-service/src/app.module.ts`
- `BE/apps/orders-service/src/application/queries/GetArtworkOrderLocks.query.ts`
- `BE/apps/orders-service/src/application/queries/handlers/GetArtworkOrderLocks.query.handler.ts`
- `BE/apps/orders-service/src/application/queries/handlers/GetArtworkOrderLocks.query.handler.spec.ts`
- `BE/apps/orders-service/src/domain/interfaces/order.repository.interface.ts`
- `BE/apps/orders-service/src/infrastructure/repositories/order.repository.ts`
- `BE/apps/orders-service/src/application/queries/index.ts`
- `BE/apps/orders-service/src/application/queries/handlers/index.ts`
- `BE/apps/orders-service/src/presentation/microservice/orders.microservice.controller.ts`
- `BE/apps/orders-service/src/app.module.ts`
- `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts`
- `FE/artium-web/src/@shared/apis/auctionApis.ts`
- `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionArtworkCandidates.ts`
- `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx`
- `FE/artium-web/src/pages/artist/auctions/create.tsx`

## Findings

No critical, warning, or info findings.

## Security Notes

- Seller scope is derived from `req.user?.id`; no client-supplied seller ID is accepted by the gateway candidate endpoint.
- Gateway endpoint uses `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.SELLER)`.
- Active order locks expose only the `ACTIVE_ORDER_LOCK` reason and recovery hint, not order IDs, buyer IDs, payment IDs, or shipping details.
- Frontend role gating is convenience UX only; backend authorization is authoritative.

## Verification Evidence Reviewed

- `cd BE && yarn test --runInBand ListSellerAuctionArtworkCandidates` - passed
- `cd BE && yarn build:artwork` - passed
- `cd BE && yarn test --runInBand GetArtworkOrderLocks` - passed
- `cd BE && yarn build:orders` - passed
- `cd BE && yarn build:gateway` - passed
- `cd FE/artium-web && npx eslint src/@shared/apis/auctionApis.ts src/@domains/auction/hooks/useSellerAuctionArtworkCandidates.ts src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx src/pages/artist/auctions/create.tsx` - passed

## Residual Risk

Repository-wide `npm run lint` currently fails on unrelated pre-existing files outside the Phase 18 scope. This does not indicate a Phase 18 source finding, but it prevents a clean global frontend lint gate until the existing lint debt is resolved.
