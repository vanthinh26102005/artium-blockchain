---
phase: 20
plan: 03
subsystem: backend
tags: [seller-auctions, blockchain-events, public-auctions, artwork-projection, orders-service]
requires:
  - phase: 20
    provides: completed plan 01 start-attempt contract and plan 02 seller lifecycle UI
provides:
  - authoritative AuctionStarted promotion from persisted attempt into order and artwork projections
  - public auction query filtering to active authoritative rows only
  - converged auction item linkage for public auction cards
affects: [SAUC-08, phase-20-wave-2]
tech-stack:
  added: []
  patterns:
    - blockchain-event promotion into order plus order-item projection
    - authoritative artwork in-auction projection via artwork-service command
    - public active-auction filtering from converged rows only
key-files:
  created:
    - BE/apps/orders-service/src/application/event-handlers/BlockchainEventHandler.start.spec.ts
    - BE/apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.spec.ts
    - BE/apps/artwork-service/src/application/commands/artworks/MarkArtworkInAuction.command.ts
    - BE/apps/artwork-service/src/application/commands/artworks/handlers/MarkArtworkInAuction.command.handler.ts
    - BE/apps/artwork-service/src/application/commands/artworks/handlers/MarkArtworkInAuction.command.handler.spec.ts
    - .planning/phases/20-auction-start-orchestration-and-seller-lifecycle-status/20-03-SUMMARY.md
  modified:
    - BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts
    - BE/apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.ts
    - BE/apps/orders-service/src/application/queries/handlers/GetAuctionById.query.handler.ts
    - BE/apps/orders-service/src/app.module.ts
    - BE/apps/artwork-service/src/presentation/microservice/artworks.microservice.controller.ts
    - BE/apps/artwork-service/src/app.module.ts
    - BE/apps/artwork-service/src/application/index.ts
key-decisions:
  - "Promote seller auction starts by canonical attempt orderId during AuctionStarted instead of creating placeholder public rows first."
  - "Backfill order_items from the attempt snapshot so public auction cards render real artwork linkage."
  - "Restrict public auction reads to blockchain-backed active orders with converged on-chain and artwork identifiers."
patterns-established:
  - "Blockchain event delivery can be replayed safely when order-item creation and artwork projection updates are idempotent."
  - "Public auction reads must ignore rows that lack converged item linkage even if a blockchain order row exists."
requirements-completed: [SAUC-08]
completed: 2026-04-27
---

# Phase 20 Plan 03: Auction start orchestration and seller lifecycle status Summary

**Converged `AuctionStarted` into authoritative order, item, and artwork projections so public auction reads only expose active auctions with real artwork linkage.**

## Accomplishments

- Extended the orders blockchain event handler to promote persisted seller start attempts into active order projections and backfill order items from the attempt snapshot.
- Added the artwork-service `MarkArtworkInAuction` command and RPC entrypoint so authoritative activation updates artwork status and `onChainAuctionId` only after chain confirmation.
- Tightened public auction reads to active blockchain orders with converged item linkage, and blocked direct public auction detail access for non-active or incomplete rows.
- Added focused Jest coverage for the new start-promotion path, active-only public auction reads, and artwork in-auction projection updates.

## Validation

- `cd BE && npx jest apps/orders-service/src/application/event-handlers/BlockchainEventHandler.start.spec.ts apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.spec.ts apps/artwork-service/src/application/commands/artworks/handlers/MarkArtworkInAuction.command.handler.spec.ts --runInBand`
- `cd BE && yarn build:orders && yarn build:artwork`

## Next Phase Readiness

- Plan 04 can now consume authoritative active lifecycle state for seller inventory and seller order surfaces instead of inventing separate pending-state logic.
- Public `/auction` reads now wait for authoritative activation, so downstream seller/public surfaces can converge on the same active auction source of truth.
