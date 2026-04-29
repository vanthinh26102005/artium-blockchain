# Phase 17: Auction frontend integration with blockchain-backed backend flow and live auction state sync - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 17-auction-frontend-integration-with-blockchain-backed-backend-
**Areas discussed:** Auction data source and read API

---

## Auction data source and read API

| Option | Description | Selected |
|--------|-------------|----------|
| Current `/auction` listing only | Keep backend read scope narrow and defer future detail read contracts | |
| Include single-auction detail contract now | Establish listing + future detail read shape now, even if current UI remains listing-focused | ✓ |

**User's choice:** Include the single-auction detail read contract now.

**Notes:**
- User approved embedding artwork display fields directly in auction DTOs instead of requiring FE-side merge logic.
- User asked whether FE could connect directly to blockchain and skip FE ↔ BE integration.
- Final direction locked: hybrid model.
- FE submits the user's bid directly through wallet/contract.
- Backend remains the read and synchronized-state layer for listing/detail/live state.
- FE must not treat local wallet submission as final auction truth.
- Dedicated auction read model/endpoints were chosen over a thin wrapper on existing orders/blockchain data.
- Clarification locked: this is not a new standalone auction microservice.
- Final scope choice for this area: ship the current `/auction` listing and real bid modal integration in Phase 17, while creating the detail read contract now for later UI work.

## the agent's Discretion

- Exact DTO field naming and internal query composition
- Whether the auction-focused query layer is implemented mainly in `api-gateway` composition logic or delegated to an existing backend query surface

## Deferred Ideas

- Full single-auction detail page UI
- Full auction room / bid history feed UI
- Seller auction management
- Watchlists and reminder flows
- Dedicated dispute or arbiter UI
