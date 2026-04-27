---
status: complete
phase: 19-seller-auction-creation-workspace-and-terms-ux
source:
  - 19-01-SUMMARY.md
  - 19-02-SUMMARY.md
  - 19-03-SUMMARY.md
started: 2026-04-27T10:10:00+07:00
updated: 2026-04-27T10:23:59+07:00
---

## Current Test

[testing complete]

## Tests

### 1. Open seller auction workspace
expected: As a seller, opening `/artist/auctions/create` should show the seller auction workspace with the two-step rail, visible eligible and blocked artwork sections, and `Continue to auction terms` should stay disabled until you select an eligible artwork.
result: pass

### 2. Move from artwork selection into terms setup
expected: After selecting an eligible artwork and clicking `Continue to auction terms`, step 2 should open with a selected artwork summary, the auction terms form, and the live auction preview visible together.
result: pass

### 3. Validate terms and update preview
expected: Invalid terms should show `Review auction terms before continuing.` plus inline field errors, and valid values should update the preview with the first bid floor, reserve copy, timing, Sepolia messaging, and shipping/payment snippets.
result: pass

### 4. Save draft and return to artwork
expected: Clicking `Save Draft` should show `Draft saved on this device.`, and using `Back to artwork` or `Change artwork` then returning to the same artwork should preserve the terms you entered.
result: pass

### 5. Respect the Phase 20 start boundary
expected: With valid terms entered, clicking `Start Auction` should not trigger wallet confirmation, backend start calls, or an on-chain transaction request yet; Phase 19 should remain a local validation/handoff boundary.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
