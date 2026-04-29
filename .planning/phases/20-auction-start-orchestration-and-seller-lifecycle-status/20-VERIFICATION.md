---
phase: 20
slug: auction-start-orchestration-and-seller-lifecycle-status
status: passed
verified_at: 2026-04-29T09:05:11Z
requirements: [SAUC-06, SAUC-07, SAUC-08, SAUC-09]
automated_checks:
  total: 3
  passed: 3
  failed: 0
human_verification:
  total: 4
  passed: 4
  failed: 0
security:
  status: verified
  threats_open: 0
nyquist:
  compliant: true
---

# Phase 20 Verification: Auction Start Orchestration and Seller Lifecycle Status

## Verdict

Status: passed

Phase 20 achieved its goal: sellers can start auctions through an idempotent backend/on-chain lifecycle, unsafe economics are locked after activation, seller-only pending/failed/retry state is available across seller surfaces, and public auction reads wait for authoritative active convergence.

## Requirement Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SAUC-06 | 20-02, 20-04 | Sellers cannot edit unsafe auction economics after activation; only safe lifecycle actions remain available by state. | passed | `SellerAuctionArtworkPickerPage.tsx` locks artwork changes, draft save, back navigation, and terms form while lifecycle is pending/active/retry/failure unless backend `editAllowed` is true; `SellerAuctionTermsForm.tsx` requires the economics lock checkbox before start. UAT tests 1, 2, and 4 passed. |
| SAUC-07 | 20-01 | Backend can start an auction idempotently only after validating seller identity, ownership, eligibility, wallet/profile readiness, and contract/network configuration. | passed | Gateway seller start route uses seller auth/role guards, derives seller ID from JWT, reuses artwork eligibility checks, requires lock acknowledgement and wallet readiness, and orders-service reuses canonical seller+artwork attempts. Jest coverage in `StartSellerAuction.command.handler.spec.ts` passed. |
| SAUC-08 | 20-03, 20-04 | Backend persists auction start across on-chain/off-chain state so public auctions and seller surfaces reflect authoritative state without mock data. | passed | `BlockchainEventHandler.start.spec.ts`, `GetAuctions.query.handler.spec.ts`, `MarkArtworkInAuction.command.handler.spec.ts`, and `ListArtworks.query.handler.spec.ts` passed. Public reads require `AUCTION_ACTIVE` plus `onChainOrderId`; seller lifecycle enrichment is opt-in and seller-scoped. UAT test 3 passed. |
| SAUC-09 | 20-01, 20-02, 20-04 | Sellers can monitor pending, active, failed, and retryable start status with tx hash, reason codes, and recovery paths that do not duplicate auctions. | passed | `GetSellerAuctionStartStatus.query.handler.spec.ts` passed, UAT tests 1, 2, and 4 passed, and code review fix `d999d5b2` prevents tx-attached pending attempts from returning duplicate wallet calldata. |

## Must-Have Verification

| Must-have | Status | Evidence |
|-----------|--------|----------|
| Seller start is authenticated and seller-scoped | passed | Gateway routes for candidates, start, attach-tx, and status require `JwtAuthGuard`, `RolesGuard`, and `UserRole.SELLER`; command/query payloads include authenticated `sellerId`. |
| Start attempts are canonical and retry-safe | passed | Orders-service looks up latest seller+artwork attempt, reuses pending/active attempts, and retries by updating the same attempt/order ID. |
| Wallet handoff is not treated as final activation | passed | Attach-tx stores tx hash and clears wallet action; `AuctionStarted` event handling performs authoritative active promotion. |
| Public auction reads hide pending/failed/retry states | passed | Public list/detail handlers require active blockchain-backed order state with converged item linkage. |
| Seller lifecycle state is visible only on seller-owned surfaces | passed | Artwork lifecycle enrichment requires `includeSellerAuctionLifecycle` with seller ID, and seller inventory/order presentation consumes backend lifecycle DTOs. |
| Confirmation checkbox gates irreversible activation | passed | `economicsLockedAcknowledged` is required by FE validation and rejected by the gateway if false. |

## Automated Checks

```bash
cd BE && npx jest apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts apps/orders-service/src/application/event-handlers/BlockchainEventHandler.start.spec.ts apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/MarkArtworkInAuction.command.handler.spec.ts apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.spec.ts --runInBand
```

Result: passed, 6 suites, 14 tests.

```bash
cd FE/artium-web && npx tsc --noEmit
```

Result: passed.

```bash
gsd-sdk query verify.schema-drift 20
```

Result: `drift_detected: false`.

## Human Verification

Manual UAT passed in `20-UAT.md`:

| Test | Requirement(s) | Result |
|------|----------------|--------|
| Start auction from seller workspace | SAUC-06, SAUC-09 | passed |
| Refresh restores the same seller auction attempt | SAUC-06, SAUC-09 | passed |
| Public auction visibility waits for authoritative activation | SAUC-08 | passed |
| Seller inventory and seller orders show authoritative lifecycle state | SAUC-06, SAUC-08, SAUC-09 | passed |

## Security and Review Gates

| Gate | Status | Evidence |
|------|--------|----------|
| Security | passed | `20-SECURITY.md` has `status: verified` and `threats_open: 0`. |
| Nyquist validation | passed | `20-VALIDATION.md` has `nyquist_compliant: true`, `wave_0_complete: true`, and all task rows green. |
| Code review | passed | `20-REVIEW.md` has `status: clean`; one warning found during review was fixed in `d999d5b2`. |

## Gaps

None.

## Notes

- FE unit/e2e tests were not added because this workspace has no committed FE test runner; FE coverage for this phase is TypeScript/static checks plus manual wallet/browser UAT.
- Unrelated dirty worktree files outside Phase 20 were left untouched.
