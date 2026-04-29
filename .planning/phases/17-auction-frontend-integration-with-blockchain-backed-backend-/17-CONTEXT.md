# Phase 17: Auction frontend integration with blockchain-backed backend flow and live auction state sync - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the existing `/auction` frontend experience real by replacing mock auction data and simulated bid-state transitions with backend/on-chain-backed data, real wallet bidding, and trustworthy synchronized auction state.

This phase is centered on the current listing page and bid modal. It establishes the backend read contract for future auction detail surfaces, but it does not require shipping a full single-auction detail UI, seller auction management, watchlists, or a separate dispute workspace in this phase.

</domain>

<decisions>
## Implementation Decisions

### Auction read contract and data ownership
- **D-01:** Phase 17 should include the single-auction detail read contract now, even if the UI shipped in this phase remains focused on the current `/auction` listing and bid modal.
- **D-02:** Auction responses should embed the artwork display fields the frontend needs directly, rather than forcing FE to fetch artwork data separately and merge it client-side.
- **D-03:** The integration model is hybrid: frontend submits the user's bid directly through the wallet/contract, while backend remains the read and synchronization layer for auction listing, detail, and live state.
- **D-04:** Frontend must not treat local wallet transaction submission as final auction truth. Backend/on-chain synchronized state is the authoritative source for status and current highest bid.
- **D-05:** The backend auction read surface should be a dedicated auction read model/endpoints, but not a new dedicated microservice.
- **D-06:** Auction read endpoints should be exposed through `api-gateway`, backed by an auction-focused query layer that composes contract reads, blockchain event-derived state, and artwork display metadata.
- **D-07:** Phase 17 should ship the current `/auction` listing and real bid modal integration first; the detail read contract is created now for future use, but a full single-auction detail page UI is deferred.

### the agent's Discretion
- Exact DTO field naming and internal query composition, provided the contract stays auction-first and FE does not need to stitch multiple unrelated payloads together.
- Whether the auction-focused query layer lives primarily in `api-gateway` composition logic or in an existing backend service query surface, provided it does not become a new standalone auction service in this phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase and milestone context
- `.planning/ROADMAP.md` — Phase 17 entry and current milestone dependency context
- `.planning/REQUIREMENTS.md` — existing milestone traceability and adjacent checkout/orders requirements that establish current planning conventions
- `.planning/phases/07-checkout-payment-feedback-success-error-ui-states/07-CONTEXT.md` — nearby precedent for blockchain-backed frontend states where UI may show pending/processing before backend truth is final

### Auction business and backend architecture
- `BE/docs/presentation-blockchain-auction-flow.md` — canonical auction lifecycle, smart-contract state machine, event mapping, and trust model
- `BE/docs/real-time-auction-and-order-tracking-features.md` — target auction read/realtime/API shape, UX aspirations, and missing backend surfaces called out explicitly
- `BE/smart-contracts/contracts/ArtAuctionEscrow.sol` — on-chain auction actions, state transitions, anti-snipe behavior, and role ownership
- `BE/libs/blockchain/src/services/escrow-contract.service.ts` — existing backend contract read/write access patterns
- `BE/libs/blockchain/src/services/blockchain-event-listener.service.ts` — event listener and outbox publication path for blockchain auction updates
- `BE/apps/orders-service/src/application/event-handlers/blockchain-event.handler.ts` — current off-chain sync from blockchain events into order state

### Current frontend auction implementation
- `docs/report_frontend/LIVE_AUCTION_PAGE_REPORT.md` — current `/auction` page design, mock-data architecture, and explicit integration gaps
- `docs/report_frontend/LIVE_AUCTION_BID_MODAL_SPEC.md` — current bid modal state model and intended UX semantics
- `FE/artium-web/src/pages/auction.tsx` — route shell for the live auction page
- `FE/artium-web/src/views/LiveAuctionPage.tsx` — current listing page implementation, filtering, and mock auction lot shaping
- `FE/artium-web/src/@domains/auction/components/BidEditingModal.tsx` — current bid modal state machine and simulated tx/pending/confirmed/failed flow

### Frontend integration patterns
- `FE/artium-web/src/@shared/services/apiClient.ts` — standard FE API access pattern through `api-gateway`
- `FE/artium-web/src/@shared/apis/orderApis.ts` — example FE API module structure for domain-facing backend calls
- `FE/artium-web/src/@shared/apis/paymentApis.ts` — example of hybrid blockchain/payment orchestration patterns already used in FE

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FE/artium-web/src/views/LiveAuctionPage.tsx`: already provides the intended page layout, filtering UI, and lot presentation design that Phase 17 should preserve while replacing mock data.
- `FE/artium-web/src/@domains/auction/components/BidEditingModal.tsx`: already provides the visual bid-flow shell and can be refactored from local simulation into real wallet/on-chain-backed state transitions.
- `FE/artium-web/src/@shared/services/apiClient.ts`: establishes the standard FE pattern for talking to `api-gateway`.
- `FE/artium-web/src/@shared/apis/*.ts`: provides the expected place to introduce auction API bindings without inventing a different FE data-access pattern.

### Established Patterns
- Frontend communicates through `api-gateway` for backend reads; Phase 17 should follow that pattern for auction listing/detail reads.
- Blockchain-backed business truth already flows through `contract -> listener -> outbox/RabbitMQ -> backend state`; Phase 17 should reuse this instead of inventing a separate synchronization path.
- Nearby checkout work already accepts a distinction between wallet submission and backend-confirmed truth, which is directly relevant to real auction bid state semantics.

### Integration Points
- `api-gateway` is the correct HTTP surface for auction read endpoints consumed by FE.
- Existing blockchain services and order event handlers already provide the synchronization backbone that the auction read model can compose from.
- The auction FE domain currently derives lots from `discover` mock artwork metadata; Phase 17 should replace that with auction-first DTOs from backend reads.

</code_context>

<specifics>
## Specific Ideas

- Direct FE-to-blockchain interaction is acceptable for the user-signed `bid()` transaction, but not as a replacement for FE ↔ BE integration overall.
- The auction read surface should stay auction-first and presentation-friendly instead of leaking order-first or generic artwork-first backend shapes into FE.
- The detail read contract should be designed now to avoid another DTO redesign later, even though the full detail page UI is deferred.

</specifics>

<deferred>
## Deferred Ideas

- Full single-auction detail page UI
- Full auction room / live bid history feed UI beyond the current listing and bid modal scope
- Seller auction management surfaces
- Watchlists, reminders, and auction-specific notification UX
- Dispute workspace or arbiter dashboard UI

</deferred>

---

*Phase: 17-auction-frontend-integration-with-blockchain-backed-backend-*
*Context gathered: 2026-04-24*
