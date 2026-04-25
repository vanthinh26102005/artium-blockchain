---
phase: 19
slug: seller-auction-creation-workspace-and-terms-ux
status: complete
created: 2026-04-25
---

# Phase 19 Research - Seller Auction Creation Workspace and Terms UX

## Research Complete

Phase 19 should be implemented as a frontend-only seller terms workspace layered on the existing Phase 18 seller artwork picker. The safest approach is to add local form state, validation, draft persistence, and preview components without introducing a backend start API or pretending auction activation already exists.

The main product risk is economic misrepresentation. `ArtAuctionEscrow.createAuction(orderId, duration, reservePrice, minBidIncrement, ipfsHash)` has no `startingBid` parameter and starts immediately when called. Phase 19 therefore needs contract-aligned copy: the UI can satisfy the roadmap's "starting bid" intent by explaining that `Minimum bid increment` is the current first-bid floor, but it must not add a separate enforceable starting bid promise.

## Source Inputs

- `.planning/phases/19-seller-auction-creation-workspace-and-terms-ux/19-CONTEXT.md`
- `.planning/phases/19-seller-auction-creation-workspace-and-terms-ux/19-UI-SPEC.md`
- `.planning/REQUIREMENTS.md` - SAUC-04, SAUC-05, SAUC-06
- `.planning/ROADMAP.md` - Phase 19 success criteria
- `BE/smart-contracts/contracts/ArtAuctionEscrow.sol` - contract field constraints
- `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx` - Phase 18 route view to extend

## Locked Decisions From Context

- Keep `/artist/auctions/create`; do not add a separate terms route.
- Use a two-step workspace: artwork selection first, then terms form plus live preview.
- Include optional reserve price, required minimum bid increment, required duration, and required shipping/payment disclosures.
- Do not add a separately enforceable `startingBid` field in Phase 19.
- Do not add scheduled future start controls.
- `Save Draft` may be local/session scoped and must not claim backend persistence.
- `Start Auction` must not call a fake or partial backend/on-chain flow.

## Codebase Findings

### Current Seller Auction Page

- `SellerAuctionArtworkPickerPage.tsx` already owns `selectedArtworkId` and renders seller-only, loading, eligible, blocked, no-artworks, no-eligible, and backend-error states.
- The current disabled `Continue to auction terms` button is the correct integration point for moving into Phase 19 terms setup.
- The current page uses local `Button`, `lucide-react`, `Image`, `useAuthStore`, and `useSellerAuctionArtworkCandidates`.

### Form and Validation Patterns

- The app already uses `zod` and `react-hook-form`, but Phase 19 can be implemented with either react-hook-form or plain controlled state. A small local schema/validator is recommended because the terms payload is not yet submitted to an API in this phase.
- `QuickSellInvoiceForm.tsx` provides useful local form presentation patterns for labels, inline error text, textareas, and suffix controls, but quick-sell invoice behavior and copy should not be reused.
- `BidEditingModal.tsx` has ETH input filtering precedent, but it limits decimals to 2 for bidding. Phase 19 should not copy that precision cap because Phase 20 may need Wei-safe conversion.

### Existing UI Components

- Available local primitives include `Button`, `Input`, `Textarea`, `Select`, `RadioGroup`, and `Checkbox` under `FE/artium-web/src/@shared/components/ui`.
- `BaseInputField` and `BaseTextareaField` exist under `@shared/components/forms` and can reduce label/error boilerplate if the executor chooses react-hook-form.
- The UI spec requires Phase 18 visual continuity: white/off-white surfaces, `#191414` text, `#2351FC` accent, rounded cards, inline errors, and no third-party UI blocks.

### Contract and Backend Boundary

- The smart contract starts an auction immediately on `createAuction`.
- The smart contract accepts `duration`, `reservePrice`, and `minBidIncrement`; it does not accept future start time or `startingBid`.
- Phase 20 owns idempotent backend/on-chain start orchestration, wallet/network lifecycle feedback, and authoritative persistence.
- Phase 19 should produce a validated local terms draft that Phase 20 can later convert into an API payload.

## Recommended Implementation Architecture

1. Add a seller auction terms model and validator under `@domains/auction` that is independent from backend start orchestration.
2. Add local/session draft helpers keyed by selected artwork ID so `Back`, `Change artwork`, and refresh recovery behave predictably without claiming server persistence.
3. Add `SellerAuctionTermsForm` and `SellerAuctionTermsPreview` components that implement the UI-SPEC field/copy/preview contracts.
4. Integrate the terms step into `SellerAuctionArtworkPickerPage` with `artwork -> terms` step state, selected artwork summary, updated policy cards, enabled continue action, local draft save, and gated start handoff.

## Validation Architecture

### Automated Validation

- Frontend lint should run after each plan: `cd FE/artium-web && npm run lint`.
- Frontend TypeScript check should run before phase completion: `cd FE/artium-web && npx tsc --noEmit`.
- Static grep checks should verify that Phase 19 does not introduce `createAuction`, `submitAuction`, `scheduledStart`, or a separately enforceable `startingBid` field in the seller creation view.
- Static grep checks should verify that `Minimum bid increment`, `No reserve`, `Set reserve price`, `Draft saved on this device.`, and `Auction start connects to wallet and backend orchestration in the next step.` are present.

### Manual Validation

- Visit `/artist/auctions/create` as a seller with eligible artwork, select artwork, and confirm `Continue to auction terms` enters the terms step.
- Confirm `Back to artwork` preserves typed term values.
- Confirm `Save Draft` shows `Draft saved on this device.` and does not claim backend persistence.
- Confirm invalid terms show inline errors and block `Start Auction`.
- Confirm the preview updates for reserve/no-reserve, duration, increment, Sepolia, and shipping/payment disclosures.
- Confirm no network request is made when pressing the Phase 19 start/handoff control.

## Planning Risks

- If the executor implements a real start request in Phase 19, it will violate the Phase 20 boundary and create unsafe partial activation behavior.
- If the executor adds a `startingBid` field as if it is contract-backed, seller and buyer economics become misleading.
- If draft copy says "saved" without "on this device" or equivalent local wording, users may infer backend persistence that does not exist.
- If the terms form is embedded into the current grid without step separation, mobile UX will become crowded and error-prone.

