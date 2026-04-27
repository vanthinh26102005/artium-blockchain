---
phase: 20
plan: 01
subsystem: backend
tags: [seller-auctions, orders-service, api-gateway, blockchain, cqrs]
requires:
  - phase: 20
    provides: approved research, validation, and execution plan set
provides:
  - seller auction start-attempt aggregate and repository in orders-service
  - authenticated gateway and microservice contracts for seller auction start, tx attachment, and persisted status
  - encoded createAuction wallet payload generation without backend signing
affects: [SAUC-07, SAUC-09, phase-20-wave-1]
tech-stack:
  added: []
  patterns:
    - gateway-side seller/artwork readiness aggregation
    - orders-service canonical start-attempt persistence
    - seller wallet calldata generation via escrow contract interface
key-files:
  created:
    - BE/libs/common/src/dtos/auctions/start-seller-auction.dto.ts
    - BE/libs/common/src/dtos/auctions/seller-auction-start-status.dto.ts
    - BE/apps/orders-service/src/domain/entities/auction-start-attempt.entity.ts
    - BE/apps/orders-service/src/domain/interfaces/auction-start-attempt.repository.interface.ts
    - BE/apps/orders-service/src/infrastructure/repositories/auction-start-attempt.repository.ts
    - BE/apps/orders-service/src/application/commands/StartSellerAuction.command.ts
    - BE/apps/orders-service/src/application/commands/AttachSellerAuctionStartTx.command.ts
    - BE/apps/orders-service/src/application/queries/GetSellerAuctionStartStatus.query.ts
    - BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.ts
    - BE/apps/orders-service/src/application/commands/handlers/AttachSellerAuctionStartTx.command.handler.ts
    - BE/apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.ts
    - BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.spec.ts
    - BE/apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts
    - .planning/phases/20-auction-start-orchestration-and-seller-lifecycle-status/20-01-SUMMARY.md
  modified:
    - BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts
    - BE/apps/orders-service/src/presentation/microservice/orders.microservice.controller.ts
    - BE/apps/orders-service/src/app.module.ts
    - BE/libs/blockchain/src/services/escrow-contract.service.ts
key-decisions:
  - "Keep seller/artwork/profile readiness aggregation in the gateway, where the repo already composes artwork and order eligibility."
  - "Persist one canonical seller+artwork start attempt in orders-service and reuse it for pending-state recovery."
  - "Generate createAuction calldata from the escrow contract interface, but never sign the transaction on the backend."
patterns-established:
  - "Persisted seller auction lifecycle state is separate from public auction read models."
  - "Gateway auth + preflight can feed a narrower orders-service command without introducing service-to-service clients into orders-service."
requirements-completed: [SAUC-07, SAUC-09]
completed: 2026-04-27
---

# Phase 20 Plan 01: Auction start orchestration and seller lifecycle status Summary

**Built the backend contract for seller auction start orchestration: durable start-attempt persistence, seller-only gateway routes, and wallet calldata generation that preserves on-chain seller ownership.**

## Accomplishments

- Added shared seller-auction start and persisted-status DTOs in `@app/common`.
- Added the `auction_start_attempts` aggregate, repository, command/query handlers, and microservice message patterns in orders-service.
- Extended the gateway auctions controller with seller-authenticated start, attach-tx, and status routes that reuse artwork eligibility and identity/profile checks.
- Added targeted Jest coverage for the new start command and seller start status query.

## Validation

- `cd BE && npx jest apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetArtworkOrderLocks.query.handler.spec.ts --runInBand`
- `cd BE && yarn build:orders && yarn build:gateway`

## Issues Encountered

- `gsd-sdk query state.begin-phase` misparsed named flags in this runtime, so `STATE.md` was corrected manually instead of trusting the generated phase marker.

## Next Phase Readiness

- Wave 2 can now replace the local-only seller submit flow with real backend start/status APIs and wallet handoff.
- Blockchain convergence and seller-surface lifecycle badges can build on the canonical `auction_start_attempts` state instead of inventing a second pending-state store.
