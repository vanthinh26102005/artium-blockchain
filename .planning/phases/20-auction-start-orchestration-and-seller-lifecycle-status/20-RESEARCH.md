# Phase 20: Auction start orchestration and seller lifecycle status - Research

**Researched:** 2026-04-27  
**Domain:** seller auction start orchestration across Next.js FE, NestJS microservices, and `ArtAuctionEscrow` smart contract  
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SAUC-06 | Sellers cannot edit unsafe auction economics after activation; only explicitly safe lifecycle actions remain available according to auction state. | UI state lock model, seller lifecycle state machine, FE file hook points, and safe-action gating recommendations below. [VERIFIED: codebase grep] |
| SAUC-07 | Backend can start an auction idempotently only after validating seller identity, artwork ownership, artwork eligibility, seller wallet/profile readiness, and contract/network configuration. | Backend/service-boundary map, signer-ownership risk, idempotency model, validation checklist, and proposed command/query seams below. [VERIFIED: codebase grep] |
| SAUC-08 | Backend can persist the auction start across on-chain and off-chain state so public `GET /auctions` and seller inventory/order views reflect the new auction without mock data. | Source-of-truth mapping, order/artwork persistence gaps, read-model convergence requirements, and public/seller projection risks below. [VERIFIED: codebase grep] |
| SAUC-09 | Sellers can monitor auction start status across pending, active, failed, and retryable states with tx hash, reason codes, and recovery paths that do not duplicate auctions. | Approved UI lifecycle contract, persistence requirement for seller-only status, retry-safe flow, and FE/BE file changes below. [VERIFIED: codebase grep] |
</phase_requirements>

## Summary

The current seller flow stops entirely in frontend local state: `handleStartAttempt()` only sets `hasSubmittedTerms` and reruns local validation in `SellerAuctionArtworkPickerPage.tsx:314-317`, `SellerAuctionTermsForm.tsx:399-400` still says wallet/backend orchestration is “the next phase,” `auctionApis.ts:106-123` exposes only GET calls, and `auctions.controller.ts:92-160` exposes only GET routes. [VERIFIED: codebase grep]

The critical design constraint is signer ownership: `EscrowContractService.createAuction()` signs with `PLATFORM_PRIVATE_KEY` in `escrow-contract.service.ts:29-33,75-92`, but `ArtAuctionEscrow.createAuction()` stores `seller = msg.sender` in `ArtAuctionEscrow.sol:136-166` and later gates `endAuction`, `cancelAuction`, `markShipped`, and `claimDeliveryTimeout` with `onlySeller(orderId)` in `ArtAuctionEscrow.sol:95-98,210-215,235-238,251-254,341-345`. A backend-signed Phase 20 start would make the platform wallet the on-chain seller and break downstream seller lifecycle actions. [VERIFIED: codebase grep]

The planning-safe shape is: backend preflight + idempotent pending attempt persistence + seller wallet-signed `createAuction` + blockchain-listener/outbox convergence into orders/artwork read models + seller-only lifecycle status query. That preserves contract semantics, avoids duplicate auctions, and matches the approved UI shell for pending/active/failed/retryable states. [VERIFIED: codebase grep][ASSUMED]

**Primary recommendation:** Use an orders-service-owned auction-start orchestration aggregate for preflight/idempotency, but require the seller’s MetaMask wallet to sign `createAuction`; do **not** call `EscrowContractService.createAuction()` for seller activation. [VERIFIED: codebase grep][ASSUMED]

## Project Constraints (from copilot-instructions.md)

