# Live Auction Bid Modal

## Purpose

The bid modal submits real bids to the `ArtAuctionEscrow` contract through MetaMask. It no longer creates artificial transaction hashes, simulated failures, or timed confirmations.

## States

- `editing`: buyer reviews the current on-chain bid and enters an ETH amount.
- `submitting`: MetaMask request, transaction submission, and receipt wait are in progress.
- `pending`: a transaction hash exists and the UI is waiting for backend indexing.
- `confirmed`: backend order indexing succeeded and the buyer can open order status.
- `failed`: MetaMask, contract, receipt, or indexing failed with the returned error message.

## Requirements

- Buyer must be signed in before placing a bid because backend order polling is protected.
- MetaMask must be connected to the configured target chain.
- The auction lot must include a real `onChainAuctionId`.
- The bid amount must satisfy the contract minimum bid or increment.
