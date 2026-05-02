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
cd contracts
npm install
npx hardhat compile
npx hardhat node              # Local node
npx hardhat test              # Run tests
npx hardhat run scripts/deploy.ts --network localhost
```

## Deployment

See `contracts/README.md` and the deployment scripts in `contracts/scripts/` for contract details and deployment entry points.