- None — `./copilot-instructions.md` is absent in the repo root. [VERIFIED: codebase grep]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Seller authentication and seller-role authorization | API / Backend | Browser / Client | Gateway already enforces `JwtAuthGuard` and `RolesGuard` for seller candidate access in `auctions.controller.ts:107-139`; FE seller checks are present but not authoritative. [VERIFIED: codebase grep] |
| Artwork ownership and auction eligibility validation | Artwork service | API / Backend | Artwork-service already owns seller-owned candidate and reason-code logic in `ListSellerAuctionArtworkCandidates.query.handler.ts:95-189`; Phase 20 should reuse that policy instead of duplicating it elsewhere. [VERIFIED: codebase grep] |
| Seller wallet/profile readiness validation | Identity service | API / Backend | Canonical wallet field lives on `users.walletAddress` in `user.entity.ts:48-55`, while seller-profile readiness data lives in `seller_profiles.entity.ts:135-156`; backend must combine both before allowing start. [VERIFIED: codebase grep] |
| Idempotent start orchestration and seller lifecycle status | Orders service | API / Backend | Orders-service already owns auction read APIs, blockchain module access, and blockchain event consumers in `orders-service/src/app.module.ts:93-123`; it is the closest existing owner for orchestration state. [VERIFIED: codebase grep][ASSUMED] |
| Wallet confirmation and tx submission | Browser / Client | API / Backend | Approved UI-SPEC requires inline pending state with wallet action, and existing wallet flows use MetaMask `eth_requestAccounts`, `wallet_switchEthereumChain`, and `eth_sendTransaction` from FE hooks/services. [VERIFIED: codebase grep][CITED: https://docs.metamask.io/wallet/how-to/access-accounts/][CITED: https://docs.metamask.io/wallet/how-to/send-transactions/] |
| On-chain auction truth | Smart contract / Blockchain | Orders service | `ArtAuctionEscrow.sol` is authoritative for `AuctionStarted` and later lifecycle states, while orders-service reads on-chain state via `EscrowContractService.getAuction()` and listens to chain events through `BlockchainEventListenerService`. [VERIFIED: codebase grep] |
| Public auction listing projection | Orders service | Browser / Client | Public `GET /auctions` is gateway -> orders-service via `auctions.controller.ts:92-105` and `GetAuctions.query.handler.ts:41-82`; FE public listing already consumes that API through `useAuctionLots.ts:25-45`. [VERIFIED: codebase grep] |
| Seller inventory lifecycle badges | Artwork service | Browser / Client | Seller inventory currently reads artwork-service directly through `artworkApis.listArtworksPaginated()` in `InventoryPage.tsx:177-219`, so inventory badges need artwork DTO enrichment or a merged seller-specific read. [VERIFIED: codebase grep] |
| Seller order-view lifecycle badges | Orders service | Browser / Client | Seller orders already read orders-service via `OrdersController.getOrders()` with `scope=seller` in `orders.controller.ts:84-99`; order workspace can show auction lifecycle only if orders are linked to `order_items`. [VERIFIED: codebase grep] |

## Current architecture and source-of-truth mapping

| Surface | Current source of truth | Evidence | Phase 20 implication |
|--------|--------------------------|----------|----------------------|
| Seller create-auction page `/artist/auctions/create` | FE local state + localStorage draft | `SellerAuctionArtworkPickerPage.tsx:237-320` and `sellerAuctionTermsDraft.ts:32-70` keep selection, terms, validation, and draft persistence on the client only. [VERIFIED: codebase grep] | Phase 20 must replace local-only start with server-backed attempt state while preserving local validation as the first gate. [VERIFIED: codebase grep][ASSUMED] |
| Seller artwork eligibility | Artwork-service candidate query + order-lock merge in gateway | `AuctionsController.getSellerArtworkCandidates()` calls artwork-service then orders-service lock merge in `auctions.controller.ts:107-139`; artwork-service reason-code policy is in `ListSellerAuctionArtworkCandidates.query.handler.ts:143-183`. [VERIFIED: codebase grep] | Reuse this as preflight policy; do not reimplement eligibility in FE or new service code. [VERIFIED: codebase grep] |
| Public auction listing | Orders-service `get_auctions` query, optionally enriched by on-chain read | `GetAuctions.query.handler.ts:48-82,140-225` loads blockchain-payment orders and enriches each from `EscrowContractService.getAuction()`. [VERIFIED: codebase grep] | Pending/failed seller-only start attempts must not enter this projection. [VERIFIED: codebase grep] |
| On-chain auction state | Smart contract + blockchain listener/outbox | `ArtAuctionEscrow.sol:136-166`, `blockchain-event-listener.service.ts:572-657`, and `outbox.service.ts:15-66`. [VERIFIED: codebase grep] | Phase 20 should converge off-chain state from chain events, not from FE optimism. [VERIFIED: codebase grep] |
| Seller order workspace | Orders-service rows joined to `order_items` | Seller scope uses `findBySellerIdViaItems()` with an inner join in `order.repository.ts:169-210`; FE consumes it in `OrdersPageView.tsx:58-111`. [VERIFIED: codebase grep] | Auction-start rows without `order_items` will not appear for sellers. [VERIFIED: codebase grep] |
| Seller inventory workspace | Artwork-service artwork DTOs | FE loads inventory from `artworkApis.listArtworksPaginated()` and maps only title/status/thumbnail in `InventoryPage.tsx:177-219` and `inventoryApiMapper.ts:38-50`. [VERIFIED: codebase grep] | Inventory cannot show pending/failed/active auction badges until artwork DTOs expose lifecycle fields and FE maps them. [VERIFIED: codebase grep] |
| Seller wallet identity | Identity user record | Canonical wallet address is on `users.walletAddress` in `user.entity.ts:48-55` and FE auth payload in `@shared/types/auth.ts:8-28`. [VERIFIED: codebase grep] | Backend should validate connected wallet against authenticated user wallet readiness. [VERIFIED: codebase grep][ASSUMED] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@nestjs/cqrs` | repo `11.0.3`; npm latest `11.0.3` modified `2025-03-24` | command/query handlers for orchestration and lifecycle reads | Orders-service already uses CQRS in `app.module.ts:11,55-73`, so Phase 20 should add command/query handlers rather than controller-heavy logic. [VERIFIED: codebase grep][VERIFIED: npm registry] |
| `typeorm` | repo `0.3.27` | repository-backed persistence and unique-constraint enforcement | Orders/artwork services already use repository pattern and TypeORM entities/repos for auctions, orders, and artworks. [VERIFIED: codebase grep] |
| `ethers` (backend) | repo `6.4.0`; npm latest `6.16.0` modified `2025-12-03` | smart-contract reads and existing backend write helper | Blockchain module already binds contract and provider with ethers in `blockchain.module.ts:43-80` and `escrow-contract.service.ts:1-93`. [VERIFIED: codebase grep][VERIFIED: npm registry] |
| `next` Pages Router | FE repo `16.1.1`; npm latest `16.2.4` modified `2026-04-18` | seller route and FE page integration | Seller workspace already ships through `src/pages/artist/auctions/create.tsx:1-32`; Phase 20 should extend this page, not create a new route. [VERIFIED: codebase grep][VERIFIED: npm registry] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `socket.io-client` | FE repo/npm `4.8.3` modified `2025-12-23` | public auction room realtime refresh | Keep using it for public bid/auction updates; seller start status can stay HTTP/polling unless live chain updates are explicitly needed. [VERIFIED: codebase grep][VERIFIED: npm registry][ASSUMED] |
| Existing MetaMask EIP-1193 request pattern | official wallet methods | wallet connect, chain switch, tx send | Reuse FE patterns already present in `useWalletLogin.ts` and `auctionBidWallet.ts` for `eth_requestAccounts`, `wallet_switchEthereumChain`, and `eth_sendTransaction`. [VERIFIED: codebase grep][CITED: https://docs.metamask.io/wallet/how-to/access-accounts/][CITED: https://docs.metamask.io/wallet/how-to/send-transactions/] |
| `OutboxModule` + `BlockchainEventListenerService` | repo local libs | durable blockchain-event propagation | Use existing outbox + processed-event dedup for authoritative convergence; do not add a second event-delivery path. [VERIFIED: codebase grep] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Backend-signed `EscrowContractService.createAuction()` | Seller wallet-signed `createAuction` from FE | Seller wallet signing preserves `msg.sender` == seller and keeps later `onlySeller` contract actions valid; backend signing fails that contract invariant. [VERIFIED: codebase grep] |
| Reusing `orders` rows for pending/failed seller-only starts | Dedicated `auction_start_attempts` aggregate plus final order/artwork projection | Separate attempt state avoids leaking pending starts into public `GET /auctions` and avoids forcing shipping-centric order UI to represent pre-bid seller-only states. [VERIFIED: codebase grep][ASSUMED] |

**Installation:** No new backend dependency is strictly required for the core plan because NestJS CQRS, TypeORM, ethers, and the blockchain/outbox libs already exist in-repo. [VERIFIED: codebase grep]  
**Optional FE dependency:** add `ethers` to `FE/artium-web` only if the planner chooses ABI-safe FE calldata encoding instead of low-level manual encoding. [ASSUMED]

## Existing code paths for seller auction creation today

| Step | Current code path | What it does now | Where Phase 20 must hook |
|------|-------------------|------------------|---------------------------|
| Seller enters route | `src/pages/artist/auctions/create.tsx:15-30` | Auth-gated page renders the seller workspace inside `SidebarLayout`. [VERIFIED: codebase grep] | Keep this route as the only seller entry point. [VERIFIED: codebase grep] |
| Seller role gate | `SellerAuctionArtworkPickerPage.tsx:538-547` | FE checks `user.roles` and shows `SellerProfileRequired` if not seller. [VERIFIED: codebase grep] | Keep FE hint, but backend start endpoint must still enforce seller auth. [VERIFIED: codebase grep] |
| Artwork candidate load | `useSellerAuctionArtworkCandidates.ts:25-50` -> `auctionApis.getSellerArtworkCandidates()` -> `AuctionsController.getSellerArtworkCandidates()` | Loads seller-owned eligible/blocked artworks from gateway/artwork/orders services. [VERIFIED: codebase grep] | Reuse candidate/lock policy during backend preflight. [VERIFIED: codebase grep] |
| Continue to terms | `SellerAuctionArtworkPickerPage.tsx:281-299` | Loads local draft for selected artwork and moves to terms step. [VERIFIED: codebase grep] | Preserve this transition unchanged. [VERIFIED: codebase grep] |
| Draft save | `SellerAuctionArtworkPickerPage.tsx:305-312` and `sellerAuctionTermsDraft.ts:53-70` | Saves terms snapshot to localStorage only. [VERIFIED: codebase grep] | Draft can remain local; submission state cannot. [VERIFIED: codebase grep] |
| Start Auction click | `SellerAuctionArtworkPickerPage.tsx:314-317` | Only sets `hasSubmittedTerms` and revalidates local form state. [VERIFIED: codebase grep] | Replace with backend preflight submit + seller wallet orchestration + persisted status restore. [VERIFIED: codebase grep][ASSUMED] |
| Terms helper copy | `SellerAuctionTermsForm.tsx:391-401` | Explicitly says orchestration happens in the next phase. [VERIFIED: codebase grep] | Replace helper with lifecycle status shell per approved UI-SPEC. [VERIFIED: codebase grep] |
| Preview rail | `SellerAuctionTermsPreview.tsx:71-177` | Renders frozen auction summary and static policy copy. [VERIFIED: codebase grep] | Reuse as submitted snapshot rail for pending/failed/retryable/active states. [VERIFIED: codebase grep] |

## Backend/service boundaries, validations, idempotency, persistence, and read-model convergence

### System Architecture Diagram

```text
Seller FE (/artist/auctions/create)
  -> local terms validation
  -> POST /auctions/seller/start
API Gateway
  -> Orders-service StartAuctionCommand
Orders-service
  -> validate seller/auth payload
  -> query Artwork-service eligibility/ownership
  -> query Identity-service seller wallet/profile readiness
  -> validate contract/network config
  -> create or reuse pending start attempt (canonical orderId / artworkId)
  -> return attempt + contract payload to FE
Seller FE
  -> MetaMask account/network check
  -> eth_sendTransaction(createAuction(canonical orderId, ...))
  -> PATCH /auctions/seller/start/:attemptId/tx
Smart Contract
  -> emits AuctionStarted(orderId, seller, endTime)
BlockchainEventListenerService
  -> Outbox
  -> RabbitMQ blockchain event
Orders-service event handler
  -> mark attempt active
  -> create/update authoritative auction/order projection
  -> trigger artwork status/onChainAuctionId update
Read models
  -> GET /auctions (public active only)
  -> seller inventory badges
  -> seller order/status views
```

Current components in this flow already exist except the seller start POST/PATCH/status endpoints, the orchestration aggregate, and the seller-specific lifecycle projection. [VERIFIED: codebase grep][ASSUMED]

### Required validations before any on-chain start

| Validation | Current authority | Evidence | Planning note |
|-----------|-------------------|----------|---------------|
| Authenticated seller identity | API gateway auth context | Seller candidate endpoint requires `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.SELLER)` in `auctions.controller.ts:107-117`. [VERIFIED: codebase grep] | New start endpoint should enforce the same guards. [VERIFIED: codebase grep] |
| Artwork ownership | Artwork-service seller filter | Candidate query loads `findManyBySellerId(query.sellerId)` in `ListSellerAuctionArtworkCandidates.query.handler.ts:95-99`. [VERIFIED: codebase grep] | Start command should never trust FE artwork ownership claims. [VERIFIED: codebase grep] |
| Artwork eligibility | Artwork-service + order-lock merge | Reason codes include `IN_AUCTION`, `HAS_ON_CHAIN_AUCTION`, `MISSING_PRIMARY_IMAGE`, `MISSING_METADATA`, etc. in `ListSellerAuctionArtworkCandidates.query.handler.ts:143-183`; gateway adds `ACTIVE_ORDER_LOCK` in `auctions.controller.ts:43-89`. [VERIFIED: codebase grep] | Reuse the same policy for start preflight. [VERIFIED: codebase grep] |
| Seller wallet readiness | Identity user payload | Canonical wallet field is `users.walletAddress` in `user.entity.ts:48-55`, surfaced to FE auth payload in `@shared/types/auth.ts:8-28`. [VERIFIED: codebase grep] | Backend should require a stored wallet address and match the connected MetaMask account before accepting tx attach/retry. [VERIFIED: codebase grep][ASSUMED] |
| Seller profile readiness | Identity seller profile | Seller profile has `isActive`, `isVerified`, `stripeOnboardingComplete`, and `paypalOnboardingComplete` in `seller_profiles.entity.ts:135-156`. [VERIFIED: codebase grep] | Only `isActive`/existence are clearly phase-relevant from current repo evidence; using `isVerified` or payment onboarding as blockers is not proven by current milestone docs. [VERIFIED: codebase grep][ASSUMED] |
| Contract/network config readiness | Blockchain module config | Orders-service blockchain module requires `BLOCKCHAIN_RPC_URL`, `CONTRACT_ADDRESS`, and `PLATFORM_PRIVATE_KEY` in `blockchain.module.ts:31-80`. FE wallet flows already target Sepolia in `wallet.ts:11-24` and `auctionBidWallet.ts:115-118`. [VERIFIED: codebase grep] | Start preflight should fail fast if contract address/RPC config is absent or network is not Sepolia. [VERIFIED: codebase grep][ASSUMED] |

### Idempotency constraints that matter

| Constraint | Why it exists | Evidence | Required plan behavior |
|-----------|----------------|----------|------------------------|
| Same artwork must not create multiple auctions | Contract `orderId` is the uniqueness key; a new `orderId` would allow a second auction even if FE retries the same artwork. [VERIFIED: codebase grep] | `ArtAuctionEscrow` only rejects duplicate `orderId` with `AuctionAlreadyExists(orderId)` in `ArtAuctionEscrow.sol:34-35,143-145`. [VERIFIED: codebase grep] | Backend must allocate one canonical order/attempt ID per seller+artwork start attempt and reuse it across retries. [VERIFIED: codebase grep][ASSUMED] |
| Same blockchain event must not apply twice | Blockchain listener runs with backfill/live retry semantics. [VERIFIED: codebase grep] | `BlockchainProcessedEvent` dedup is enforced in `blockchain-event-listener.service.ts:599-657`. [VERIFIED: codebase grep] | Reuse existing listener/outbox path for convergence. [VERIFIED: codebase grep] |
| Same tx hash must not be recorded twice | Existing payment flows use repo lookup + DB uniqueness. [VERIFIED: codebase grep] | `RecordEthereumPayment.command.handler.ts:41-46` conflicts on duplicate `txHash`, and `payment-transaction.entity.ts:195-203` has `unique: true`. [VERIFIED: codebase grep] | Phase 20 should apply the same tx-hash idempotency pattern to seller start tx persistence. [VERIFIED: codebase grep][ASSUMED] |
| FE reload must not re-enable unsafe resubmission | UI-SPEC requires persisted pending state across refresh/navigation. [VERIFIED: codebase grep] | `20-UI-SPEC.md:171-193` requires restored pending state and retry-safe recovery. [VERIFIED: codebase grep] | Pending/retryable/failed state must be stored server-side, not only in React state. [VERIFIED: codebase grep] |

### Persistence touchpoints and convergence gaps

| Touchpoint | Current state | Gap | Recommendation |
|-----------|---------------|-----|----------------|
| `orders` table | Stores blockchain fields (`onChainOrderId`, `contractAddress`, `escrowState`, `txHash`, `sellerWallet`, `bidAmountWei`) in `orders.entity.ts:159-189`. [VERIFIED: codebase grep] | Current `AuctionStarted` event handler creates blank blockchain orders with no `order_items` or artwork snapshot in `blockchain-event.handler.ts:47-77`. [VERIFIED: codebase grep] | Pre-link artwork context before or during start convergence so seller/public reads have artwork/title/image. [VERIFIED: codebase grep][ASSUMED] |
| `order_items` table | Seller order workspace depends on `order_items.seller_id` joins in `order.repository.ts:169-210`. [VERIFIED: codebase grep] | `BlockchainEventHandler.handleAuctionStarted()` never creates order items. [VERIFIED: codebase grep] | Either create order items at start time or build a separate seller start-status read model. [VERIFIED: codebase grep][ASSUMED] |
| `artworks` table | Has `ipfsMetadataHash`, `reservePrice`, `minBidIncrement`, `auctionDuration`, and `onChainAuctionId` in `artworks.entity.ts:117-131`. [VERIFIED: codebase grep] | No current start flow writes those fields after seller terms submission. [VERIFIED: codebase grep] | Phase 20 should persist authoritative auction linkage and lock artwork to `IN_AUCTION` only after active convergence. [VERIFIED: codebase grep][ASSUMED] |
| Public `GET /auctions` projection | Loads all blockchain payment orders in `GetAuctions.query.handler.ts:48-58`. [VERIFIED: codebase grep] | If pending start attempts are stored as blockchain orders too early, public list can leak them because the query does not filter “active only.” [VERIFIED: codebase grep] | Keep pending attempts out of public query or explicitly filter by active/start-success state. [VERIFIED: codebase grep][ASSUMED] |
| Seller inventory FE mapper | `InventoryArtwork` currently maps only title/status/thumbnail in `inventoryApiMapper.ts:38-50`. [VERIFIED: codebase grep] | No lifecycle badge fields are available to render pending/retryable/active auction state. [VERIFIED: codebase grep] | Extend artwork DTO + FE mapper with seller-auction lifecycle fields. [VERIFIED: codebase grep][ASSUMED] |
| Seller orders FE presentation | Current labels/actions know `auction_active` but not pending/failed start states in `orderPresentation.ts:16-40,160-224` and `OrderActionPanel.tsx:117-130`. [VERIFIED: codebase grep] | Existing order UI is shipping-centric and has no seller-start retry/failure UX. [VERIFIED: codebase grep] | Add seller-auction lifecycle badge/presentation model before exposing pending/retryable states in order views. [VERIFIED: codebase grep][ASSUMED] |

## UI state model implied by current code + approved UI-SPEC

### Current FE state model

| State | Current implementation | Evidence | Limitation |
|------|------------------------|----------|------------|
| `artwork` step | choose eligible artwork | `SellerAuctionArtworkPickerPage.tsx:241-299,456-531`. [VERIFIED: codebase grep] | No persisted submission state. [VERIFIED: codebase grep] |
| `terms` step | edit terms, save local draft, validate locally | `SellerAuctionTermsForm.tsx:33-405` and `SellerAuctionArtworkPickerPage.tsx:429-451`. [VERIFIED: codebase grep] | Inputs are always editable because `isStartDisabled={false}` and no server lifecycle exists. [VERIFIED: codebase grep] |
| `preview` rail | buyer-facing summary + static policy copy | `SellerAuctionTermsPreview.tsx:71-177`. [VERIFIED: codebase grep] | No tx hash, reason code, or pending/failed state shell. [VERIFIED: codebase grep] |
| `draftSaved` flash | local green message | `SellerAuctionArtworkPickerPage.tsx:442-444`. [VERIFIED: codebase grep] | Device-local only. [VERIFIED: codebase grep] |

### Required Phase 20 lifecycle model

| State | Required contents | Allowed actions | Backing source |
|------|-------------------|-----------------|----------------|
| `pending_start` | frozen terms snapshot, progress copy, last-updated time, tx hash placeholder/row, wallet prompt row when needed | no second submit; optional “Open MetaMask”/“View transaction” only | Approved in `20-UI-SPEC.md:162-193`. [VERIFIED: codebase grep] |
| `active` | success summary, tx hash, auction reference, immutable-economics reminder | `View Auction`, `View transaction`, `Copy transaction hash`, `Back to inventory` | Approved in `20-UI-SPEC.md:164-169`. [VERIFIED: codebase grep] |
| `failed` | failure summary, reason code, last attempted time, tx hash if any, guidance | `Back to terms` only when edits are required | Approved in `20-UI-SPEC.md:168-191`. [VERIFIED: codebase grep] |
| `retry_available` | same failed data plus explicit retry-safe note and preserved snapshot | `Retry Start Auction` primary; `Back to terms` secondary when needed | Approved in `20-UI-SPEC.md:169-191`. [VERIFIED: codebase grep] |

### FE file hook points

| File | Phase 20 change |
|------|-----------------|
| `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx` | Replace `handleStartAttempt()` local-only submit with orchestration flow, lock form during pending/active, restore persisted lifecycle on mount, and keep preview rail visible. [VERIFIED: codebase grep][ASSUMED] |
| `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx` | Add read-only/locked mode for artwork/economics inputs and action buttons based on lifecycle state; remove next-phase helper copy. [VERIFIED: codebase grep][ASSUMED] |
| `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsPreview.tsx` | Keep as immutable snapshot; inject tx/status metadata rail above or alongside it. [VERIFIED: codebase grep][ASSUMED] |
| `FE/artium-web/src/@shared/apis/auctionApis.ts` | Add seller start POST/PATCH/GET lifecycle APIs and lifecycle DTO types. [VERIFIED: codebase grep][ASSUMED] |
| `FE/artium-web/src/@shared/apis/artworkApis.ts` + `inventoryApiMapper.ts` | Add seller-auction lifecycle fields needed for inventory badges. [VERIFIED: codebase grep][ASSUMED] |
| `FE/artium-web/src/@domains/orders/utils/orderPresentation.ts` and related components | Add seller start badge/label mapping if order views must display pending/retryable/failed states. [VERIFIED: codebase grep][ASSUMED] |

## Architecture Patterns

### Recommended Project Structure

```text
BE/apps/api-gateway/src/presentation/http/controllers/
  auctions.controller.ts                         # add seller start/status routes

