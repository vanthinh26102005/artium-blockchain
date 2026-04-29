# Phase 20: Auction start orchestration and seller lifecycle status - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-29
**Phase:** 20-auction-start-orchestration-and-seller-lifecycle-status
**Areas discussed:** Start attempt idempotency, Wallet and backend handoff, Lifecycle states and recovery, Surface convergence

---

## Start attempt idempotency

| Question | Selected | Alternatives considered |
|----------|----------|-------------------------|
| Existing non-active attempt behavior | Reuse the canonical attempt | Create a new attempt only after seller edits terms; keep attempt history but expose one active attempt |
| Failed attempt term edits | Explicit `Back to terms`, then update same attempt snapshot | No edits after first submit; allow silent snapshot replacement before retry |
| Duplicate pending start request | Return existing pending attempt status | Reject with conflict; return pending only if payload matches exactly |
| Idempotency key | Authenticated seller ID + artwork ID | Client-provided idempotency key; seller ID + artwork ID + terms hash |

**Notes:** User selected the canonical seller+artwork model throughout. Retries update or return the same logical attempt and must not duplicate auctions.

---

## Wallet and backend handoff

| Question | Selected | Alternatives considered |
|----------|----------|-------------------------|
| Transaction construction | Backend returns contract address + calldata; FE asks MetaMask to send it | Frontend constructs calldata from ABI; backend signs/sends transaction |
| Missing wallet or wrong network | Stay in pending shell with explicit wallet/network action | Fail attempt immediately; block before backend attempt creation |
| Tx hash attachment timing | Attach immediately after MetaMask returns `eth_sendTransaction` hash | Attach only after `AuctionStarted`; attach only after FE confirms receipt |
| MetaMask rejection before tx hash | Move same attempt to retryable with wallet-rejected reason | Keep pending and ask again; delete/reset attempt |

**Notes:** Backend owns encoding/policy, seller wallet owns signing, and tx hash is pending evidence rather than final auction truth.

---

## Lifecycle states and recovery

| Question | Selected | Alternatives considered |
|----------|----------|-------------------------|
| Seller-facing states | Pending start, Auction active, Start failed, Retry available | Pending/Active/Failed only; fine-grained internal states |
| Reason-code model | Stable machine codes plus friendly seller copy | Friendly text only; raw technical error detail |
| Retryable failures | Recoverable wallet/network/timeout/duplicate-safe failures only | All failures retryable; only wallet rejection retryable |
| Post-activation seller actions | View-only plus explicitly safe actions | Allow edits until first bid; allow cancellation from seller workspace |
| Start confirmation pattern | Required confirmation checkbox before `Start Auction` enables | Confirmation dialog; checkbox plus dialog |

**Notes:** User clarified that sellers must confirm before starting any auction. This is captured as a deliberate override to the earlier UI-spec assumption that no destructive confirmation was required.

---

## Surface convergence

| Question | Selected | Alternatives considered |
|----------|----------|-------------------------|
| Public listing visibility | Only after authoritative backend/on-chain active convergence | Immediately after tx hash; optimistically after seller submits |
| Pending/failed/retryable visibility | Seller-only surfaces only | Seller-only plus admin/debug views; anywhere artwork appears |
| Inventory/order lifecycle source | Backend-provided canonical status/enrichment | FE local state first; public auction reads only |
| Create page after activation | Active success state with frozen snapshot, tx details, and safe navigation | Redirect immediately; reset the form |

**Notes:** Seller surfaces may show private lifecycle recovery state; public/profile/discovery reads must wait for active convergence and must not leak private retry/failure state.

---

## the agent's Discretion

- Exact DTO property names, enum names, copy wording, and layout details may follow existing codebase conventions if the locked semantics remain intact.

## Deferred Ideas

None.
