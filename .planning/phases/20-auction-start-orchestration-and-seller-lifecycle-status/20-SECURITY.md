---
phase: 20
slug: auction-start-orchestration-and-seller-lifecycle-status
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-29
---

# Phase 20 - Security

Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Seller browser -> API gateway | Seller selects artwork, submits terms, confirms lock acknowledgement, and attaches wallet transaction hash through authenticated HTTP routes. | Seller identity, artwork ID, auction terms, attempt ID, wallet address, tx hash |
| API gateway -> orders service | Gateway derives seller identity from JWT context, revalidates seller profile/wallet readiness, and forwards start/status/attach commands. | Seller ID, persisted wallet address, artwork metadata, submitted terms snapshot |
| Orders service -> blockchain listener | Orders service persists canonical attempts, emits backend-provided calldata, and promotes only after blockchain `AuctionStarted` events. | Canonical order ID, contract address, calldata, on-chain event payloads |
| Orders service -> artwork service | Blockchain convergence marks artwork in auction only after authoritative activation. | Artwork ID, seller ID, on-chain auction ID |
| Seller lifecycle surfaces -> public auction surfaces | Seller-only pending/failed/retry lifecycle state is exposed to seller inventory/order/create-auction views, while public auction views use active-only order filters. | Seller lifecycle DTOs, public auction DTOs |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-20-01 | Elevation of Privilege | seller start routes | mitigate | Seller candidate, start, attach-tx, and status endpoints are guarded with `JwtAuthGuard`, `RolesGuard`, and `UserRole.SELLER`; the gateway derives `sellerId` from the authenticated request and revalidates candidate ownership before starting. Evidence: `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts:193`, `:208`, `:221`, `:236`, `:270`, `:304`. | closed |
| T-20-02 | Tampering | canonical attempt / order ID reuse | mitigate | Start command looks up the latest seller+artwork attempt, returns pending/active attempts as canonical, and reuses the same order ID for retryable attempts instead of minting a new request. Evidence: `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.ts:48`, `:106`, `:118`, `:126`, `:226`. | closed |
| T-20-03 | Spoofing | wallet attachment | mitigate | Gateway requires seller wallet readiness; attach-tx rejects seller mismatches, wallet mismatches, tx hash replacement, and tx hash reuse by another attempt. Evidence: `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts:93`, `:259`, `BE/apps/orders-service/src/application/commands/handlers/AttachSellerAuctionStartTx.command.handler.ts:36`, `:49`, `:58`. | closed |
| T-20-04 | Information Disclosure | seller lifecycle status | mitigate | Status route is seller-authenticated and calls `get_seller_auction_start_status` with the authenticated seller ID; public auction queries require active orders with on-chain IDs. Evidence: `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts:304`, `:321`, `BE/apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.ts:51`, `BE/apps/orders-service/src/application/queries/handlers/GetAuctionById.query.handler.ts:39`. | closed |
| T-20-05 | Tampering | locked seller controls | mitigate | FE locks artwork change, draft save, and unsafe term controls whenever backend lifecycle is pending, active, retryable, or failed without explicit edit permission; backend persists submitted snapshot and acknowledgement. Evidence: `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx:296`, `:300`, `:634`, `:647`, `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx:365`, `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.ts:165`. | closed |
| T-20-06 | Denial of Service | duplicate submit path | mitigate | FE rehydrates persisted lifecycle status by artwork ID and disables `Start Auction` while busy or lifecycle-locked; backend also canonicalizes duplicate starts by seller+artwork. Evidence: `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionStart.ts:68`, `:101`, `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx:312`, `:481`, `:647`, `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.ts:48`. | closed |
| T-20-07 | Information Disclosure | lifecycle shell actions | mitigate | Tx hash, reason code, guidance, and retry/open-wallet actions render in the seller lifecycle shell fed by seller status responses, not public auction views. Evidence: `FE/artium-web/src/@domains/auction/components/SellerAuctionStartStatusShell.tsx:83`, `:149`, `:214`, `:225`, `:236`, `:247`; public filters in `GetAuctions.query.handler.ts:51`. | closed |
| T-20-08 | Spoofing | wallet handoff | mitigate | Wallet service requires MetaMask, validates contract address/calldata, switches/adds the configured target chain, and surfaces explicit rejected/pending/wrong-chain errors. Evidence: `FE/artium-web/src/@domains/auction/services/auctionStartWallet.ts:23`, `:41`, `:50`, `:59`, `:124`, `:158`. | closed |
| T-20-09 | Tampering | blockchain convergence | mitigate | Blockchain handler finds persisted attempts by on-chain order ID, promotes only those attempts to `AUCTION_ACTIVE`, idempotently handles existing orders/items, and marks attempt retry/edit flags false. Evidence: `BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts:67`, `:69`, `:83`, `:123`, `:160`, `:169`, `:176`. | closed |
| T-20-10 | Information Disclosure | public auction queries | mitigate | Public auction list and detail handlers reject non-active or incomplete auction records by requiring `AUCTION_ACTIVE` plus non-null `onChainOrderId`. Evidence: `BE/apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.ts:51`, `:110`, `BE/apps/orders-service/src/application/queries/handlers/GetAuctionById.query.handler.ts:39`. | closed |
| T-20-11 | Repudiation | authoritative activation timing | mitigate | Artwork/order active state is written by blockchain `AuctionStarted` handling, not by FE submit; artwork service also verifies seller ownership and idempotent on-chain auction ID before marking in auction. Evidence: `BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts:64`, `:160`, `:229`, `BE/apps/artwork-service/src/application/commands/artworks/handlers/MarkArtworkInAuction.command.handler.ts:18`. | closed |
| T-20-12 | Spoofing | lifecycle badge presentation | mitigate | Seller lifecycle badges are rendered from typed backend DTO statuses and shared order presentation mappings. Evidence: `FE/artium-web/src/@domains/inventory/components/InventoryArtworkGridViewItem.tsx:264`, `FE/artium-web/src/@domains/inventory/components/InventoryArtworkList.tsx:337`, `FE/artium-web/src/@domains/orders/utils/orderPresentation.ts:230`. | closed |
| T-20-13 | Tampering | retry recovery affordances | mitigate | Retry actions call backend retry/start path with canonical artwork state, status shell only exposes `Back to terms` when backend `editAllowed` is true, and backend retry remains bound to the existing attempt/order ID. Evidence: `FE/artium-web/src/@domains/auction/components/SellerAuctionStartStatusShell.tsx:225`, `:236`, `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx:589`, `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.ts:126`, `:144`. | closed |
| T-20-14 | Information Disclosure | seller/order badge propagation | mitigate | Seller lifecycle enrichment is opt-in and seller-scoped, while public/profile auction surfaces remain backed by active-only auction query handlers. Evidence: `BE/apps/artwork-service/src/application/queries/artworks/handlers/ListArtworks.query.handler.ts:53`, `:94`, `FE/artium-web/src/@domains/inventory/views/InventoryPage.tsx:181`, `FE/artium-web/src/@domains/inventory/hooks/useInventoryBootstrap.ts:67`, `BE/apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.ts:51`. | closed |

*Status: open - closed*
*Disposition: mitigate (implementation required) - accept (documented risk) - transfer (third-party)*

---

## Accepted Risks Log

No accepted risks.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-29 | 14 | 14 | 0 | Codex / GSD secure-phase |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-29