BE/apps/orders-service/src/application/
  commands/auctions/start-auction/               # new start command + handler [ASSUMED]
  commands/auctions/attach-start-tx/             # new tx attach/update handler [ASSUMED]
  queries/auctions/get-seller-start-status/      # seller lifecycle query [ASSUMED]
  event-handlers/blockchain-event.handler.ts     # enrich AuctionStarted convergence

BE/apps/orders-service/src/domain/
  entities/auction-start-attempt.entity.ts       # dedicated pending/failed/retryable state [ASSUMED]
  interfaces/auction-start-attempt.repository.interface.ts [ASSUMED]

BE/apps/orders-service/src/infrastructure/
  repositories/auction-start-attempt.repository.ts [ASSUMED]

BE/libs/common/src/dtos/auctions/
  start-auction.dto.ts                           # POST payload [ASSUMED]
  auction-start-status.dto.ts                    # seller lifecycle read DTO [ASSUMED]

BE/apps/artwork-service/src/presentation/microservice/
  artworks.microservice.controller.ts            # add update/read RPC for auction projection [ASSUMED]

BE/apps/identity-service/src/presentation/microservice/
  identity readiness query route/handler         # seller wallet/profile readiness RPC [ASSUMED]

FE/artium-web/src/@domains/auction/
  components/SellerAuctionStartStatusShell.tsx   # lifecycle shell [ASSUMED]
  hooks/useSellerAuctionStart.ts                 # orchestration state hook [ASSUMED]
  services/auctionStartWallet.ts                 # MetaMask tx submit helper [ASSUMED]
