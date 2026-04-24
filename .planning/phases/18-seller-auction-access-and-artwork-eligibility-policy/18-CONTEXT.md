# Phase 18: Seller auction access and artwork eligibility policy - Context

**Gathered:** 2026-04-24T17:36:54Z
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 18 establishes the seller-only access contract and the backend-owned artwork eligibility policy for choosing artwork to auction.

This phase answers who may open the seller auction creation page, which seller artworks may be selected, and how blocked artworks are explained. It does not build auction terms entry, transaction submission, on-chain auction creation, or seller auction lifecycle monitoring. Those remain Phase 19 and Phase 20 work.

</domain>

<decisions>
## Implementation Decisions

### Access Policy
- **D-01:** The auction creation entry page is seller-only. A user must be authenticated and have `UserRole.SELLER` to access it.
- **D-02:** Users without a seller role/profile should not reach the artwork picker. The UI should redirect or show a practical CTA to create/complete a seller profile.
- **D-03:** Seller profile verification is not required just to access the page in this phase. If verification exists, surface it as status or guidance, not a hard access blocker, unless a later business rule changes that.
- **D-04:** Frontend route guards are convenience only. Backend authorization is mandatory and must enforce the same seller-only policy.

### Artwork Eligibility Policy
- **D-05:** Eligible artwork must be owned by the authenticated seller. Ownership is checked server-side.
- **D-06:** Eligible artwork must be `ACTIVE`, published, quantity `1`, and not sold, deleted, reserved, inactive, pending review, or already in auction.
- **D-07:** Eligible artwork must not already have an `onChainAuctionId`.
- **D-08:** Eligible artwork must have a primary image and enough display metadata for an auction card: title plus creator or equivalent seller-facing attribution metadata.
- **D-09:** Multi-quantity artworks are blocked for auction creation in this phase because the current auction flow sells a single artwork instance and should not create ambiguous inventory accounting.
- **D-10:** If an active order or auction lock exists for the artwork, it is blocked even if the artwork entity itself otherwise looks eligible.

### Eligibility Response Contract
- **D-11:** The backend should return both eligible and blocked seller artworks for the auction picker.
- **D-12:** Blocked artworks must include stable reason codes and seller-facing recovery hints so the frontend can explain why the item cannot be selected without duplicating rules.
- **D-13:** Eligibility logic belongs on the backend. The frontend may render the result, filter display groups, and show explanations, but must not reimplement the source-of-truth policy.

### Route And UX Entry
- **D-14:** The seller auction creation entry point should live in the seller/artist workspace. Recommended route: `/artist/auctions/create`.
- **D-15:** Inventory can link or deep-link into the auction creation page, but the picker page remains the canonical place for selecting artwork for auction.
- **D-16:** Blocked access should be explicit: unauthenticated users go to auth; non-sellers see seller onboarding/profile guidance; sellers with no eligible artworks see reasons and recovery paths.

### Authorization Source
- **D-17:** Auction eligibility endpoints must derive seller identity from the authenticated request/JWT/current user.
- **D-18:** The auction eligibility endpoint must not trust a client-supplied `sellerId`. Existing general artwork listing APIs can keep their current filter semantics, but the auction-specific path must be scoped to the current seller.

### the agent's Discretion
- Planner may choose exact DTO names, reason-code enum names, and whether the endpoint lives behind the API gateway artwork controller or a new auction/seller controller, as long as the policy above is enforced server-side and reusable by the frontend.
- Planner may choose whether blocked artworks are returned in a single mixed list with `eligibility` metadata or in `{ eligible, blocked }` groups, as long as reason codes and recovery hints are present.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning And Requirements
- `.planning/PROJECT.md` — v1.1 milestone principles and non-negotiables for seller auction creation.
- `.planning/REQUIREMENTS.md` — SAUC-01, SAUC-02, and SAUC-03 define Phase 18 acceptance expectations.
- `.planning/ROADMAP.md` — Phase 18 boundary, dependencies, and success criteria.
- `.planning/phases/17-auction-frontend-integration-with-blockchain-backed-backend-/17-CONTEXT.md` — prior auction read/lifecycle decisions and deferred seller auction management surface.

