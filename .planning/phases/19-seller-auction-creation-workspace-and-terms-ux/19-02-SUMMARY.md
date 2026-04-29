---
phase: 19-seller-auction-creation-workspace-and-terms-ux
plan: 02
subsystem: ui
tags: [nextjs, react, seller-auctions, forms, preview]
requires:
  - phase: 19-01
    provides: Seller auction terms types, validation helpers, and draft model
provides:
  - Seller auction terms form component
  - Seller auction preview component
  - Auction component barrel exports for Phase 19 integration
affects: [seller-auctions, frontend-auction, phase-19-terms-ux]
tech-stack:
  added: []
  patterns: [controlled props-driven form components, preview-only policy summary, no activation side effects]
key-files:
  created:
    - FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx
    - FE/artium-web/src/@domains/auction/components/SellerAuctionTermsPreview.tsx
  modified:
    - FE/artium-web/src/@domains/auction/components/index.ts
requirements-completed: [SAUC-04, SAUC-05, SAUC-06]
completed: 2026-04-27
---

# Phase 19 Plan 02: Terms Components Summary

**Reusable seller auction terms form and buyer-facing preview components with Phase 19 policy copy**

## Accomplishments

- Added a controlled `SellerAuctionTermsForm` with reserve policy, reserve price, minimum bid increment, duration presets/custom hours, disclosures, acknowledgement, inline errors, and action hooks.
- Added `SellerAuctionTermsPreview` with artwork card, timing summary, first-bid floor, reserve copy, Sepolia expectations, disclosures, and checklist status.
- Exported the new components from the auction component barrel for route integration.

## Files Created/Modified

- `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx` - Form UI, helper copy, inline error rendering, and action buttons.
- `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsPreview.tsx` - Live preview card and policy checklist.
- `FE/artium-web/src/@domains/auction/components/index.ts` - New component exports.

## Decisions Made

The form and preview remain presentation-only and callback-driven so they can be reused in Phase 20 without baking wallet, contract, or API behavior into Phase 19 components.

## Verification

- `cd FE/artium-web && npx eslint src/@domains/auction/components/SellerAuctionTermsForm.tsx src/@domains/auction/components/SellerAuctionTermsPreview.tsx src/@domains/auction/components/index.ts`
- `cd FE/artium-web && npx tsc --noEmit`

## Notes

Repository-wide `npm run lint` still fails due unrelated pre-existing frontend issues outside the Phase 19 auction files.

## Self-Check: PASSED

---
*Phase: 19-seller-auction-creation-workspace-and-terms-ux*
*Completed: 2026-04-27*