```

### Pattern 1: Backend preflight creates/reuses a canonical start attempt before wallet submission

**What:** Persist a seller-owned pending start attempt keyed to seller + artwork and return one canonical `orderId`/attempt ID for all retries. [VERIFIED: codebase grep][ASSUMED]  
**When to use:** Every valid `Start Auction` submission before MetaMask opens. [VERIFIED: codebase grep][ASSUMED]

**Example:**
```typescript
// Source pattern: BE/apps/payments-service/src/application/commands/payments/handlers/RecordEthereumPayment.command.handler.ts
// Source pattern: BE/libs/blockchain/src/services/blockchain-event-listener.service.ts

@CommandHandler(StartAuctionCommand)
export class StartAuctionHandler implements ICommandHandler<StartAuctionCommand> {
  async execute({ data }: StartAuctionCommand) {
    const existing = await this.startAttemptRepo.findOpenBySellerAndArtwork(data.sellerId, data.artworkId)
    if (existing) return existing

    const candidate = await this.artworkClient.send({ cmd: 'get_seller_auction_candidate' }, {
      sellerId: data.sellerId,
      artworkId: data.artworkId,
    })

    if (!candidate.isEligible) {
      throw RpcExceptionHelper.conflict('Artwork is no longer eligible for auction start')
    }

    const sellerReady = await this.identityClient.send({ cmd: 'get_seller_auction_readiness' }, {
      sellerId: data.sellerId,
    })

    if (!sellerReady.walletAddress) {
      throw RpcExceptionHelper.badRequest('Connect and save a seller wallet before starting an auction')
    }

    return this.startAttemptRepo.create({
      sellerId: data.sellerId,
      artworkId: data.artworkId,
      orderId: existing?.orderId ?? `AUC-${Date.now()}-${randomSuffix()}`,
      status: 'pending_start',
      submittedTermsSnapshot: data.terms,
    })
  }
}
```

### Pattern 2: Seller wallet signs `createAuction`, backend only records and reconciles

**What:** FE requests accounts/network, submits the contract tx from the seller wallet, then PATCHes the tx hash back to the backend attempt record. [VERIFIED: codebase grep][CITED: https://docs.metamask.io/wallet/how-to/access-accounts/][CITED: https://docs.metamask.io/wallet/how-to/send-transactions/]  
**When to use:** After backend preflight returns canonical order/attempt payload. [VERIFIED: codebase grep][ASSUMED]

**Example:**
```typescript
// Source pattern: FE/artium-web/src/@domains/auth/hooks/useWalletLogin.ts
// Source pattern: FE/artium-web/src/@domains/auction/services/auctionBidWallet.ts

