---
phase: 17
slug: auction-frontend-integration-with-blockchain-backed-backend
status: pending
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-24
updated: 2026-04-24
---

# Phase 17 - Validation Strategy

> Executable verification matrix for plans `17-01`, `17-02`, and `17-03`.

## Test Infrastructure

| Property | Value |
|----------|-------|
| Backend framework | NestJS + CQRS + RabbitMQ + Socket.IO |
| Frontend framework | Next.js + React + Socket.IO client |
| Backend quick command | `cd BE && yarn build:gateway && yarn build:orders` |
| Frontend quick command | `cd FE/artium-web && npx tsc --noemit` |
| Full suite command | `cd BE && yarn test --runInBand && cd ../FE/artium-web && npx tsc --noemit && npm run lint` |
| Manual dependency | MetaMask on Sepolia with escrow contract deployed/configured |

## Sampling Rate

- After backend DTO/query/controller changes: `cd BE && yarn build:gateway && yarn build:orders`
- After frontend API/page changes: `cd FE/artium-web && npx tsc --noemit`
- After wallet bid changes: `cd FE/artium-web && npx tsc --noemit && npm run lint`
- Before `/gsd-verify-work`: backend build, frontend typecheck, frontend lint, and manual MetaMask scenario evidence

## Per-Task Verification Map

| Task ID | Plan | Wave | Source | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|--------|------------|-----------------|-----------|-------------------|--------|
| 17-01-01 | 17-01 | 1 | D-01, D-02, D-05, D-06 | T-17-01 | Auction DTOs expose only presentation-safe auction/artwork fields and no private order data | build | `cd BE && yarn build:gateway && yarn build:orders` | pending |
| 17-01-02 | 17-01 | 1 | D-03, D-04, D-06 | T-17-02 | Realtime broadcasts carry refreshed auction snapshots, not client-submitted claims | build + focused test | `cd BE && yarn build:gateway && yarn build:orders && yarn test --runInBand` | pending |
| 17-02-01 | 17-02 | 2 | D-02, D-07, UI-SPEC | T-17-03 | Listing uses backend DTOs and keeps mock data out of production path | typecheck | `cd FE/artium-web && npx tsc --noemit` | pending |
| 17-02-02 | 17-02 | 2 | UI-SPEC | T-17-04 | Listing handles loading/error/empty states without leaking stale local bid truth | typecheck + lint | `cd FE/artium-web && npx tsc --noemit && npm run lint` | pending |
| 17-03-01 | 17-03 | 3 | D-03, D-04, UI-SPEC | T-17-05 | Wallet tx hash creates pending state only; confirmed state requires backend-authoritative refresh | typecheck | `cd FE/artium-web && npx tsc --noemit` | pending |
| 17-03-02 | 17-03 | 3 | D-04, UI-SPEC | T-17-06 | Stale minimum/competing-bid conflict updates minimum from backend before retry | typecheck + lint | `cd FE/artium-web && npx tsc --noemit && npm run lint` | pending |

## Manual Verification

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| MetaMask bid submission | Requires browser wallet | Open `/auction`, open an active lot, enter valid bid, approve MetaMask, and capture returned tx hash. |
| Pending truth separation | Requires wallet + backend sync | After tx hash, confirm modal says awaiting backend/on-chain synchronized confirmation and listing card is not permanently optimistic-updated before refresh. |
| Confirmed bid state | Requires event sync or polling | Confirm modal reaches confirmed only after `/auctions/:auctionId` returns current top bid matching submitted wallet/amount. |
| Conflict recovery | Requires competing bid or mocked backend state | Make refreshed DTO return a higher top bid; confirm failed/conflict state shows latest top bid, failed bid, updated minimum, and retry path. |
| Realtime fallback | Requires socket or polling | With modal open, confirm state refreshes through `/auction` socket event or short-interval polling plus window refocus. |

## Validation Sign-Off

- [ ] Backend auction endpoints build and return auction-first DTOs with embedded artwork fields.
- [ ] Frontend `/auction` no longer depends on `mockArtworks` for live auction lots.
- [ ] Bid modal no longer generates mock transaction hashes or mock competing-bid outcomes.
- [ ] Confirmed state is gated by backend/on-chain synchronized auction state.
- [ ] Manual MetaMask/Sepolia evidence is captured before phase completion.

