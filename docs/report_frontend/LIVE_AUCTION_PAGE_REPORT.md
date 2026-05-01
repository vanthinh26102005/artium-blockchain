# Live Auction Page

## Current Behavior

The live auction page now renders contract-backed auctions only. It fetches artworks from the artwork API with `hasOnChainAuctionId=true`, reads each auction directly from `ArtAuctionEscrow`, and derives status from the on-chain state and end time.

## Bid Flow

1. Buyer opens `/auction`.
2. Frontend reads the auction contract through the configured RPC URL.
3. Buyer submits a bid through MetaMask.
4. The bid modal waits for a real transaction hash and mined receipt.
5. After the backend listener indexes the event, the modal enables navigation to `/orders/on-chain/:onChainOrderId`.

## Data Rules

- No auction lots are loaded from mock artwork data.
- No fake transaction hash or artificial confirmation timer is used.
- Auction status is limited to `active`, `ending-soon`, and `closed`, derived from contract state.
- Category filtering is collapsed to all contract-backed works until real category metadata is available from the API.