const attempt = await auctionApis.startSellerAuction(input)

const accounts = await window.ethereum.request<string[]>({ method: 'eth_requestAccounts' })
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0xaa36a7' }],
})

const txHash = await window.ethereum.request<string>({
  method: 'eth_sendTransaction',
  params: [{
    from: accounts[0],
    to: attempt.contractAddress,
    data: attempt.calldata,
  }],
})

await auctionApis.attachSellerAuctionTx(attempt.attemptId, { txHash, walletAddress: accounts[0] })
```

### Anti-Patterns to Avoid

- **Backend-signing seller auction start:** Existing `EscrowContractService.createAuction()` uses the platform signer, which makes the platform wallet the on-chain seller and breaks `onlySeller` lifecycle actions. [VERIFIED: codebase grep]
- **Pending state stored only in React:** Approved UI requires pending/retryable state restore across refresh/navigation; local component state cannot satisfy that. [VERIFIED: codebase grep]
- **Creating seller-only pending rows directly in public auction projection:** `GetAuctionsHandler` currently reads all blockchain-payment orders, so pending start rows can leak to public `/auction` if stored there without filtering. [VERIFIED: codebase grep]
- **Relying on chain event alone for artwork linkage:** `AuctionStarted` event does not contain artwork ID or seller-profile metadata, so event-only hydration cannot build seller inventory/order projections by itself. [VERIFIED: codebase grep]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Blockchain event delivery | custom polling + ad hoc publish path | existing `BlockchainEventListenerService` + `OutboxService` + `BlockchainProcessedEvent` dedup | This repo already solved backfill, retry, duplicate-event, and outbox durability in `blockchain-event-listener.service.ts:425-657` and `outbox.service.ts:15-66`. [VERIFIED: codebase grep] |
| Auction eligibility logic | FE-only “is this artwork ready?” checks | artwork-service candidate/lock policy | Existing reason codes already cover status, publish, quantity, image, metadata, on-chain, and active-order locks. [VERIFIED: codebase grep] |
| Idempotency | disabled button / frontend debounce only | repository-enforced canonical attempt key + contract `orderId` reuse + tx-hash uniqueness | FE-only protection cannot survive reloads, retries, or multi-tab submissions. [VERIFIED: codebase grep][ASSUMED] |
| Seller auth/ownership enforcement | trust FE role or selected artwork | guarded start route + backend identity/artwork queries | Current seller access is already backend-guarded for candidate listing; start must keep that standard. [VERIFIED: codebase grep] |
| ABI calldata encoding for `createAuction` | manual selector/offset/hex assembly | ABI/interface-based encoding helper if possible | `createAuction` has multiple args including dynamic strings, so hand-rolled encoding is easy to get wrong; current bid helper is much simpler than this call. [VERIFIED: codebase grep][ASSUMED] |

**Key insight:** The repo already has durable patterns for CQRS, repositories, outbox, blockchain-event dedup, and MetaMask request flow; Phase 20 risk comes from wiring them together with the right ownership boundary, not from inventing new primitives. [VERIFIED: codebase grep]

## Common Pitfalls

### Pitfall 1: Using the backend signer for seller activation
**What goes wrong:** The platform wallet becomes the contract seller, so the real seller cannot later end, cancel, ship, or claim delivery timeout. [VERIFIED: codebase grep]  
**Why it happens:** `EscrowContractService.createAuction()` connects with `PLATFORM_SIGNER`, while the contract records `seller = msg.sender`. [VERIFIED: codebase grep]  
**How to avoid:** Keep backend responsible for validation/idempotency, but require seller MetaMask to submit the actual `createAuction` tx. [VERIFIED: codebase grep][ASSUMED]  
**Warning signs:** `AuctionStarted.seller` does not match authenticated user wallet, or seller lifecycle actions revert with `NotSeller`. [VERIFIED: codebase grep]

### Pitfall 2: Publicly exposing pending starts
**What goes wrong:** Pending/retryable seller-only starts appear on public `/auction` before backend marks them active. [VERIFIED: codebase grep]  
**Why it happens:** `GetAuctionsHandler` currently fetches all blockchain-payment orders without a seller-only pending-state filter. [VERIFIED: codebase grep]  
**How to avoid:** Keep pending attempts in a separate aggregate or explicitly exclude non-active start states from public auction queries. [VERIFIED: codebase grep][ASSUMED]  
**Warning signs:** Public cards render with order-number fallback titles or empty artwork images immediately after seller submit. [VERIFIED: codebase grep]

### Pitfall 3: Seller order views never show auction-start rows
**What goes wrong:** Seller status disappears outside the create page even though an order row exists. [VERIFIED: codebase grep]  
**Why it happens:** Seller order scope is an inner join on `order_items`, but current `AuctionStarted` handling creates order rows without order items. [VERIFIED: codebase grep]  
**How to avoid:** Create `order_items` during convergence or use a dedicated seller start-status read model for seller surfaces. [VERIFIED: codebase grep][ASSUMED]  
**Warning signs:** Public `/auctions` shows a live auction, but seller `/orders?scope=seller` shows nothing. [VERIFIED: codebase grep]

### Pitfall 4: Losing failure/retry state on refresh
**What goes wrong:** Sellers see an editable form again after reload and can resubmit a second start. [VERIFIED: codebase grep]  
**Why it happens:** Current FE start state is only React state + local draft storage. [VERIFIED: codebase grep]  
**How to avoid:** Persist attempt lifecycle server-side and hydrate it on page load before enabling inputs. [VERIFIED: codebase grep][ASSUMED]  
**Warning signs:** A failed/retryable tx can only be understood from browser console or wallet history, not from the app UI. [VERIFIED: codebase grep]

## Code Examples

### Start CTA replacement on the FE page
```typescript
// Source pattern: FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx
const handleStartAttempt = async () => {
  setHasSubmittedTerms(true)
  const errors = validateCurrentTerms()
  if (Object.keys(errors).length > 0 || !selectedCandidate) return

  const attempt = await auctionApis.startSellerAuction({
    artworkId: selectedCandidate.artworkId,
    ...mapTermsToStartPayload(termsValues),
  })

  setLifecycle(attempt)

  const tx = await submitSellerAuctionStart(attempt)
  await auctionApis.attachSellerAuctionTx(attempt.attemptId, tx)
  await refreshLifecycle(attempt.attemptId)
}
```
This follows the current FE page/hook structure and keeps local validation first. [VERIFIED: codebase grep][ASSUMED]

### Event-driven convergence instead of FE optimism
```typescript
// Source pattern: BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts
@RabbitSubscribe({ routingKey: RoutingKey.BLOCKCHAIN_AUCTION_STARTED, ... })
async handleAuctionStarted(message: { orderId: string; seller: string; endTime: string; txHash: string }) {
  const attempt = await this.startAttemptRepo.findByOrderId(message.orderId)
  if (!attempt) return

  await this.startAttemptRepo.markActive(attempt.id, {
    txHash: message.txHash,
    sellerWallet: message.seller,
    endsAt: fromUnix(message.endTime),
  })

  await this.orderProjectionService.upsertAuctionOrderFromAttempt(attempt)
  await this.artworkProjectionService.markArtworkInAuction(attempt.artworkId, message.orderId)
}
```
This matches the repo’s existing “consume blockchain event, then update durable read model” pattern. [VERIFIED: codebase grep][ASSUMED]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Local-only `Start Auction` validation on FE | Backend preflight + persisted pending attempt + seller wallet tx + event-driven convergence | Phase 20 target | Required for SAUC-07/08/09 and approved UI contract. [VERIFIED: codebase grep][ASSUMED] |
| Blank order rows inferred from `AuctionStarted` event | Pre-linked attempt/order-item or equivalent seller read model with artwork snapshot | Phase 20 target | Required for seller inventory/order convergence and non-empty public auction cards. [VERIFIED: codebase grep][ASSUMED] |
| Backend platform signer helper for `createAuction` | Seller wallet-signed `createAuction` | Phase 20 target | Preserves contract `onlySeller` lifecycle semantics. [VERIFIED: codebase grep] |

**Deprecated/outdated for this phase:**
- Local-only `handleStartAttempt()` boundary in `SellerAuctionArtworkPickerPage.tsx:314-317`; it is explicitly Phase-19-only behavior and cannot satisfy Phase 20 requirements. [VERIFIED: codebase grep]
- Reusing current FE “next phase” helper copy in `SellerAuctionTermsForm.tsx:399-400`; approved UI-SPEC requires replacing it with lifecycle feedback. [VERIFIED: codebase grep]

## Concrete file-level references and likely files to change

### Existing files that almost certainly change

| File | Why |
|------|-----|
| `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts` | Current controller has only GET auction routes; seller start/status routes belong here. [VERIFIED: codebase grep][ASSUMED] |
| `BE/apps/orders-service/src/app.module.ts` | New command/query handlers, repositories, and possibly service-to-service clients need registration here. [VERIFIED: codebase grep][ASSUMED] |
| `BE/apps/orders-service/src/presentation/microservice/orders.microservice.controller.ts` | Needs new message patterns for start, attach-tx, retry, and seller lifecycle status. [VERIFIED: codebase grep][ASSUMED] |
| `BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts` | Current `AuctionStarted` handling does not link artwork/order-item context and must be enriched. [VERIFIED: codebase grep] |
| `BE/apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.ts` | Public projection must exclude seller-only pending/failed attempts and should read richer artwork-linked data. [VERIFIED: codebase grep][ASSUMED] |
| `BE/apps/orders-service/src/domain/entities/orders.entity.ts` | May need additional lifecycle fields or explicit relation to a start-attempt aggregate. [VERIFIED: codebase grep][ASSUMED] |
| `BE/apps/orders-service/src/infrastructure/repositories/order.repository.ts` | Public/seller query filtering and projection joins will likely change. [VERIFIED: codebase grep][ASSUMED] |
| `BE/apps/artwork-service/src/presentation/microservice/artworks.microservice.controller.ts` | Needs an RPC seam to mark artwork `IN_AUCTION` / set `onChainAuctionId` / expose badge fields. [VERIFIED: codebase grep][ASSUMED] |
| `FE/artium-web/src/@shared/apis/auctionApis.ts` | Needs POST/PATCH/GET lifecycle endpoints and DTO types. [VERIFIED: codebase grep][ASSUMED] |
| `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx` | Main UI orchestration hook point. [VERIFIED: codebase grep] |
| `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx` | Needs locked/editable mode and action-state changes. [VERIFIED: codebase grep][ASSUMED] |
| `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsPreview.tsx` | Needs to remain visible as a frozen snapshot through pending/failed/active states. [VERIFIED: codebase grep][ASSUMED] |
| `FE/artium-web/src/@shared/apis/artworkApis.ts` + `FE/artium-web/src/@domains/inventory/utils/inventoryApiMapper.ts` | Seller inventory badges require new lifecycle fields. [VERIFIED: codebase grep][ASSUMED] |
| `FE/artium-web/src/@domains/orders/utils/orderPresentation.ts` and `OrderStatusBadge.tsx` | Seller order badges require new presentation labels if the order workspace participates in start-status display. [VERIFIED: codebase grep][ASSUMED] |

### Proposed new files

| File | Purpose |
|------|---------|
| `BE/apps/orders-service/src/application/commands/auctions/StartSellerAuction.command.ts` | canonical start-preflight entrypoint. [ASSUMED] |
| `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.ts` | validate ownership/readiness/idempotency and create/reuse attempt. [ASSUMED] |
| `BE/apps/orders-service/src/application/commands/auctions/AttachAuctionStartTx.command.ts` | persist wallet tx hash and wallet address. [ASSUMED] |
| `BE/apps/orders-service/src/application/queries/auctions/GetSellerAuctionStartStatus.query.ts` | seller lifecycle read model query. [ASSUMED] |
| `BE/apps/orders-service/src/domain/entities/auction-start-attempt.entity.ts` | pending/failed/retryable/active lifecycle persistence. [ASSUMED] |
| `BE/apps/orders-service/src/infrastructure/repositories/auction-start-attempt.repository.ts` | repository pattern implementation for the new aggregate. [ASSUMED] |
| `BE/libs/common/src/dtos/auctions/start-auction.dto.ts` | gateway/service POST payload contract. [ASSUMED] |
| `BE/libs/common/src/dtos/auctions/auction-start-status.dto.ts` | seller lifecycle response contract. [ASSUMED] |
| `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionStart.ts` | page-level orchestration and lifecycle hydration. [ASSUMED] |
| `FE/artium-web/src/@domains/auction/components/SellerAuctionStartStatusShell.tsx` | approved inline pending/active/failed/retryable shell. [ASSUMED] |
| `FE/artium-web/src/@domains/auction/services/auctionStartWallet.ts` | MetaMask submit helper for `createAuction`. [ASSUMED] |

## Recommended implementation sequencing

1. **Wave 0: backend data model and route contracts first** — add start-attempt aggregate/status DTOs before touching FE submit behavior, because pending/retryable lifecycle cannot be recovered without durable state. [VERIFIED: codebase grep][ASSUMED]
2. **Wave 1: preflight/idempotency command** — enforce seller auth, artwork eligibility, seller wallet/profile readiness, and config readiness; return one canonical order/attempt ID. [VERIFIED: codebase grep][ASSUMED]
3. **Wave 2: FE wallet handoff** — replace local-only `Start Auction` with preflight + MetaMask submission + tx attach while preserving local terms validation and current layout. [VERIFIED: codebase grep][ASSUMED]
4. **Wave 3: blockchain convergence** — on `AuctionStarted`, mark attempt active, persist authoritative auction/order projection, and update artwork `IN_AUCTION` / `onChainAuctionId`. [VERIFIED: codebase grep][ASSUMED]
5. **Wave 4: read-model projection cleanup** — filter public auctions to active-only, enrich seller inventory/order surfaces with authoritative lifecycle badges, and remove helper copy that says orchestration is future work. [VERIFIED: codebase grep][ASSUMED]
6. **Wave 5: retry/failure semantics** — reason codes, retry-safe re-entry, and edit unlock only when failure requires terms changes. [VERIFIED: codebase grep][ASSUMED]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Orders-service should own a new `auction_start_attempts` aggregate instead of overloading `orders` for seller-only pending/failed lifecycle state. | Backend/service boundaries; file changes | Medium — planner may need a different persistence owner if the team prefers extending `orders`. |
| A2 | Seller wallet start should be FE-signed with MetaMask, while backend only preflights and reconciles. | Summary; Standard Stack; Patterns | Medium — if product intentionally wants a custodial platform-signed start, contract semantics and downstream seller actions must be redesigned. |
| A3 | Seller inventory badges should come from artwork DTO enrichment rather than a separate FE-only merge layer. | Source-of-truth mapping; file changes | Low-Medium — a gateway-composed seller inventory endpoint could also work. |
| A4 | Seller order workspace should show lifecycle badges only after the underlying order/read model has artwork linkage, not by inventing FE-only placeholder cards. | Read-model convergence | Medium — if product wants pending auction-start rows in `/orders`, the order model may need broader changes. |
| A5 | If FE wants ABI-safe calldata encoding for `createAuction`, adding `ethers` to FE is an acceptable Phase 20 dependency. | Standard Stack; Don’t Hand-Roll | Low — planner can instead use another ABI encoder or a narrowly scoped internal helper. |

## Open Questions

1. **Should pending/retryable auction-start state appear in the existing seller `/orders` workspace, or only on `/artist/auctions/create` + inventory badges until the auction becomes active?**
   - What we know: seller orders currently require `order_items` joins and are optimized for shipping/payment lifecycle, not seller start attempts. [VERIFIED: codebase grep]
   - What's unclear: product expectation for zero-bid pending starts in seller orders. [ASSUMED]
   - Recommendation: decide this before implementation starts; it changes whether Phase 20 needs order-model expansion or just badge enrichment. [ASSUMED]

2. **Is stored `user.walletAddress` mandatory, or can Phase 20 accept an ad hoc connected wallet and then persist it?**
   - What we know: canonical wallet identity is on `users.walletAddress`; seller profile does not hold a separate wallet field. [VERIFIED: codebase grep]
   - What's unclear: whether auction start is allowed to bootstrap wallet readiness or must require an existing saved wallet. [ASSUMED]
   - Recommendation: prefer “saved wallet required and must match connected MetaMask” unless product explicitly approves wallet-binding during start. [ASSUMED]

3. **Does the frontend have an external `createUseQuery` wrapper convention not present in the inspected repo paths?**
   - What we know: inspected FE auction/order/inventory/shared paths use manual `useEffect` + `useState`, and no local `createUseQuery` helper was found. [VERIFIED: codebase grep]
   - What's unclear: whether a non-repo instruction requires adopting that wrapper for new Phase 20 hooks. [ASSUMED]
   - Recommendation: confirm before Wave 0; if required, wrap new lifecycle/status queries in that abstraction instead of following current local hook style. [ASSUMED]

## Environment Availability

| Dependency | Required By | Available | Version / Status | Fallback |
|------------|------------|-----------|------------------|----------|
| Node.js | FE/BE builds, Jest, Next, Nest | ✓ | `v21.7.3` [VERIFIED: local environment] | — |
| npm | FE commands / package inspection | ✓ | `10.5.0` [VERIFIED: local environment] | — |
| Yarn | BE workspace scripts | ✓ | `1.22.22` [VERIFIED: local environment] | — |
| Docker | running local BE services | ✓ | `29.2.0`; containers for api-gateway, orders-service, artwork-service, identity-service, rabbitmq, postgres are up. [VERIFIED: local environment] | — |
| RabbitMQ | blockchain/outbox integration | ✓ | container up; port `5672` listening. [VERIFIED: local environment] | — |
| API gateway | manual/integration verification | ✓ | port `8081` listening. [VERIFIED: local environment] | — |
| FE dev server | manual seller UI verification | ✓ | port `3000` listening. [VERIFIED: local environment] | — |
| Local JSON-RPC chain | local contract execution | ✗ | port `8545` closed. [VERIFIED: local environment] | use configured Sepolia RPC instead. [VERIFIED: codebase grep] |
| Browser MetaMask | end-to-end seller start | not probeable from CLI | browser-only dependency. [ASSUMED] | none for real wallet start |
| `psql` CLI | direct DB inspection from shell | ✗ | command missing. [VERIFIED: local environment] | use Dockerized Postgres tooling if needed. [ASSUMED] |

**Missing dependencies with no fallback:**
- Browser MetaMask for real end-to-end seller wallet start verification. [ASSUMED]

**Missing dependencies with fallback:**
- Local JSON-RPC chain on `8545`; fallback is Sepolia/testnet configuration already referenced in repo code. [VERIFIED: codebase grep]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Backend: Jest 30 via `BE/package.json`; Frontend: no dedicated test framework detected in `FE/artium-web`. [VERIFIED: codebase grep] |
| Config file | `BE/package.json#jest`; FE none — see Wave 0. [VERIFIED: codebase grep] |
| Quick run command | `cd BE && npx jest apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.spec.ts apps/orders-service/src/application/queries/handlers/GetArtworkOrderLocks.query.handler.spec.ts --runInBand` [VERIFIED: codebase grep] |
| Full suite command | `cd BE && yarn test --runInBand && cd ../FE/artium-web && npx tsc --noEmit && npm run build` [VERIFIED: codebase grep][ASSUMED] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SAUC-06 | Terms/artwork/economics lock when lifecycle is pending or active; only safe actions remain enabled | FE component/manual + build | `cd FE/artium-web && npx tsc --noEmit && npm run lint -- src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx src/@domains/auction/components/SellerAuctionTermsForm.tsx src/@domains/auction/components/SellerAuctionTermsPreview.tsx` | ❌ Wave 0 |
| SAUC-07 | Start preflight validates seller identity, ownership, eligibility, wallet/profile readiness, and idempotent reuse | backend unit/integration | `cd BE && npx jest apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.spec.ts --runInBand` | ❌ Wave 0 |
| SAUC-08 | `AuctionStarted` convergence persists authoritative order/artwork/public read state without mock data leak | backend integration | `cd BE && npx jest apps/orders-service/src/application/event-handlers/BlockchainEventHandler.start.spec.ts apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.spec.ts apps/artwork-service/src/application/commands/handlers/MarkArtworkInAuction.command.handler.spec.ts --runInBand` | ❌ Wave 0 |
| SAUC-09 | Seller lifecycle status returns pending/active/failed/retryable with tx hash, reason codes, and retry-safe semantics | backend unit + FE manual/build | `cd BE && npx jest apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts --runInBand && cd ../FE/artium-web && npx tsc --noEmit` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `cd BE && npx jest <changed backend specs> --runInBand` plus `cd FE/artium-web && npx tsc --noEmit` for changed FE work. [VERIFIED: codebase grep][ASSUMED]
- **Per wave merge:** `cd BE && yarn test --runInBand && cd ../FE/artium-web && npm run build`. [VERIFIED: codebase grep][ASSUMED]
- **Phase gate:** all new backend specs green, FE build/typecheck green, and manual MetaMask start/retry/refresh scenarios pass before `/gsd-verify-work`. [ASSUMED]

