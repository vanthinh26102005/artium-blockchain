---
phase: 17-auction-frontend-integration-with-blockchain-backed-backend
plan: 01
subsystem: api
tags: [nestjs, cqrs, socket.io, blockchain, auctions]
requires:
  - phase: 16
    provides: frontend form standardization prerequisite
provides:
  - Auction-first shared read DTOs
  - Orders-service auction list/detail query handlers
  - Public api-gateway auction read endpoints
  - Socket.IO `/auction` room contract
affects: [auction, api-gateway, orders-service, blockchain]
tech-stack:
  added: []
  patterns: [api-gateway RPC controller, CQRS query handler, Socket.IO namespace]
key-files:
  created:
    - BE/libs/common/src/dtos/auctions/auction-read.dto.ts
    - BE/libs/common/src/dtos/auctions/get-auctions.dto.ts
    - BE/apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.ts
    - BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts
    - BE/apps/api-gateway/src/presentation/http/gateways/auction.gateway.ts
  modified:
    - BE/libs/common/src/index.ts
    - BE/apps/orders-service/src/app.module.ts
    - BE/apps/orders-service/src/presentation/microservice/orders.microservice.controller.ts
    - BE/apps/api-gateway/src/app.module.ts
key-decisions:
  - "Auction reads use existing orders-service plus blockchain library instead of a new microservice."
  - "Socket contract exists now; event subscriber wiring can be completed behind the gateway without changing frontend event names."
patterns-established:
  - "Auction DTOs embed artwork display fields under `artwork` so frontend does not stitch artwork data separately."
  - "Backend falls back to synchronized order state when live contract reads are unavailable."
requirements-completed: []
duration: 31min
completed: 2026-04-24
---

# Phase 17: Backend Auction Read Contract Summary

**Auction-first backend read and realtime contract through api-gateway, orders-service CQRS, and Socket.IO `/auction` rooms**

## Performance

- **Duration:** 31 min
- **Started:** 2026-04-24T13:14:42Z
- **Completed:** 2026-04-24T13:45:00Z
- **Tasks:** 4
- **Files modified:** 15

## Accomplishments

- Added shared auction DTOs with status/category enums, embedded artwork display fields, current bid/minimum next bid, and server-time countdown support.
- Added orders-service CQRS handlers for auction list/detail reads, using `EscrowContractService.getAuction` when possible and order-state fallback otherwise.
- Added public `GET /auctions` and `GET /auctions/:auctionId` gateway endpoints.
- Added `/auction` Socket.IO namespace with `joinAuction`, `leaveAuction`, `auctionStateChanged`, `auctionBidUpdated`, and `auctionExtended` contract.

## Task Commits

1. **Task 1: Define shared auction read DTOs and query inputs** - `e1660210`
2. **Task 2: Add orders-service auction list and detail queries** - `6c6da94c`
3. **Task 3: Expose auction HTTP endpoints through api-gateway** - `da24d5cf`
4. **Task 4: Add auction Socket.IO namespace contract** - `bcd33ab0`

## Files Created/Modified

- `BE/libs/common/src/dtos/auctions/auction-read.dto.ts` - Auction read, artwork display, and paginated response DTOs.
- `BE/libs/common/src/dtos/auctions/get-auctions.dto.ts` - Auction list filter DTO.
- `BE/apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.ts` - Maps blockchain order state into auction DTOs.
- `BE/apps/orders-service/src/application/queries/handlers/GetAuctionById.query.handler.ts` - Detail lookup by auction/on-chain ID.
- `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts` - Public auction HTTP surface.
- `BE/apps/api-gateway/src/presentation/http/gateways/auction.gateway.ts` - Auction socket room and broadcast contract.

## Decisions Made

- Kept auction reads in `orders-service` because the existing blockchain listener already syncs auction state into orders by `onChainOrderId`.
- Used `AuctionReadObject.artwork` to embed display metadata and preserve D-02’s no-client-stitching requirement.
- Capped auction page size at 50 in the query handler to reduce accidental public list load.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `roadmap.update-plan-progress` did not find the Phase 17 checkbox because the roadmap uses custom plan labels. Progress was left for manual roadmap patching by the orchestrator.

## User Setup Required

None - no external service configuration required for the backend contract. Runtime contract reads still require existing blockchain environment variables to be configured.

## Verification

- `cd BE && yarn build:orders` passed.
- `cd BE && yarn build:gateway` passed.
- `cd BE && yarn test --runInBand` passed: 2 suites, 5 tests.

## Next Phase Readiness

Frontend work can now type against `/auctions` and `/auctions/:auctionId`, and can attach to `/auction` socket rooms while keeping polling as fallback.

## Self-Check: PASSED

- Summary exists.
- Key created files exist on disk.
- Plan task commits exist in git history.
- Plan-level verification commands passed.

---
*Phase: 17-auction-frontend-integration-with-blockchain-backed-backend*
*Completed: 2026-04-24*
