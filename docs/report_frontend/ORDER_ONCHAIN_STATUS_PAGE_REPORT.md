# Order On-Chain Status Page

## Scope

This branch wires the auction-to-order flow to real on-chain data. The frontend no longer uses demo query params, mock order records, or fake transaction timers for this workflow.

## E2E Flow

1. `/auction` loads published artworks that have a real `onChainAuctionId`.
2. The page reads each auction state from the configured `ArtAuctionEscrow` contract.
3. A buyer places a bid through MetaMask by calling `bid(orderId)` with real ETH value.
4. After the transaction is mined, the UI waits for the backend blockchain listener to index the emitted event.
5. The buyer can open `/orders/on-chain/:onChainOrderId`, which reads the protected order API.

## Required Runtime Config

- `NEXT_PUBLIC_AUCTION_ESCROW_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_ETH_RPC_URL` or `NEXT_PUBLIC_WEB3_RPC_URL`
- `NEXT_PUBLIC_WEB3_CHAIN_ID`
- `NEXT_PUBLIC_WEB3_CHAIN_NAME`
- Backend `CONTRACT_ADDRESS` and `BLOCKCHAIN_RPC_URL`

## Notes

- The order endpoint authorizes access by buyer/seller user id and by buyer/seller wallet address for blockchain-created orders.
- If an on-chain order has no order items yet, the status page falls back to the artwork with the matching `onChainAuctionId` for the artwork snapshot.
- Backend indexing remains asynchronous; the bid modal shows a pending indexing state after a transaction hash is available.
