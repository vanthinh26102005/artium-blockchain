# Phase 19: Seller auction creation workspace and terms UX - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the seller auction creation workspace on top of the Phase 18 seller-only eligible artwork picker. A seller can select an eligible artwork, configure safe auction terms, and preview buyer-facing auction details and policy disclosures before submission. This phase defines and validates the terms UX; backend/on-chain auction start orchestration remains Phase 20.

</domain>

<decisions>
## Implementation Decisions

### Workspace flow
- **D-01:** Keep the workflow on `/artist/auctions/create`; do not introduce a separate route for terms in Phase 19.
- **D-02:** Use a two-step workspace inside the existing page: artwork selection first, then terms form plus live preview after an eligible artwork is selected.
- **D-03:** Keep the selected artwork visible in the terms step so the seller can verify the exact inventory item before configuring economics.
- **D-04:** Do not reuse quick-sell invoice UI; auction creation needs auction-specific policy copy, timing, reserve, increment, and network disclosures.

### Auction economics
- **D-05:** Terms form must include optional reserve price, required minimum bid increment, required duration, and required shipping/payment disclosure fields.
- **D-06:** Treat a separate "starting bid" as seller-facing guidance only unless Phase 20 or a later backend policy enforces it. The current smart contract has no `startingBid` field and only enforces `minBidIncrement` for the first bid.
- **D-07:** Validation must prevent unsafe or ambiguous economics: non-positive increments, invalid ETH amounts, reserve values that are unclear to compare, missing duration, and missing required disclosures.
- **D-08:** Copy must explain that auction economics become locked after activation; Phase 19 should not imply sellers can edit reserve, increment, or duration after the auction starts.

### Timing model
- **D-09:** Duration UX should offer simple presets such as 24 hours, 3 days, and 7 days, with a custom duration option if implementation cost stays reasonable.
- **D-10:** Do not add scheduled future start in Phase 19. The current contract starts immediately when `createAuction` is called, so scheduled starts would be misleading without new backend/contract support.
- **D-11:** Preview should show start/end timing as "starts on activation" plus computed end timing from the selected duration, not as a guaranteed scheduled start.

### Preview and disclosures
- **D-12:** Preview must include artwork image/title, seller or creator name, duration/end timing, minimum bid increment, reserve disclosure, and Sepolia/network expectations.
- **D-13:** Include a policy summary before submission covering fees if available, irreversibility after activation, buyer-facing reserve behavior, network expectations, and shipping/payment disclosures.
- **D-14:** Reserve disclosure should be clear but not overpromise exact sale outcomes: if reserve is set, explain that sale only completes if final bid meets reserve; if omitted or zero, explain no reserve threshold is configured.

### Actions and draft behavior
- **D-15:** `Back` returns from terms setup to artwork selection while preserving current term inputs.
- **D-16:** `Save Draft` in Phase 19 may be local/session scoped unless a backend draft endpoint already exists during implementation. Durable backend draft persistence is not required for this phase.
- **D-17:** `Start Auction` should remain gated by validation and policy acknowledgement, but actual backend/on-chain start execution belongs to Phase 20.
- **D-18:** If implementation exposes a start button in Phase 19, it must behave as preview/disabled/hand-off copy rather than firing a fake or partial auction start request.

### the agent's Discretion
- Exact visual composition of the terms workspace and preview card, as long as it follows the existing Phase 18 seller workspace language and local component patterns.
- Exact validation helper structure and local draft persistence mechanism, as long as behavior is deterministic and type-safe.
- Exact duration preset labels and custom-duration guardrails, provided the UI does not imply future scheduling.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and phase requirements
- `.planning/PROJECT.md` - Seller auction creation milestone principles, server-authoritative policy, and Phase 19 boundary.
- `.planning/REQUIREMENTS.md` - SAUC-04, SAUC-05, and SAUC-06 requirements for terms, preview, and post-activation economics lock.
- `.planning/ROADMAP.md` - Phase 19 goal, success criteria, dependency on Phase 18, and Phase 20 boundary.

