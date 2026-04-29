# Phase 8.2 Summary

## Outcome

Reworked the checkout MetaMask flow around live quotes, Sepolia enforcement, and stale state invalidation.

## Changes

- Added `paymentApis.getEthereumQuote()` and the shared `EthereumQuoteResponse` type.
- Replaced raw `ethAmount` props with quote-driven wallet props in `BuyerCheckoutPaymentForm`.
- Updated `BuyerCheckoutPageView` to fetch wallet quotes for the current USD total, refresh quotes on demand, expire them in real time, and block checkout when the quote is missing or stale.
- Rebuilt `WalletPaymentSection` to:
  - show live quote / quote error / quote expiry states,
  - enforce Sepolia-only sends,
  - attempt `wallet_switchEthereumChain` first and `wallet_addEthereumChain` second,
  - listen for `accountsChanged` and `chainChanged`,
  - clear transaction state when the account, chain, or quote changes,
  - send the exact backend-issued `weiHex` value.

## Notes

- MetaMask checkout now communicates explicitly that the transfer is on Sepolia testnet.
- Old tx hashes no longer remain valid after quote refreshes or wallet state changes.
