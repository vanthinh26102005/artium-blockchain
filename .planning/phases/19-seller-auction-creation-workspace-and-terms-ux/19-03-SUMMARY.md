---
phase: 19-seller-auction-creation-workspace-and-terms-ux
plan: 03
subsystem: ui
tags: [nextjs, react, seller-auctions, workspace, route]
requires:
  - phase: 19-01
    provides: Terms schema and local draft utilities
  - phase: 19-02
    provides: Terms form and preview components
provides:
  - Two-step seller auction creation workspace on `/artist/auctions/create`
  - Route metadata updated for seller auction creation
  - Validation-gated local start handoff without activation side effects
affects: [seller-auctions, frontend-auction, phase-19-terms-ux, create-auction-route]
tech-stack:
  added: []
  patterns: [protected seller route, two-step workspace, local draft reuse, no fake activation]
key-files:
  modified:
    - FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx
    - FE/artium-web/src/pages/artist/auctions/create.tsx
requirements-completed: [SAUC-04, SAUC-05, SAUC-06]
completed: 2026-04-27
---

# Phase 19 Plan 03: Seller Auction Workspace Integration Summary

**`/artist/auctions/create` now moves from eligible artwork selection into local terms setup and live preview**

## Accomplishments

- Converted the Phase 18 picker page into a two-step seller workspace with progress rail, selected artwork summary, terms form, preview panel, and `Change artwork` / `Back to artwork` flow.
- Wired per-artwork draft loading/saving and preserved in-memory terms when moving back to the artwork step.
- Updated the route metadata to `Create Seller Auction | Artium` and kept Phase 20 activation boundaries intact by validating only and avoiding wallet/backend start calls.

## Files Created/Modified

- `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx` - Two-step workflow, selected artwork handoff, draft save message, and integration of the new terms components.
- `FE/artium-web/src/pages/artist/auctions/create.tsx` - Updated route title while preserving `useRequireAuth`, dynamic import, and `SidebarLayout`.

## Decisions Made

Copilot execution followed the execute-phase inline path, so Phase 19 was completed sequentially in one workspace while preserving the planned wave order: schema/drafts first, components second, route integration last.

## Verification

- `cd FE/artium-web && npx eslint src/@domains/auction/validations/sellerAuctionTerms.schema.ts src/@domains/auction/utils/sellerAuctionTermsDraft.ts src/@domains/auction/utils/index.ts src/@domains/auction/components/SellerAuctionTermsForm.tsx src/@domains/auction/components/SellerAuctionTermsPreview.tsx src/@domains/auction/components/index.ts src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx src/pages/artist/auctions/create.tsx`
- `cd FE/artium-web && npx tsc --noEmit`
- Static boundary check for `createAuction|submitAuction|eth_sendTransaction|scheduledStart|startingBid` in the new Phase 19 auction files returned no matches.
- `cd FE/artium-web && npm run lint` still fails due unrelated pre-existing frontend lint issues outside the Phase 19 auction files.

## Self-Check: PASSED

---
*Phase: 19-seller-auction-creation-workspace-and-terms-ux*
*Completed: 2026-04-27*
