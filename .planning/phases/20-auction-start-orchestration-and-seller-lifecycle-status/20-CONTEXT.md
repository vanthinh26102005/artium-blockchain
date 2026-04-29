# Phase 20: Auction start orchestration and seller lifecycle status - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect seller auction creation to the backend/on-chain start flow with idempotent orchestration, authoritative auction state persistence, locked post-activation economics, and seller-visible pending, active, failed, and retryable lifecycle feedback.

This phase covers SAUC-06 through SAUC-09. It starts auctions only through server-authorized seller/artwork readiness checks, persists one canonical seller start attempt, hands wallet signing to MetaMask through backend-generated calldata, and exposes lifecycle truth to seller surfaces while keeping public auction reads gated until authoritative active convergence.

</domain>

<decisions>
## Implementation Decisions

### Start attempt idempotency
- **D-01:** Reuse one canonical start attempt for the same authenticated seller and artwork. Retries return or update that attempt and must never create duplicate on-chain or off-chain auctions for the artwork.
- **D-02:** The idempotency key is authenticated seller ID plus artwork ID. Do not use a client-provided idempotency key or terms hash as the primary identity for this phase.
- **D-03:** If a duplicate `Start Auction` request arrives while the canonical attempt is pending, return the existing pending attempt status with the same `attemptId`, `orderId`, frozen terms snapshot, and wallet request or tx state.
- **D-04:** If a failed non-active attempt requires unsafe term edits, the seller must explicitly choose `Back to terms`; then the same canonical attempt snapshot may be updated. Do not silently replace the submitted snapshot.

### Wallet and backend handoff
- **D-05:** Backend constructs and returns the contract address plus encoded calldata. Frontend only asks MetaMask to send the transaction; it must not reconstruct seller auction calldata from the ABI.
- **D-06:** Backend must not sign or send the auction-start transaction. Seller wallet signing remains part of the trust model.
- **D-07:** Missing MetaMask or wrong-network state stays in the pending lifecycle shell with explicit wallet/network guidance. It is recoverable setup guidance, not an immediate failed auction attempt.
- **D-08:** Attach the tx hash to the backend attempt immediately after MetaMask returns an `eth_sendTransaction` hash. Treat it as pending-chain evidence, not final auction truth.
- **D-09:** If MetaMask rejects before a tx hash exists, move the canonical attempt to retryable with a wallet-rejected reason so the seller can retry without losing the frozen terms.

### Lifecycle states and recovery
- **D-10:** Seller-facing top-level states are exactly: `Pending start`, `Auction active`, `Start failed`, and `Retry available`.
- **D-11:** Backend returns stable machine reason codes; frontend maps them to friendly seller copy and recovery guidance. Do not rely on friendly text alone or expose raw technical internals as the seller-facing contract.
- **D-12:** Only recoverable wallet, network, timeout, and duplicate-safe failures are retryable. Validation, eligibility, seller readiness, or policy failures require fixing the underlying issue before another start.
- **D-13:** After activation, the seller cannot edit unsafe auction economics. Reserve, minimum increment, duration, selected artwork, and the submitted auction terms snapshot stay read-only.
- **D-14:** After activation, allowed seller actions are view-only or explicitly safe actions: view public auction, view/copy tx hash, return to inventory/orders, and inspect lifecycle/status details.
- **D-15:** Before any backend start attempt is created or wallet transaction is requested, the seller must explicitly confirm that activation is irreversible and unsafe economics cannot be edited after activation.
- **D-16:** The confirmation pattern is a required checkbox in the terms/preview step before `Start Auction` enables. This intentionally supersedes the earlier UI-spec note that no destructive confirmation was required.

### Surface convergence
- **D-17:** Public `/auction` listing shows the new auction only after authoritative backend/on-chain active convergence: active order state, on-chain auction ID or tx evidence, and real artwork linkage.
- **D-18:** Pending, failed, and retryable auction-start state is seller-only. It may appear on the create-auction page, seller inventory, and seller order cards; it must not leak into public profile, discovery, or public artwork reads.
- **D-19:** Seller inventory and seller order cards render backend-provided canonical lifecycle status/enrichment. Frontend should not derive lifecycle truth from local optimistic state or public auction reads.
- **D-20:** After activation, `/artist/auctions/create` for that artwork shows active success state with the frozen snapshot, tx details, `View Auction`, and `Back to inventory`; do not immediately redirect or reset the form.

### the agent's Discretion
- Exact DTO property names, enum names, and copy wording may follow existing codebase conventions, provided the semantics above remain intact.
- Exact status shell layout may follow `20-UI-SPEC.md` and local seller workspace components, provided the required confirmation checkbox is added before backend/wallet start.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and locked requirements
- `.planning/ROADMAP.md` - Phase 20 goal, success criteria, dependency on Phase 19.1, and SAUC-06 through SAUC-09 mapping.
- `.planning/REQUIREMENTS.md` - SAUC-06, SAUC-07, SAUC-08, and SAUC-09 requirement definitions.
- `.planning/PROJECT.md` - Seller auction creation trust model and server-authoritative policy decisions.
- `.planning/STATE.md` - Prior durable decisions for gateway readiness aggregation, canonical attempt persistence, lifecycle restoration, public active-only reads, and seller-only lifecycle enrichment.

