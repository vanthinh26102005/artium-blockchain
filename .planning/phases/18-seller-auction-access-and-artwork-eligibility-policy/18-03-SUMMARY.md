---
phase: 18-seller-auction-access-and-artwork-eligibility-policy
plan: 03
subsystem: ui
tags: [nextjs, react, seller-auctions, eligibility-picker]
requires:
  - phase: 18-01
    provides: Shared seller auction candidate DTO shape
  - phase: 18-02
    provides: Seller-only auction candidate HTTP endpoint
provides:
  - `/artist/auctions/create` seller auction artwork picker route
  - Typed frontend seller auction candidate API client
  - Candidate loading hook with backend-owned eligibility reasons
affects: [seller-auctions, frontend-auction, phase-19-terms-ux]
tech-stack:
  added: []
  patterns: [protected Next route, seller-role guidance, backend-owned reason rendering]
key-files:
  created:
    - FE/artium-web/src/@domains/auction/hooks/useSellerAuctionArtworkCandidates.ts
    - FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx
    - FE/artium-web/src/pages/artist/auctions/create.tsx
  modified:
    - FE/artium-web/src/@shared/apis/auctionApis.ts
key-decisions:
  - "The frontend candidate API accepts no input and sends no `sellerId`; the backend session defines scope."
  - "Non-seller users see guidance before candidate data is loaded."
patterns-established:
  - "Seller auction UI renders eligible and blocked sections from backend reason data."
  - "Phase 18 picker exposes only a disabled terms affordance; no auction terms or transaction submission is implemented."
requirements-completed: [SAUC-01, SAUC-02, SAUC-03]
duration: 4 min
completed: 2026-04-24
---

# Phase 18 Plan 03: Seller Artwork Picker Summary

**Seller workspace page for choosing auction-ready artwork from backend eligibility results**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-24T18:10:18Z
- **Completed:** 2026-04-24T18:14:35Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Added typed seller auction candidate API support in `auctionApis`.
- Added `useSellerAuctionArtworkCandidates` hook with loading, error, refresh, eligible, and blocked state.
- Added `/artist/auctions/create` with auth protection, sidebar layout, seller role guidance, policy summary, eligible cards, blocked cards, and disabled terms affordance.

## Task Commits

1. **Plan implementation** - `6a67f91e` (feat)

**Plan metadata:** pending docs commit

## Files Created/Modified

- `FE/artium-web/src/@shared/apis/auctionApis.ts` - Seller candidate response types and `getSellerArtworkCandidates`.
- `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionArtworkCandidates.ts` - Candidate loading hook.
- `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx` - UI-SPEC-compliant seller picker view.
- `FE/artium-web/src/pages/artist/auctions/create.tsx` - Protected route with metadata and `SidebarLayout`.

## Decisions Made

Frontend role checks are convenience UX only. The backend endpoint remains authoritative through JWT and seller role guards.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Frontend lint hygiene] Use Next Image for candidate thumbnails**
- **Found during:** Task 3 verification
- **Issue:** Targeted lint flagged the candidate thumbnail `<img>` usage with Next's image optimization warning.
- **Fix:** Replaced it with `next/image` using `fill` and `unoptimized` for arbitrary backend image URLs.
- **Files modified:** `SellerAuctionArtworkPickerPage.tsx`
- **Verification:** `npx eslint src/@shared/apis/auctionApis.ts src/@domains/auction/hooks/useSellerAuctionArtworkCandidates.ts src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx src/pages/artist/auctions/create.tsx`
- **Committed in:** `6a67f91e`

---

**Total deviations:** 1 auto-fixed.
**Impact on plan:** No scope change. The picker still renders backend image URLs and avoids adding image-domain configuration.

## Issues Encountered

Repository-wide `npm run lint` is blocked by pre-existing unrelated lint errors outside Phase 18 files. Targeted ESLint for the Phase 18 frontend files passed.

## User Setup Required

None - no external service configuration required.

## Verification

- `cd FE/artium-web && npx eslint src/@shared/apis/auctionApis.ts src/@domains/auction/hooks/useSellerAuctionArtworkCandidates.ts src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx src/pages/artist/auctions/create.tsx` - passed
- `cd FE/artium-web && npm run lint` - failed due unrelated existing lint errors outside Phase 18 files

## Next Phase Readiness

Phase 19 can build terms configuration on top of the selected eligible artwork and the disabled terms affordance.

## Self-Check: PASSED

---
*Phase: 18-seller-auction-access-and-artwork-eligibility-policy*
*Completed: 2026-04-24*
