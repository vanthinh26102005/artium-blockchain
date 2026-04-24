# Phase 17-03 Summary: Wallet-Backed Bid Modal and Authoritative State Sync

## Result

Completed Wave 3. Bid submission now uses MetaMask on Sepolia, sends a real `bid(string)` transaction to the escrow contract, and treats the transaction hash as pending only. Confirmation now requires refreshed backend auction state to show the submitted wallet as the leading bidder.

## Tasks Completed

- Task 1: Added `auctionBidWallet` with MetaMask provider checks, Sepolia `0xaa36a7` enforcement, safe decimal ETH-to-wei conversion, minimal ABI calldata encoding for `bid(string)`, and `eth_sendTransaction`.
- Task 2: Refactored `BidEditingModal` to remove mock transaction hashes and timed mock outcomes, submit through `submitAuctionBid`, refresh auction state on open, and poll backend truth while pending.
- Task 3: Connected `LiveAuctionPage` to pass `refreshAuctionById` into the bid modal, using the same authoritative refresh path as realtime listing updates.
- Task 4: Updated pending/confirmed modal copy and Sepolia explorer links through `WALLET_TARGET_CHAIN.blockExplorerUrl`.

## Verification

- `cd FE/artium-web && npx tsc --noemit` passed.
- `cd FE/artium-web && npx eslint src/@domains/auction/components/BidEditingModal.tsx src/@domains/auction/components/PendingBidState.tsx src/@domains/auction/components/ConfirmedBidState.tsx src/@domains/auction/components/SubmittingBidState.tsx src/views/LiveAuctionPage.tsx src/@domains/auction/services/auctionBidWallet.ts src/@domains/auction/hooks/useAuctionLots.ts src/@domains/auction/hooks/useAuctionRealtime.ts src/@domains/auction/mappers/auctionLotMapper.ts src/@domains/auction/types.ts src/@shared/apis/auctionApis.ts` passed.
- `cd FE/artium-web && npm run lint` failed on pre-existing unrelated repository lint issues outside Phase 17 files, including `react/no-unescaped-entities`, `react-hooks/set-state-in-effect`, `@typescript-eslint/no-explicit-any`, and `@typescript-eslint/ban-ts-comment`.

## Commits

- `8e918556 feat(17-03): add wallet bid transaction service`
- `dcf428dd feat(17-03): refactor bid modal to wallet truth flow`
- `5220b950 feat(17-03): wire bid modal to auction refresh`
- `ff39ea7c feat(17-03): align bid modal copy with sepolia`

## Self-Check: PASSED

- `auctionBidWallet.ts` contains `eth_sendTransaction`, checks `0xaa36a7`, exports `submitAuctionBid`, and does not use `Number(value) * 1e18`.
- `BidEditingModal.tsx` no longer contains `getMockTransactionHash`, `getCompetingBid`, or `Cancel Transaction`.
- `BidEditingModal.tsx` imports `submitAuctionBid` and contains `Back to Auction` and `Close` actions.
- `PendingBidState.tsx` and `ConfirmedBidState.tsx` no longer contain `https://etherscan.io/tx`.
- `LiveAuctionPage.tsx` passes `onRefreshLot={refreshAuctionById}` to `BidEditingModal`.