### Wave 0 Gaps
- [ ] `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.spec.ts` — covers SAUC-07. [ASSUMED]
- [ ] `BE/apps/orders-service/src/application/queries/handlers/GetSellerAuctionStartStatus.query.handler.spec.ts` — covers SAUC-09. [ASSUMED]
- [ ] `BE/apps/orders-service/src/application/event-handlers/BlockchainEventHandler.start.spec.ts` — covers SAUC-08 convergence. [ASSUMED]
- [ ] `BE/apps/artwork-service/src/application/commands/handlers/MarkArtworkInAuction.command.handler.spec.ts` — covers artwork projection for SAUC-08. [ASSUMED]
- [ ] FE test framework install/config (Vitest/RTL or equivalent) — no FE unit-test infra was detected. [VERIFIED: codebase grep][ASSUMED]
- [ ] If FE unit tests remain out of scope, document manual scripts for pending/active/failed/retryable seller lifecycle and refresh/retry protection. [ASSUMED]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `JwtAuthGuard`, authenticated user context, and seller-role checks before start. [VERIFIED: codebase grep] |
| V3 Session Management | no | Phase 20 reuses existing auth/session state; no new session mechanism is implied by inspected code. [VERIFIED: codebase grep] |
| V4 Access Control | yes | server-side seller ownership/eligibility enforcement and order-view authorization. [VERIFIED: codebase grep] |
| V5 Input Validation | yes | class-validator DTOs on gateway/microservice payloads plus existing FE terms validation. [VERIFIED: codebase grep][ASSUMED] |
| V6 Cryptography | yes | MetaMask/Ethereum signing, ethers, and OpenZeppelin contract logic; never hand-roll crypto or signature validation. [VERIFIED: codebase grep] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Duplicate start submission for same artwork | Tampering / DoS | canonical attempt key, reused orderId, tx-hash uniqueness, and disabled resubmit while pending. [VERIFIED: codebase grep][ASSUMED] |
| Starting auction for non-owned or ineligible artwork | Elevation of Privilege | artwork-service candidate policy + order-lock merge reused server-side. [VERIFIED: codebase grep] |
| Wallet mismatch or wrong network | Spoofing / Tampering | require authenticated seller wallet readiness, compare connected address, enforce Sepolia chain before tx attach. [VERIFIED: codebase grep][ASSUMED] |
| Public leak of seller-only pending/failed starts | Information Disclosure | separate pending aggregate or filter public query to active-only projection. [VERIFIED: codebase grep][ASSUMED] |
| Replay of already-processed blockchain events | Repudiation / Tampering | existing `BlockchainProcessedEvent` dedup and transactional outbox path. [VERIFIED: codebase grep] |

