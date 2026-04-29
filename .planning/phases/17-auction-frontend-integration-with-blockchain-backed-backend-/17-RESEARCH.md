# Phase 17: Auction Frontend Integration with Blockchain-Backed Backend Flow - Research

**Researched:** 2026-04-24
**Status:** Ready for planning

## Research Complete

Phase 17 should be implemented as a hybrid auction integration:

- Backend owns auction read truth through `api-gateway` endpoints backed by the existing orders/blockchain synchronization path.
- Frontend owns user-signed bid submission through MetaMask and the escrow contract.
- Frontend never treats local transaction submission as final auction truth. Listing cards and modal confirmation must come from refreshed backend/on-chain synchronized auction DTOs.

## Existing System Findings

### Backend capabilities already present

- `BE/smart-contracts/contracts/ArtAuctionEscrow.sol` defines the canonical auction state machine and bid rules.
- `BE/libs/blockchain/src/services/escrow-contract.service.ts` already reads `getAuction`, `getAuctionTimeline`, `pendingReturns`, and platform fee data.
- `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts` already maps auction events to RabbitMQ routing keys, including `NewBid`, `AuctionExtended`, `AuctionEnded`, and terminal events.
- `BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts` already syncs blockchain events into the `orders` table by `onChainOrderId`.
- `BE/apps/api-gateway/src/presentation/http/gateways/messaging.gateway.ts` proves Socket.IO gateway wiring already exists in `api-gateway`.

### Backend gaps for this phase

- There is no auction-specific HTTP read controller in `api-gateway`.
- There is no auction read DTO that embeds artwork display data.
- There is no auction list/detail query handler exposed by `orders-service`.
- There is no `/auction` namespace gateway that broadcasts auction state changes to connected clients.
- Current order rows can store on-chain auction state, but they do not currently expose a presentation-friendly auction lot contract.

### Frontend capabilities already present

- `FE/artium-web/src/views/LiveAuctionPage.tsx` already has the route shell, hero, filters, grid/list rendering, pagination, and modal entry rules.
- `FE/artium-web/src/@domains/auction/components/BidEditingModal.tsx` already models `editing`, `submitting`, `pending`, `confirmed`, and `failed`, but transitions are simulated.
- `FE/artium-web/src/@domains/auction/utils/auctionTime.ts` already contains the time-remaining display rules required by the UI contract.
- `FE/artium-web/src/@shared/services/apiClient.ts` and `FE/artium-web/src/@shared/apis/*.ts` establish the expected API module pattern.
- `FE/artium-web/src/@shared/services/websocketClient.ts` establishes a Socket.IO client pattern, but it is messaging-specific and should not be reused directly for auction semantics.

### Frontend gaps for this phase

- `/auction` derives lots from `mockArtworks`; it must instead consume auction-first DTOs.
- `BidEditingModal` creates mock transaction hashes and mock competing-bid outcomes; it must submit through MetaMask and wait for backend refresh/realtime truth.
- The modal currently uses `Cancel Transaction` in failed state, which conflicts with the UI-SPEC closing contract.
- Etherscan links point at `https://etherscan.io`; Sepolia phase context requires Sepolia explorer links.

## Recommended Architecture

### Backend read contract

Expose these `api-gateway` HTTP endpoints:

- `GET /auctions?status=&category=&minBidEth=&maxBidEth=&skip=&take=`
- `GET /auctions/:auctionId`

The response must be auction-first and presentation-friendly:

```ts
export type AuctionStatusKey = 'active' | 'ending-soon' | 'newly-listed' | 'paused' | 'closed'

export type AuctionArtworkDisplayDto = {
  artworkId: string
  title: string
  creatorName: string
  imageSrc: string
  imageAlt: string
  categoryKey: 'architectural' | 'sculpture' | 'digital' | 'installation'
}

export type AuctionReadDto = {
  auctionId: string
  onChainOrderId: string
  contractAddress: string | null
  statusKey: AuctionStatusKey
  statusLabel: string
  currentBidWei: string
  currentBidEth: number
  minimumNextBidWei: string
  minimumNextBidEth: number
  minBidIncrementWei: string
  endsAt: string
  serverTime: string
  highestBidder: string | null
  sellerWallet: string | null
  txHash: string | null
  artwork: AuctionArtworkDisplayDto
}
```

Use `EscrowContractService` for freshest on-chain values where an `onChainOrderId` exists. Use order rows as the off-chain synchronization/read-model backbone. Artwork display metadata should be composed server-side through the existing artwork service/RPC path or through existing order item/artwork fields if already present.

### Realtime contract

Expose a Socket.IO namespace `/auction` in `api-gateway`:

- Client emits `joinAuction` with `{ auctionId }`
- Client emits `leaveAuction` with `{ auctionId }`
- Server emits `auctionStateChanged` with `{ auctionId, snapshot, reason, txHash }`
- Server emits `auctionBidUpdated` with `{ auctionId, currentBidWei, currentBidEth, minimumNextBidWei, minimumNextBidEth, highestBidder, txHash }`
- Server emits `auctionExtended` with `{ auctionId, endsAt, txHash }`

If the event subscriber path is too large for this phase, the frontend fallback must poll while the modal is open and on window refocus. The plan should still create the gateway contract so the frontend can attach when available.

### Frontend integration contract

Create a dedicated frontend auction API/domain layer:

- `FE/artium-web/src/@shared/apis/auctionApis.ts`
- `FE/artium-web/src/@domains/auction/types.ts`
- `FE/artium-web/src/@domains/auction/mappers/auctionLotMapper.ts`
- `FE/artium-web/src/@domains/auction/hooks/useAuctionLots.ts`
- `FE/artium-web/src/@domains/auction/hooks/useAuctionRealtime.ts`
- `FE/artium-web/src/@domains/auction/services/auctionBidWallet.ts`

`LiveAuctionPage.tsx` should preserve existing layout and filter semantics while replacing the mock `lots` constant with fetched/polled auction DTOs.

`BidEditingModal.tsx` should accept callbacks/services instead of generating mock hashes internally:

- refresh lot state on open
- validate against latest `minimumNextBidEth`
- submit `bid(orderId)` through MetaMask using `eth_sendTransaction`
- move to `pending` after tx hash
- move to `confirmed` only after a refreshed backend DTO proves the submitted wallet is the authoritative top bidder at or above the committed amount
- move to conflict/failed when refreshed DTO shows a higher competing bid or stale minimum

## Validation Architecture

Phase 17 has backend, frontend, and manual wallet/realtime verification. Automated validation should use:

- `cd BE && yarn build:gateway`
- `cd BE && yarn build:orders`
- `cd BE && yarn test --runInBand`
- `cd FE/artium-web && npx tsc --noemit`
- `cd FE/artium-web && npm run lint`

Manual validation is required for:

- MetaMask bid submission on Sepolia with a real tx hash.
- Pending state persists until backend/on-chain synchronized DTO confirms the bid.
- Competing bid conflict uses latest backend minimum and does not optimistic-update cards permanently.
- Realtime or polling refresh updates listing cards while the modal is open.

## Planning Risks

- Existing roadmap has Phase 17 requirements set to `TBD`, so plans must trace to CONTEXT decisions D-01 through D-07 and UI-SPEC rather than formal REQ IDs.
- Backend artwork metadata composition may require crossing into artwork-service RPCs; keep the contract auction-first and hide composition behind query handlers/controllers.
- There are many pre-existing uncommitted frontend changes from Phase 16. Execution must read current files first and avoid reverting unrelated edits.