### Backend Access And Roles
- `BE/libs/common/src/enums/user-role.enum.ts` — canonical `UserRole.SELLER` role value.
- `BE/libs/auth/src/guards/roles.guard.ts` — existing Nest role guard pattern.
- `BE/libs/auth/src/decorators/current-user.decorator.ts` — current-user extraction pattern available to controllers.
- `BE/apps/api-gateway/src/presentation/http/controllers/artwork/artwork.controller.ts` — existing artwork API gateway patterns and current JWT usage.
- `BE/apps/api-gateway/src/presentation/http/controllers/identity/seller-profiles.controller.ts` — seller profile routes and verification/visibility context.

### Artwork And Auction State
- `BE/apps/artwork-service/src/domain/entities/artworks.entity.ts` — artwork ownership, lifecycle, image, quantity, publication, and auction fields.
- `BE/libs/common/src/enums/artwork-status.enum.ts` — lifecycle statuses including `IN_AUCTION`.
- `BE/apps/orders-service/src/domain/entities/orders.entity.ts` — order state used to detect active order/auction conflicts.
- `BE/libs/common/src/enums/order-status.enum.ts` — order statuses including auction-active state.
- `BE/apps/orders-service/src/application/queries/handlers/GetAuctions.query.handler.ts` — current auction read model mapping and on-chain fallback behavior.

### Frontend Seller Workspace
- `FE/artium-web/src/pages/inventory/index.tsx` — authenticated seller inventory route shell.
- `FE/artium-web/src/@domains/inventory/views/InventoryPage.tsx` — current seller inventory loading pattern using authenticated user context.
- `FE/artium-web/src/@shared/apis/artworkApis.ts` — existing frontend artwork API adapter and artwork item shape.
- `FE/artium-web/src/pages/artist/invoices/create.tsx` — existing seller/artist workspace route convention.
- `FE/artium-web/src/@domains/quick-sell/views/QuickSellCreateInvoicePageView.tsx` — existing seller artwork selection precedent for commercial workflows.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UserRole.SELLER` and `RolesGuard`: existing backend authorization primitives should be reused for seller-only access.
- `JwtAuthGuard` and request `user`: existing API gateway controllers already pass authenticated user context into service calls.
- Inventory artwork components and mappers: the auction picker can reuse existing artwork card/list display assets, but should consume backend eligibility metadata instead of duplicating policy.
- Quick Sell artwork selection flow: useful UX precedent for selecting seller-owned artwork, but auction eligibility is stricter.

### Established Patterns
- The frontend currently scopes inventory by `user.id` and calls artwork APIs with `sellerId`. Phase 18 should improve this for auction selection by deriving seller identity server-side.
- Artwork service owns artwork lifecycle fields such as `status`, `quantity`, `isPublished`, `images`, and `onChainAuctionId`.
- Orders service is the auction read/lifecycle source for public auction state after Phase 17.

### Integration Points
- Add an auction-specific seller eligibility endpoint through the API gateway so FE does not call generic artwork listing with arbitrary `sellerId`.
- Eligibility should check artwork ownership in artwork-service and active order/auction conflicts in orders-service or a backend orchestration layer.
- FE route `/artist/auctions/create` should require auth and seller capability before loading candidate artworks.

</code_context>

<specifics>
## Specific Ideas

- Use reason codes such as `NOT_OWNED`, `NOT_ACTIVE`, `NOT_PUBLISHED`, `SOLD`, `DELETED`, `RESERVED`, `IN_AUCTION`, `HAS_ON_CHAIN_AUCTION`, `MULTI_QUANTITY`, `MISSING_PRIMARY_IMAGE`, `MISSING_METADATA`, and `ACTIVE_ORDER_LOCK` or equivalent stable names.
- Keep blocked items visible enough for sellers to understand recovery, instead of silently hiding everything and creating confusion.

</specifics>

<deferred>
## Deferred Ideas

- Auction terms entry, reserve price, minimum bid increment, duration, and preview belong to Phase 19.
- Idempotent auction start, transaction submission, on-chain/off-chain synchronization, retry, and seller lifecycle monitoring belong to Phase 20.

</deferred>

---

*Phase: 18-seller-auction-access-and-artwork-eligibility-policy*
*Context gathered: 2026-04-24T17:36:54Z*