### Prior auction decisions
- `.planning/phases/17-auction-frontend-integration-with-blockchain-backed-backend-/17-CONTEXT.md` - Auction read model and backend/on-chain synchronized state decisions.
- `.planning/phases/18-seller-auction-access-and-artwork-eligibility-policy/18-CONTEXT.md` - Seller-only access, server-side eligibility policy, and deferred Phase 19 terms scope.
- `.planning/phases/18-seller-auction-access-and-artwork-eligibility-policy/18-UI-SPEC.md` - Existing seller artwork picker design contract and disabled "Continue to auction terms" handoff.

### Existing frontend surface
- `FE/artium-web/src/pages/artist/auctions/create.tsx` - Current protected seller auction creation route.
- `FE/artium-web/src/@domains/auction/views/SellerAuctionArtworkPickerPage.tsx` - Current Phase 18 eligible/blocked artwork picker to extend.
- `FE/artium-web/src/@domains/auction/hooks/useSellerAuctionArtworkCandidates.ts` - Existing candidate fetching hook.
- `FE/artium-web/src/@shared/apis/auctionApis.ts` - Current auction API client and seller candidate response types.
- `FE/artium-web/src/@domains/auction/types.ts` - Existing public auction read model fields, including bid increment and minimum next bid concepts.

### Backend and contract constraints
- `BE/libs/common/src/dtos/auctions/seller-auction-artwork-candidates.dto.ts` - Server-owned artwork eligibility DTOs and reason codes.
- `BE/apps/api-gateway/src/presentation/http/controllers/auctions.controller.ts` - Current gateway surface for seller auction candidate access.
- `BE/smart-contracts/contracts/ArtAuctionEscrow.sol` - Contract terms source of truth: `createAuction(orderId, duration, reservePrice, minBidIncrement, ipfsHash)` starts immediately and has no `startingBid`.

### Codebase conventions
- `.planning/codebase/CONVENTIONS.md` - Frontend/backend structure, TypeScript, path alias, and styling conventions.
- `.planning/codebase/INTEGRATIONS.md` - Blockchain integration, Sepolia, orders-service synchronization, and API gateway patterns.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SellerAuctionArtworkPickerPage`: already owns selected artwork state, eligible/blocked layout, non-seller guidance, and the disabled terms handoff that Phase 19 should activate.
- `useSellerAuctionArtworkCandidates`: already fetches server-authoritative seller artwork eligibility and should remain the source for artwork selection.
- `auctionApis.getSellerArtworkCandidates`: current API client surface; Phase 19 may add local terms types without creating start orchestration APIs prematurely.
- Local `Button` and seller workspace layout patterns: Phase 18 uses the existing design language and should be extended rather than replaced.

### Established Patterns
- Frontend route uses `useRequireAuth` and `SidebarLayout`; keep seller auction creation behind the same authenticated shell.
- Eligibility policy is server-side. React should not duplicate ownership or auction eligibility rules beyond rendering server-provided eligible/blocked data.
- Auction data naming uses Wei/ETH distinction in read models; terms validation should avoid ambiguous currency handling.
- The project separates planning UI from backend/on-chain lifecycle. Do not blur Phase 19 terms UX with Phase 20 start orchestration.

### Integration Points
- Extend `/artist/auctions/create` to move from selected artwork to terms setup.
- Terms step should consume the selected `SellerAuctionArtworkCandidate`.
- Preview card should use the configured terms plus selected artwork metadata, not live auction read DTOs before an auction exists.
- Future Phase 20 should be able to take the validated terms payload and connect it to idempotent backend/on-chain start flow.

</code_context>

<specifics>
## Specific Ideas

- Recommended flow approved by user: select eligible artwork, configure terms, preview buyer-facing summary, then hand off to start behavior in Phase 20.
- "Starting bid" should not be implemented as a distinct enforceable field in Phase 19 because the contract does not support it directly.
- The seller should see practical policy copy, not just form labels: reserve behavior, activation lock, Sepolia expectations, and shipping/payment responsibilities.

</specifics>

<deferred>
## Deferred Ideas

- Backend/on-chain auction start orchestration, idempotent create/start request, transaction monitoring, retry, and failure state belong to Phase 20.
- Scheduled future auction start belongs to a later backend/contract-supported phase unless Phase 20 explicitly introduces that policy.
- Durable backend draft persistence is optional for Phase 19 and should not block the terms UX unless existing backend support is discovered.

</deferred>

---

*Phase: 19-seller-auction-creation-workspace-and-terms-ux*
*Context gathered: 2026-04-25*
