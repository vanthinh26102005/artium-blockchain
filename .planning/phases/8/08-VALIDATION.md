# Phase 8 Validation

## Implemented

- Backend Sepolia quote endpoint and signed quote-token generation.
- Frontend MetaMask quote lifecycle, Sepolia switching, and stale-state invalidation.
- Backend quote validation during Ethereum payment recording with USD canonical storage plus ETH metadata.

## Verification

- `cd FE/artium-web && npx tsc --noemit`
  - Passed.
- `cd BE && yarn build:gateway`
  - Passed.
- `cd BE && ./node_modules/.bin/nest build payments-service`
  - Passed.
- `cd BE && yarn test --runInBand apps/payments-service/src/application/queries/payments/handlers/GetEthereumQuote.query.handler.spec.ts apps/payments-service/src/infrastructure/services/ethereum-quote.service.spec.ts`
  - Passed. 5 tests across 2 suites.
- `cd FE/artium-web && npm run build`
  - Did not complete under the current restricted environment after entering the Next.js optimized production build stage. Earlier repo verification already showed an unrelated `next/font` network dependency in `src/views/LiveAuctionPage.tsx`, so full frontend production build remains a residual environment-specific verification gap.

## Residual Risk

- The full Next.js production build still needs one clean run in an environment where external font/network dependencies are either available or removed from the build path.