### Prior auction decisions
- `.planning/phases/17-auction-frontend-integration-with-blockchain-backed-backend-/17-CONTEXT.md` - Backend/on-chain synchronized auction truth, auction-first read DTOs, and no frontend-local finality.
- `.planning/phases/18-seller-auction-access-and-artwork-eligibility-policy/18-CONTEXT.md` - Seller-only access, server-owned eligibility policy, and stable blocked-artwork reason code precedent.
- `.planning/phases/19-seller-auction-creation-workspace-and-terms-ux/19-CONTEXT.md` - Terms workspace, preview, activation-lock copy, and Phase 20 boundary for real start orchestration.

### Phase 20 contracts and verification
- `.planning/phases/20-auction-start-orchestration-and-seller-lifecycle-status/20-UI-SPEC.md` - Seller lifecycle shell, locked snapshot, public/seller surface rules, and visual contract. Read with D-15/D-16 in this context as a deliberate confirmation requirement override.
- `.planning/phases/20-auction-start-orchestration-and-seller-lifecycle-status/20-UAT.md` - User acceptance tests for seller start flow, refresh restoration, public activation gating, and seller lifecycle badges.
- `.planning/phases/20-auction-start-orchestration-and-seller-lifecycle-status/20-01-SUMMARY.md` - Backend start-attempt aggregate, gateway/microservice contracts, and calldata generation decisions.
- `.planning/phases/20-auction-start-orchestration-and-seller-lifecycle-status/20-02-SUMMARY.md` - Frontend start transport, MetaMask handoff, lifecycle hook, and inline status shell implementation.
- `.planning/phases/20-auction-start-orchestration-and-seller-lifecycle-status/20-03-SUMMARY.md` - `AuctionStarted` promotion, order/artwork convergence, and active-only public auction reads.
- `.planning/phases/20-auction-start-orchestration-and-seller-lifecycle-status/20-04-SUMMARY.md` - Seller inventory/order lifecycle badges and seller-only enrichment privacy boundary.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BE/libs/common/src/dtos/auctions/start-seller-auction.dto.ts` and `seller-auction-start-status.dto.ts`: shared auction-start request/status contracts that should carry canonical attempt, reason-code, retry, tx, wallet request, and submitted snapshot semantics.
- `BE/apps/orders-service/src/domain/entities/auction-start-attempt.entity.ts`: canonical persistence point for seller+artwork start attempts and retry/status recovery.
- `BE/apps/orders-service/src/application/commands/handlers/StartSellerAuction.command.handler.ts`: should enforce idempotent reuse and pending duplicate response behavior.
- `BE/apps/orders-service/src/application/commands/handlers/AttachSellerAuctionStartTx.command.handler.ts`: should attach MetaMask-returned tx hashes as pending evidence.
- `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionStart.ts`: frontend lifecycle restoration and submit/retry orchestration point.
- `FE/artium-web/src/@domains/auction/components/SellerAuctionStartStatusShell.tsx`: primary seller-visible lifecycle shell for pending, active, failed, retryable, tx, and reason-code display.
- `FE/artium-web/src/@domains/auction/components/SellerAuctionTermsForm.tsx` and `SellerAuctionTermsPreview.tsx`: correct place to add the required irreversible-activation confirmation checkbox before enabling `Start Auction`.

### Established Patterns
- API gateway remains the seller-authenticated REST surface and composes readiness checks before sending narrower commands to orders-service.
- Orders-service owns auction lifecycle/start-attempt state and public auction read convergence.
- Blockchain events flow through `@app/blockchain`, RabbitMQ, and orders-service handlers; event replay must remain idempotent.
- Frontend seller auction pages restore state from backend status plus remembered artwork context, not from local submit flags.
- Shared read endpoints that power public and seller surfaces must gate private seller lifecycle enrichment behind explicit seller-only query flags.

### Integration Points
- `/artist/auctions/create` remains the seller start orchestration surface.
- Public `/auction` reads must remain active-only and backed by converged order/artwork/on-chain state.
- Seller inventory requests may opt into lifecycle enrichment, but public profile/discovery reads must not.
- Seller order cards should compose canonical auction lifecycle state from backend status rather than inventing order-specific private state.

</code_context>

<specifics>
## Specific Ideas

- The seller confirmation checkbox is required because activation is irreversible from the seller's point of view and unsafe economics cannot be edited afterward.
- Tx hash display is useful before final convergence, but it is only evidence that a transaction was submitted; backend/on-chain event convergence remains final truth.
- Retryable status should preserve the submitted snapshot and reuse the same canonical attempt so the seller does not accidentally start duplicate auctions.
- Keep pending/retry/failure lifecycle details private to the seller workspace.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 20-auction-start-orchestration-and-seller-lifecycle-status*
*Context gathered: 2026-04-29*
