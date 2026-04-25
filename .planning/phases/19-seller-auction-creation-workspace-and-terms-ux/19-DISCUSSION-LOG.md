# Phase 19: Seller auction creation workspace and terms UX - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 19-seller-auction-creation-workspace-and-terms-ux
**Areas discussed:** Workspace flow, auction economics, timing model, preview disclosures, action and draft behavior

---

## Workspace Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Same-route two-step workspace | Keep `/artist/auctions/create`; select artwork first, then show terms form plus preview in the same seller workspace. | yes |
| Separate terms route | Navigate to a second route after artwork selection. | |
| Side-panel drawer | Keep artwork grid visible and open terms in a drawer. | |

**User's choice:** Approved the recommended same-route two-step workspace.
**Notes:** This extends the Phase 18 seller picker without duplicating quick-sell invoice UI.

---

## Auction Economics

| Option | Description | Selected |
|--------|-------------|----------|
| Reserve + minimum increment as contract-backed terms | Configure optional reserve price and required minimum bid increment; avoid a separate enforceable starting bid. | yes |
| Include starting bid as its own enforced field | Add a distinct starting bid field even though the current contract does not support it directly. | |
| Minimal terms only | Only collect required contract fields with little seller-facing policy explanation. | |

**User's choice:** Approved the recommended contract-aligned terms model.
**Notes:** The user asked what this meant. Clarification given: the contract has `reservePrice` and `minBidIncrement`, but no distinct `startingBid`; showing starting bid as a promise would be misleading unless backend/contract logic later enforces it.

---

## Timing Model

| Option | Description | Selected |
|--------|-------------|----------|
| Duration presets plus optional custom duration | Offer practical duration choices and compute end timing from activation. | yes |
| Scheduled future start | Let sellers choose a future start date/time. | |
| Raw duration input only | Require sellers to type the exact duration without presets. | |

**User's choice:** Approved duration presets with no scheduled future start.
**Notes:** The user asked what this meant. Clarification given: `createAuction` starts immediately, so scheduled start should not be shown until backend/contract support exists.

---

## Preview Disclosures

| Option | Description | Selected |
|--------|-------------|----------|
| Full buyer-facing preview and policy summary | Show artwork details, timing, reserve/increment behavior, fees if available, Sepolia/network expectations, activation lock, and shipping/payment disclosures. | yes |
| Minimal confirmation summary | Show only artwork title and configured numbers. | |
| Activation-only warning | Focus only on blockchain/network warning without buyer-facing preview. | |

**User's choice:** Approved full preview and policy summary.
**Notes:** Preview is a seller confidence and policy clarity step before Phase 20 start orchestration.

---

## Action And Draft Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Predictable local draft and gated start handoff | Preserve inputs on Back, allow local/session Save Draft, and keep Start Auction gated until Phase 20 can execute safely. | yes |
| Implement durable backend drafts now | Add backend draft persistence during Phase 19. | |
| Fake or partial start request | Let the start button call an incomplete backend/on-chain flow. | |

**User's choice:** Approved the recommended predictable local draft and gated start handoff.
**Notes:** Durable backend draft persistence and real start execution are deferred unless already available during implementation.

---

## the agent's Discretion

- Exact visual composition of the terms form and preview card.
- Exact validation helper organization.
- Exact local/session draft persistence mechanism.

## Deferred Ideas

- Backend/on-chain auction start orchestration belongs to Phase 20.
- Scheduled future starts need backend/contract support before being offered.
- Durable backend draft persistence is optional unless existing support is discovered.
