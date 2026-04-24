# Phase 17-02 Summary: Frontend Auction Listing API Integration

## Result

Completed Wave 2. The `/auction` page now consumes backend auction DTOs, maps them into the existing auction card/modal render shape, and refreshes displayed lots from backend authority after realtime auction events.

## Tasks Completed

- Task 1: Added `auctionApis` with typed `getAuctions` and `getAuctionById` bindings for `/auctions`.
- Task 2: Added auction domain types, DTO-to-lot mapper, and `useAuctionLots` loading/error/refresh hook.
- Task 3: Added `useAuctionRealtime` using the `/auction` Socket.IO namespace with `joinAuction`, `leaveAuction`, `auctionStateChanged`, `auctionBidUpdated`, and `auctionExtended`.
- Task 4: Replaced `LiveAuctionPage` mock auction derivation with backend data while preserving filters, pagination, grid/list rendering, non-biddable CTA behavior, and bid modal opening rules.

## Verification

- `cd FE/artium-web && npx tsc --noemit` passed.
- `cd FE/artium-web && npx eslint src/views/LiveAuctionPage.tsx src/@domains/auction/hooks/useAuctionLots.ts src/@domains/auction/hooks/useAuctionRealtime.ts src/@domains/auction/mappers/auctionLotMapper.ts src/@domains/auction/types.ts src/@shared/apis/auctionApis.ts` passed.
- `cd FE/artium-web && npm run lint` failed on pre-existing unrelated repository lint issues outside the Phase 17 files, including `react/no-unescaped-entities`, `react-hooks/set-state-in-effect`, `@typescript-eslint/no-explicit-any`, and `@typescript-eslint/ban-ts-comment` violations.

## Commits

- `3b9351e9 feat(17-02): add frontend auction API contract`
- `e0027799 feat(17-02): map backend auction lots`
- `42fe344f feat(17-02): add auction realtime refresh hook`
- `f49ae59c feat(17-02): connect live auctions to backend`

## Self-Check: PASSED

- `LiveAuctionPage.tsx` no longer imports or references `mockArtworks`.
- `LiveAuctionPage.tsx` imports and uses `useAuctionLots`.
- Filter application paths still reset pagination to page 1.
- `isBidActionStatus` remains limited to `active` and `ending-soon`.
- Sync error copy includes `We could not sync the latest auction state.`