## Sources

### Primary (HIGH confidence)
- Repo code inspection:
  - `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx`
  - `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx`
  - `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsPreview.tsx`
  - `FE/artium-web/src/@shared/apis/auctionApis.ts`
  - `FE/artium-web/src/@domains/orders/utils/orderPresentation.ts`
  - `FE/artium-web/src/@domains/inventory/views/InventoryPage.tsx`
  - `FE/artium-web/src/@domains/inventory/utils/inventoryApiMapper.ts`
  - `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts`
  - `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts`
  - `BE/apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.ts`
  - `BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts`
  - `BE/apps/orders-service/src/infrastructure/repositories/order.repository.ts`
  - `BE/apps/orders-service/src/domain/entities/orders.entity.ts`
  - `BE/apps/artwork-service/src/application/queries/artworks/handlers/ListSellerAuctionArtworkCandidates.query.handler.ts`
  - `BE/apps/identity-service/src/domain/entities/user.entity.ts`
  - `BE/apps/identity-service/src/domain/entities/seller_profiles.entity.ts`
  - `BE/libs/blockchain/src/services/escrow-contract.service.ts`
  - `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts`
  - `BE/libs/outbox/src/outbox.service.ts`
  - `BE/smart-contracts/contracts/ArtAuctionEscrow.sol` [VERIFIED: codebase grep]
