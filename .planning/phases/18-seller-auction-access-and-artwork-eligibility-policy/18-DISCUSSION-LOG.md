# Phase 18: Seller auction access and artwork eligibility policy - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24T17:36:54Z
**Phase:** 18-Seller auction access and artwork eligibility policy
**Areas discussed:** Access policy, Artwork eligibility, Eligibility response contract, Route and UX entry, Authorization source, Phase boundary

---

## Access Policy

| Option | Description | Selected |
|--------|-------------|----------|
| Seller role required | Require authenticated `UserRole.SELLER`; profile verification is guidance, not a hard blocker for page access. | yes |
| Verified seller required | Require seller profile plus admin verification before page access. | |
| Any authenticated owner | Allow any authenticated user with owned artwork to access. | |

**User's choice:** Approved recommended default.
**Notes:** This fits the existing role model and avoids turning verification into hidden scope for Phase 18.

---

## Artwork Eligibility

| Option | Description | Selected |
|--------|-------------|----------|
| Strict single-artwork eligibility | Owned by current seller, active, published, quantity 1, not sold/deleted/reserved/in auction, has primary image and display metadata, no existing on-chain auction ID. | yes |
| Loose eligibility | Allow draft/unpublished or incomplete artworks and defer validation to later phases. | |
| Frontend-only filtering | Let the UI filter obvious blockers and rely on start-auction failure later. | |

**User's choice:** Approved recommended default.
**Notes:** Strict backend policy prevents sellers from starting auctions that cannot be represented safely in inventory, order, or on-chain state.

---

## Eligibility Response Contract

| Option | Description | Selected |
|--------|-------------|----------|
| Eligible plus blocked reason codes | Return eligible and blocked seller artworks with reason codes and recovery hints. | yes |
| Eligible only | Return only selectable artworks and hide blocked items. | |
| Frontend computes reasons | Backend returns raw artworks and UI decides why items are blocked. | |

**User's choice:** Approved recommended default.
**Notes:** Backend reason codes keep business logic centralized and make the seller UI explainable.

---

## Route And UX Entry

| Option | Description | Selected |
|--------|-------------|----------|
| `/artist/auctions/create` | Put auction creation in the seller/artist workspace and link from Inventory when useful. | yes |
| `/inventory/auction/create` | Treat auction creation as an inventory subpage. | |
| `/auction/create` | Put seller creation beside public auction browsing. | |

**User's choice:** Approved recommended default.
**Notes:** The seller/artist workspace matches existing seller commercial routes such as artist invoices while still allowing Inventory entry points.

---

## Authorization Source

| Option | Description | Selected |
|--------|-------------|----------|
| Derive from JWT/current user | Backend scopes eligibility to authenticated seller identity and ignores client `sellerId`. | yes |
| Accept sellerId from client | Client sends sellerId and backend validates lightly. | |
| Reuse generic artwork list | Use existing artwork list filtering without an auction-specific policy endpoint. | |

**User's choice:** Approved recommended default.
**Notes:** This is the main security boundary for seller-only auction creation.

---

## Phase Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Access and eligibility only | Phase 18 stops at seller-only page access and candidate artwork policy. | yes |
| Include terms UX | Also build reserve price, duration, bid increment, and preview. | |
| Include auction start | Also submit transaction and manage lifecycle status. | |

**User's choice:** Approved recommended default.
**Notes:** Terms UX is Phase 19. Start orchestration and lifecycle status are Phase 20.

---

## the agent's Discretion

- Exact DTO names, reason-code enum names, and controller placement may be decided during planning.
- Response shape may be a mixed list with eligibility metadata or grouped `{ eligible, blocked }`, as long as stable reason codes and recovery hints are present.

## Deferred Ideas

- Auction terms form and preview belong to Phase 19.
- Auction start orchestration and seller lifecycle monitoring belong to Phase 20.
