---
phase: 18
status: passed
requirements: [SAUC-01, SAUC-02, SAUC-03]
verified: 2026-04-25
---

# Phase 18 Verification

## Verdict

PASSED with one repository-level caveat: full frontend lint still fails on unrelated pre-existing files, while all Phase 18 frontend files pass targeted ESLint.

## Goal Verification

- Seller-only auction candidate access exists at `GET /auctions/seller/artwork-candidates` with `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.SELLER)`.
- Gateway derives seller identity from `req.user?.id` and does not accept a client `sellerId` query/body value for candidate scope.
- Artwork-service returns only seller-owned candidate artworks through `findManyBySellerId` and computes intrinsic eligibility server-side.
- Eligibility blocks sold, deleted, reserved, already-in-auction, inactive/draft, unpublished, existing on-chain auction, multi-quantity, missing-primary-image, and missing-metadata artworks with stable reason codes and recovery actions.
- Orders-service returns only locked artwork IDs for active order statuses, and gateway merges them as `ACTIVE_ORDER_LOCK` without exposing order details.
- Frontend route `/artist/auctions/create` exists with `SidebarLayout`, auth protection, non-seller guidance, seller policy summary, `Ready for auction`, and `Needs attention` sections.
- Frontend API `getSellerArtworkCandidates()` accepts no arguments and sends no `sellerId`; React renders backend-provided reason/recovery copy without duplicating reason-code business rules.
- Phase 19/20 scope boundaries are preserved: the page does not collect auction terms or submit/start auctions.

## Requirement Coverage

| Requirement | Status | Evidence |
|-------------|--------|----------|
| SAUC-01 | Passed | Backend seller route is guarded by JWT and seller role; frontend route requires auth and renders non-seller guidance before loading candidate data. |
| SAUC-02 | Passed | Artwork-service scopes candidates by seller-owned records; gateway merges active order locks and does not trust client seller identity. |
| SAUC-03 | Passed | Candidate DTOs include `reasonCodes` and `recoveryActions`; frontend renders blocked artwork recovery guidance. |

## Automated Evidence

- `cd BE && yarn test --runInBand ListSellerAuctionArtworkCandidates` passed.
- `cd BE && yarn build:artwork` passed.
- `cd BE && yarn test --runInBand GetArtworkOrderLocks` passed.
- `cd BE && yarn build:orders` passed.
- `cd BE && yarn build:gateway` passed.
- `cd BE && yarn test --runInBand` passed: 4 suites, 19 tests.
- `cd FE/artium-web && npx eslint src/@shared/apis/auctionApis.ts src/@domains/auction/hooks/useSellerAuctionArtworkCandidates.ts src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx src/pages/artist/auctions/create.tsx` passed.
- `gsd-sdk query verify.schema-drift 18` returned valid with no issues.

## Caveats

- `cd FE/artium-web && npm run lint` still fails on unrelated existing files outside Phase 18, with representative categories already present in prior verification: unescaped entities, synchronous setState in effects, explicit `any`, and `@ts-ignore` usage.
- Browser UAT for actual unauthenticated, non-seller, and seller sessions was not executed in this terminal. The route, guards, role checks, and data loading behavior were verified statically and with targeted automated checks.

## Result

Phase 18 achieves its goal and is ready for Phase 19 planning/execution.