- npm registry checks:
  - `npm view @nestjs/cqrs version time.modified`
  - `npm view ethers version time.modified`
  - `npm view next version time.modified`
  - `npm view socket.io-client version time.modified`
  - `npm view zod version time.modified` [VERIFIED: npm registry]
- Approved design contract:
  - `.planning/phases/20-auction-start-orchestration-and-seller-lifecycle-status/20-UI-SPEC.md` [VERIFIED: codebase grep]

### Secondary (MEDIUM confidence)
- MetaMask official docs:
  - https://docs.metamask.io/wallet/how-to/access-accounts/ — `eth_requestAccounts` account access flow. [CITED: https://docs.metamask.io/wallet/how-to/access-accounts/]
  - https://docs.metamask.io/wallet/how-to/send-transactions/ — `eth_sendTransaction` request flow. [CITED: https://docs.metamask.io/wallet/how-to/send-transactions/]

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — core libraries and versions are already present in repo and npm registry verification was run. [VERIFIED: codebase grep][VERIFIED: npm registry]
- Architecture: **HIGH** for current-state mapping, **MEDIUM** for the recommended new `auction_start_attempts` aggregate because that design is inferred rather than implemented. [VERIFIED: codebase grep][ASSUMED]
- Pitfalls: **HIGH** — the highest-risk failures are directly visible in current code boundaries and contract semantics. [VERIFIED: codebase grep]

**Research date:** 2026-04-27  
**Valid until:** 2026-05-04
