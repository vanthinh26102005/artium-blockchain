---
phase: 18-seller-auction-access-and-artwork-eligibility-policy
plan: 01
subsystem: api
tags: [nestjs, cqrs, artwork-service, auctions, eligibility]
requires:
  - phase: 17
    provides: Auction DTO and backend integration patterns
provides:
  - Shared seller auction artwork candidate DTOs
  - Artwork-service intrinsic eligibility query
  - Unit coverage for seller auction eligibility reason codes
affects: [seller-auctions, artwork-service, api-gateway, frontend-auction-picker]
tech-stack:
  added: []
  patterns: [server-owned eligibility reasons, CQRS query handler, microservice message pattern]
key-files:
  created:
    - BE/libs/common/src/dtos/auctions/seller-auction-artwork-candidates.dto.ts
    - BE/apps/artwork-service/src/application/queries/artworks/ListSellerAuctionArtworkCandidates.query.ts
    - BE/apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.ts
    - BE/apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.spec.ts
  modified:
    - BE/libs/common/src/dtos/auctions/index.ts
    - BE/apps/artwork-service/src/application/index.ts
    - BE/apps/artwork-service/src/presentation/microservice/artworks.microservice.controller.ts
    - BE/apps/artwork-service/src/app.module.ts
key-decisions:
  - "Intrinsic seller auction eligibility is computed in artwork-service and exposed as stable reason codes."
  - "Jest tests import direct entity/interface files instead of the artwork domain barrel to avoid unrelated ESM service dependencies."
patterns-established:
  - "Backend eligibility returns grouped eligible/blocked candidates with recovery actions."
  - "Artwork-service auction candidate queries use trusted backend seller IDs only."
requirements-completed: [SAUC-02, SAUC-03]
duration: 4 min
completed: 2026-04-24
---

# Phase 18 Plan 01: Shared Artwork Eligibility Summary

**Artwork-service seller auction eligibility with shared candidate DTOs and reason-code test coverage**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-24T18:02:19Z
- **Completed:** 2026-04-24T18:06:25Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Added shared `SellerAuctionArtworkEligibilityReason` and candidate response DTOs under `@app/common`.
- Added `ListSellerAuctionArtworkCandidatesQuery` and handler to compute intrinsic eligibility for seller-owned artworks.
- Added microservice wiring and Jest table coverage for lifecycle, publication, on-chain, quantity, image, and metadata blockers.

## Task Commits

1. **Plan implementation and tests** - `392fb741` (feat)

**Plan metadata:** pending docs commit

## Files Created/Modified

- `BE/libs/common/src/dtos/auctions/seller-auction-artwork-candidates.dto.ts` - Shared candidate, reason, recovery action, and grouped response DTOs.
- `BE/apps/artwork-service/src/application/queries/artworks/ListSellerAuctionArtworkCandidates.query.ts` - Seller-scoped CQRS query.
- `BE/apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.ts` - Intrinsic eligibility policy and recovery copy mapping.
- `BE/apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.spec.ts` - Reason-code and grouping tests.
- `BE/apps/artwork-service/src/presentation/microservice/artworks.microservice.controller.ts` - `list_seller_auction_artwork_candidates` message pattern.
- `BE/apps/artwork-service/src/app.module.ts` - Query handler registration.

## Decisions Made

Backend eligibility owns the reason-code contract so React can render policy results without duplicating auctionability rules.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Codebase compatibility] Sort direction casing**
- **Found during:** Task 2 verification
- **Issue:** The plan specified `createdAt: 'DESC'`, but this codebase's `FindManyOptions` type accepts lowercase `desc`.
- **Fix:** Used `createdAt: 'desc'` and asserted that value in the unit test.
- **Files modified:** `ListSellerAuctionArtworkCandidates.query.handler.ts`, `ListSellerAuctionArtworkCandidates.query.handler.spec.ts`
- **Verification:** `yarn test --runInBand ListSellerAuctionArtworkCandidates`, `yarn build:artwork`
- **Committed in:** `392fb741`

**2. [Rule 1 - Test isolation] Avoid domain barrel in Jest**
- **Found during:** Task 3 verification
- **Issue:** Importing the artwork domain barrel loaded `GcsStorageService`, which pulled an ESM-only `uuid` build into Jest.
- **Fix:** Imported the entity and repository interface directly from their source files.
- **Files modified:** `ListSellerAuctionArtworkCandidates.query.handler.ts`, `ListSellerAuctionArtworkCandidates.query.handler.spec.ts`
- **Verification:** `yarn test --runInBand ListSellerAuctionArtworkCandidates`
- **Committed in:** `392fb741`

---

**Total deviations:** 2 auto-fixed.
**Impact on plan:** No scope change. Both fixes were required to match existing project types and test runtime behavior.

## Issues Encountered

None beyond the deviations documented above.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd BE && yarn test --runInBand ListSellerAuctionArtworkCandidates` - passed
- `cd BE && yarn build:artwork` - passed

## Next Phase Readiness

Plan 18-02 can call the artwork-service candidate message and merge order-lock blockers.

## Self-Check: PASSED

---
*Phase: 18-seller-auction-access-and-artwork-eligibility-policy*
*Completed: 2026-04-24*
