# Phase 17 Verification

## Verdict

PASSED with one repository-level caveat: full frontend lint still fails on unrelated pre-existing files, while all Phase 17 touched frontend files pass targeted ESLint and typecheck.

## Goal Verification

- Backend auction read contract exists through API Gateway `GET /auctions` and `GET /auctions/:auctionId`, backed by orders-service CQRS read queries and shared auction DTOs.
- Backend realtime auction namespace exists at `/auction` with room join/leave handlers and auction state/bid/extension broadcast methods.
- Frontend `/auction` no longer derives live lots from `mockArtworks`; it uses `auctionApis`, `useAuctionLots`, `mapAuctionReadToLot`, and `useAuctionRealtime`.
- Bid submission no longer uses mock transaction hashes or timed mock outcomes; it uses MetaMask `eth_sendTransaction` on Sepolia and treats the returned tx hash as pending only.
- Confirmed bid UI is driven by refreshed backend auction state proving the submitted wallet is the highest bidder at or above the submitted bid amount.

## Automated Evidence

- `cd BE && yarn build:orders` passed.
- `cd BE && yarn build:gateway` passed.
- `cd BE && yarn test --runInBand` passed.
- `cd FE/artium-web && npx tsc --noemit` passed.
- `cd FE/artium-web && npx eslint src/@domains/auction/components/BidEditingModal.tsx src/@domains/auction/components/PendingBidState.tsx src/@domains/auction/components/ConfirmedBidState.tsx src/@domains/auction/components/SubmittingBidState.tsx src/views/LiveAuctionPage.tsx src/@domains/auction/services/auctionBidWallet.ts src/@domains/auction/hooks/useAuctionLots.ts src/@domains/auction/hooks/useAuctionRealtime.ts src/@domains/auction/mappers/auctionLotMapper.ts src/@domains/auction/types.ts src/@shared/apis/auctionApis.ts` passed.
- `cd FE/artium-web && npm run lint` failed on unrelated existing files outside Phase 17, with representative categories `react/no-unescaped-entities`, `react-hooks/set-state-in-effect`, `@typescript-eslint/no-explicit-any`, and `@typescript-eslint/ban-ts-comment`.

## Residual Risk

- Manual MetaMask/Sepolia UAT was not executed in this terminal session. The implementation is typechecked and wallet-call paths are wired, but a browser wallet test is still needed to validate deployed contract address, RPC/provider behavior, and backend indexer timing.
