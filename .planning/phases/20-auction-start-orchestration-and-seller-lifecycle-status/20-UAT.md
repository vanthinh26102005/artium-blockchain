---
status: testing
phase: 20-auction-start-orchestration-and-seller-lifecycle-status
source:
  - 20-01-SUMMARY.md
  - 20-02-SUMMARY.md
  - 20-03-SUMMARY.md
  - 20-04-SUMMARY.md
started: 2026-04-27T08:35:00Z
updated: 2026-04-27T08:35:00Z
---

## Current Test

number: 1
name: Start auction from seller workspace
expected: |
  On `/artist/auctions/create`, after you choose an eligible artwork, enter valid terms, and start the auction, the page should stay inline and show the seller lifecycle shell with wallet or pending guidance. The submitted terms snapshot should freeze, unsafe edits should stay locked, and you should not see a second independent submit path while the start attempt is in progress.
awaiting: user response

## Tests

### 1. Start auction from seller workspace
expected: On `/artist/auctions/create`, after you choose an eligible artwork, enter valid terms, and start the auction, the page should stay inline and show the seller lifecycle shell with wallet or pending guidance. The submitted terms snapshot should freeze, unsafe edits should stay locked, and you should not see a second independent submit path while the start attempt is in progress.
result: [pending]

### 2. Refresh restores the same seller auction attempt
expected: If you refresh the seller create-auction page during a pending or retryable attempt, the page should restore the same artwork and submitted terms snapshot from backend state. Inputs should remain locked while pending, and retry should stay bound to the same logical attempt instead of creating a duplicate.
result: [pending]

### 3. Public auction visibility waits for authoritative activation
expected: A seller auction should not appear on the public `/auction` surface while it is only pending or retryable. Once backend and blockchain state converge to active, it should appear publicly with authoritative artwork linkage.
result: [pending]

### 4. Seller inventory and seller orders show authoritative lifecycle state
expected: Seller inventory cards and seller order cards should show lifecycle badges and guidance that match the current backend truth (for example pending, retry available, failed, or auction active) instead of optimistic local state.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

[none yet]
