# Phase 8.3 Summary

## Outcome

Aligned recorded Ethereum payments with USD checkout semantics while preserving quoted ETH details in metadata.

## Changes

- Extended the Ethereum payment DTO contract with `quoteToken` and `chainId`.
- Updated `RecordEthereumPaymentHandler` to:
  - reject duplicate `txHash` values as before,
  - verify the signed quote token,
  - reject expired quotes,
  - reject non-Sepolia chain IDs,
  - reject currency / amount mismatches against the active quote.
- Recorded canonical `amount` / `currency` as USD in `payment_transactions`.
- Stored quoted ETH details in `metadata`, including `quoteId`, `ethAmount`, `weiHex`, `usdPerEth`, `chainId`, timestamps, and explorer URL.
- Updated the emitted `EthereumPaymentRecordedEvent` payload to carry the canonical USD values.

## Notes

- This keeps `PAY-02` and `PAY-03` consistent with the existing transaction schema instead of forcing ETH values into `decimal(12,2)` storage.
