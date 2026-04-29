---
phase: 19-seller-auction-creation-workspace-and-terms-ux
plan: 01
subsystem: ui
tags: [nextjs, react, seller-auctions, validation, local-storage]
requires:
  - phase: 18-03
    provides: Seller artwork picker route and candidate selection flow
provides:
  - Seller auction terms validation model
  - Contract-aligned duration presets and helpers
  - Artwork-scoped local draft persistence utilities
affects: [seller-auctions, frontend-auction, phase-19-terms-ux]
tech-stack:
  added: []
  patterns: [local form validation helpers, SSR-safe localStorage access, artwork-scoped draft keys]
key-files:
  created:
    - FE/artium-web/src/@domains/auction/validations/sellerAuctionTerms.schema.ts
    - FE/artium-web/src/@domains/auction/utils/sellerAuctionTermsDraft.ts
  modified:
    - FE/artium-web/src/@domains/auction/utils/index.ts
requirements-completed: [SAUC-04, SAUC-06]
completed: 2026-04-27
---

# Phase 19 Plan 01: Seller Auction Terms Model Summary

**Local seller auction terms validation and per-artwork draft storage for the Phase 19 workspace**

## Accomplishments

- Added a frontend-only seller auction terms contract with exact duration presets, default values, ETH validation helpers, and UI-SPEC-aligned error copy.
- Added SSR-safe local draft load/save/clear helpers keyed by artwork ID.
- Re-exported draft helpers from the auction utils barrel for workspace integration.

## Files Created/Modified

- `FE/artium-web/src/@domains/auction/validations/sellerAuctionTerms.schema.ts` - Terms types, defaults, duration presets, duration math, and validation messages.
- `FE/artium-web/src/@domains/auction/utils/sellerAuctionTermsDraft.ts` - Browser-local per-artwork draft helpers with runtime shape guards.
- `FE/artium-web/src/@domains/auction/utils/index.ts` - Draft helper exports.

## Decisions Made

Phase 19 keeps terms validation frontend-local and draft persistence explicitly device-scoped so the UI does not imply backend save or auction start behavior before Phase 20.

## Verification

- `cd FE/artium-web && npx eslint src/@domains/auction/validations/sellerAuctionTerms.schema.ts src/@domains/auction/utils/sellerAuctionTermsDraft.ts src/@domains/auction/utils/index.ts`
- `cd FE/artium-web && npx tsc --noEmit`

## Notes

Repository-wide `npm run lint` still fails due unrelated pre-existing frontend issues outside the Phase 19 auction files.

## Self-Check: PASSED

---
*Phase: 19-seller-auction-creation-workspace-and-terms-ux*
*Completed: 2026-04-27*
