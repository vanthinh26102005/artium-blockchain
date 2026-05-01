# Smart Contracts

## Overview

Hardhat-based Ethereum smart contracts for art auction escrow and payments.

## Contracts

### ArtAuctionEscrow

Escrow contract for physical art auctions with dispute resolution.

**Key features:**
- Secure fund escrow during auction lifecycle
- Dispute resolution mechanism
- Seller/buyer protection

## Local Development

```bash
cd BE/smart-contracts
npm install
npx hardhat compile
npx hardhat node              # Local node
npx hardhat test              # Run tests
npx hardhat run scripts/deploy.js --network localhost
```

## Deployment

See `BE/smart-contracts/Local_deployment.md` for detailed deployment steps to Sepolia testnet.
