---
phase: 20
plan: 02
subsystem: frontend
tags: [seller-auctions, auction-start, metamask, lifecycle-ui, pages-router]
requires:
  - phase: 20
    provides: completed plan 01 backend start-attempt contract
provides:
  - FE seller auction start transport and lifecycle hook
  - MetaMask createAuction wallet handoff with Sepolia enforcement
  - inline lifecycle shell and locked submitted snapshot on /artist/auctions/create
affects: [SAUC-06, SAUC-09, phase-20-wave-2]
tech-stack:
  added: []
  patterns:
    - backend-hydrated seller lifecycle state on refresh
    - wallet handoff through backend-provided calldata
    - inline status shell above locked form and snapshot rail
key-files:
  created:
    - FE/artium-web/src/@domains/auction/hooks/useSellerAuctionStart.ts
    - FE/artium-web/src/@domains/auction/services/auctionStartWallet.ts
    - FE/artium-web/src/@domains/auction/components/SellerAuctionStartStatusShell.tsx
    - .planning/phases/20-auction-start-orchestration-and-seller-lifecycle-status/20-02-SUMMARY.md
  modified:
    - FE/artium-web/src/@shared/apis/auctionApis.ts
    - FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx
    - FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx
    - FE/artium-web/src/@domains/auction/components/SellerAuctionTermsPreview.tsx
    - FE/artium-web/src/@domains/auction/components/index.ts
key-decisions:
  - "Keep lifecycle restoration keyed by remembered artwork ID plus authoritative backend status, not by frontend-only submit state."
  - "Drive wallet submission from backend-provided contractAddress+calldata so the FE never reconstructs seller auction calldata independently."
  - "Show failed/retry states inline beside the frozen submitted snapshot; only unlock terms when the seller explicitly returns to editing."
patterns-established:
  - "Seller create-auction pages restore pending state from backend status and keep unsafe controls locked while pending or active."
  - "MetaMask orchestration for seller auction start uses explicit inline errors instead of silent retries or modal-only feedback."
requirements-completed: [SAUC-06, SAUC-09]
completed: 2026-04-27
---

# Phase 20 Plan 02: Auction start orchestration and seller lifecycle status Summary

**Upgraded `/artist/auctions/create` from a local-only placeholder into a persisted seller auction start flow with backend hydration, MetaMask handoff, and an inline lifecycle shell.**

## Accomplishments

- Added FE auction API methods for start, retry, tx attach, and persisted seller start-status refresh.
- Added `useSellerAuctionStart` to restore lifecycle state on refresh using backend status plus remembered artwork context.
- Added `auctionStartWallet` to enforce MetaMask presence, Sepolia chain readiness, and `eth_sendTransaction` handoff from backend-provided calldata.
- Reworked the seller auction create page to render an inline status shell, freeze the submitted snapshot, and lock unsafe controls while pending or active.

## Validation

- `cd FE/artium-web && npx eslint src/@shared/apis/auctionApis.ts src/@domains/auction/hooks/useSellerAuctionStart.ts src/@domains/auction/services/auctionStartWallet.ts src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx src/@domains/auction/components/SellerAuctionTermsForm.tsx src/@domains/auction/components/SellerAuctionTermsPreview.tsx src/@domains/auction/components/SellerAuctionStartStatusShell.tsx`
- `cd FE/artium-web && npx tsc --noEmit`

## Next Phase Readiness

- Plan 03 can now converge backend blockchain events into authoritative active state without changing the seller-page orchestration contract.
- Plan 04 can reuse the same persisted seller lifecycle status vocabulary for inventory and order badges.
