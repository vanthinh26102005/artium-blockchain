# Requirements: Artium Frontend Component Standardization

**Defined:** 2026-04-21
**Core Value:** Ship a reusable shared component layer that reduces duplication across domains without changing current user-facing UI or business logic.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FND-01**: Developers can view a complete audit/inventory map of duplicated domain components and migration targets.
- [ ] **FND-02**: Developers can use a locked canonical component prop contract (naming + typing) across shared form/input components.
- [ ] **FND-03**: Developers can import standardized components through stable barrel exports in shared and domain layers.

### Shared Component Layer

- [ ] **SHR-01**: Developers can use shared form primitives (`FormInput`, `FormTextarea`, `FormLabel`, `FormError`) built on existing shared UI primitives.
- [ ] **SHR-02**: Developers can integrate shared form primitives with React Hook Form safely via `forwardRef` and compatible field/error wiring.
- [ ] **SHR-03**: Developers can keep existing domain-level imports working through backward-compatible wrapper components.

### Migration Rollout

- [ ] **MIG-01**: Developers can migrate `auth` domain components to shared components without UI or behavior change.
- [ ] **MIG-02**: Developers can migrate `checkout` and `quick-sell` domain components to shared components without UI or behavior change.
- [ ] **MIG-03**: Developers can migrate `profile` and `events` domain components to shared components without UI or behavior change.
- [ ] **MIG-04**: Developers can migrate remaining domain component implementations to shared components using phased domain-by-domain rollout in the same milestone.

### Safety & Verification

- [ ] **SAFE-01**: Developers can verify no visual regressions during migration using deterministic before/after checks for migrated component surfaces.
- [ ] **SAFE-02**: Developers can verify no logic regressions in migrated domains by preserving existing domain API contracts and behavior.
- [ ] **SAFE-03**: Developers can clear known frontend TypeScript blockers in supporting order/auth/artwork flows before closing follow-up polish phases that depend on them.

### Checkout Payments

- [ ] **PAY-01**: Developers can complete checkout card payments end-to-end using a Stripe PaymentIntent confirmed in the same Stripe account context that collected the card details.
- [ ] **PAY-02**: Developers can connect MetaMask and submit wallet payments only on Sepolia testnet with a verified ETH amount, never by treating the raw USD checkout total as ETH or allowing checkout on the wrong chain.
- [ ] **PAY-03**: Developers can record Ethereum payments through `POST /payments/ethereum` with consistent amount/currency metadata and duplicate `txHash` protection.
- [ ] **PAY-04**: Developers can process Stripe webhook terminal events through one canonical entry point that updates transactions and outbox events correctly.

### Checkout Payment Feedback

- [ ] **UX-01**: Developers can keep checkout users on an inline success or processing screen after Pay Now instead of redirecting away immediately.
- [ ] **UX-02**: Developers can show retry-friendly inline error and recovery states for card, network, and wallet failures without losing checkout step-1 data.
- [ ] **UX-03**: Developers can validate checkout payment changes with build/typecheck evidence and phase verification artifacts before the milestone is marked complete.

### Order Tracking & Management

- [ ] **ORD-01**: Developers can provide authenticated users with a private orders workspace that shows only the purchases or sales they are authorized to access.
- [ ] **ORD-02**: Developers can present professional order list and detail views with lifecycle status, artwork/payment/shipping summaries, and responsive empty/loading/error states.
- [ ] **ORD-03**: Developers can expose only status-valid order actions to the correct role, including buyer delivery/dispute flows and seller shipment flows, with server-side access enforcement.
- [ ] **ORD-04**: Developers can present payment and shipping records on order detail with copyable identifiers and lifecycle-accurate messaging instead of generic placeholders.

## v1.1 Requirements

Milestone focus: seller-only auction creation from owned inventory with practical business policy enforcement.

### Seller Auction Access & Eligibility

- [x] **SAUC-01**: Sellers can access a protected auction creation workspace only when authenticated and recognized as seller-capable; non-sellers are blocked by both frontend route guards and backend authorization.
- [x] **SAUC-02**: Sellers can choose only artworks they own from inventory, with the picker excluding sold, deleted, already-auctioned, active-order, multi-quantity, or incomplete artwork records.
- [x] **SAUC-03**: Sellers can see clear eligibility reasons and recovery actions when an artwork cannot be auctioned, such as completing required metadata, uploading a primary image, or resolving an active listing/order state.
- [ ] **SAUC-10**: Authenticated non-sellers can register a seller profile from profile settings, with backend seller role activation performed server-side in the same transaction as seller profile creation and without auto-granting verification or payment onboarding.

### Auction Terms & Policy

- [ ] **SAUC-04**: Sellers can configure auction terms with validated starting bid, optional reserve policy, minimum bid increment, duration/start/end timing, and shipping/payment disclosures before starting the auction.
- [ ] **SAUC-05**: Sellers can preview the final auction card and policy summary before submission, including fees, irreversibility after activation, Sepolia/network expectations, and buyer-facing disclosures.
- [ ] **SAUC-06**: Sellers cannot edit unsafe auction economics after activation; only explicitly safe lifecycle actions remain available according to auction state.

### Auction Start & Lifecycle Truth

- [ ] **SAUC-07**: Backend can start an auction idempotently only after validating seller identity, artwork ownership, artwork eligibility, seller wallet/profile readiness, and contract/network configuration.
- [ ] **SAUC-08**: Backend can persist the auction start across on-chain and off-chain state so public `GET /auctions` and seller inventory/order views reflect the new auction without mock data.
- [ ] **SAUC-09**: Sellers can monitor auction start status across pending, active, failed, and retryable states with tx hash, reason codes, and recovery paths that do not duplicate auctions.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Tooling & Design System Enhancements

- **V2-01**: Developers can use a visual component documentation layer (e.g., Storybook-like catalog) for shared component discoverability.
- **V2-02**: Developers can standardize variant-heavy component styling with broader CVA-based variant architecture.
- **V2-03**: Developers can standardize complex multi-step form shells after leaf-level field migration is complete.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Visual redesign (layout/spacing/colors/typography) | Explicitly prohibited by project scope |
| New end-user features | This milestone is refactor-only |
| Backend/API/business logic changes | Not required for component standardization |
| Single giant all-domain migration change | Higher regression risk; phased rollout required |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Pending |
| FND-02 | Phase 1 | Pending |
| FND-03 | Phase 1 | Pending |
| SAFE-01 | Phase 1 | Pending |
| SAFE-02 | Phase 1 | Pending |
| SAFE-03 | Phase 14 | Pending |
| SHR-01 | Phase 2 | Pending |
| SHR-02 | Phase 2 | Pending |
| SHR-03 | Phase 2 | Pending |
| MIG-01 | Phase 3 | Pending |
| MIG-02 | Phase 3 | Pending |
| MIG-03 | Phase 4 | Pending |
| MIG-04 | Phase 5 | Pending |
| PAY-01 | Phase 10 | Pending |
| PAY-02 | Phase 8 | Pending |
| PAY-03 | Phase 8 | Pending |
| PAY-04 | Phase 9 | Pending |
| UX-01 | Phase 9 | Pending |
| UX-02 | Phase 9 | Pending |
| UX-03 | Phase 10 | Pending |
| ORD-01 | Phase 12 | Pending |
| ORD-02 | Phase 12 | Pending |
| ORD-03 | Phase 12 | Pending |
| ORD-04 | Phase 14 | Pending |
| SAUC-01 | Phase 18 | Completed |
| SAUC-02 | Phase 18 | Completed |
| SAUC-03 | Phase 18 | Completed |
| SAUC-10 | Phase 19.1 | Pending |
| SAUC-04 | Phase 19.1 | Pending |
| SAUC-05 | Phase 19.1 | Pending |
| SAUC-06 | Phase 20 | Pending |
| SAUC-07 | Phase 20 | Pending |
| SAUC-08 | Phase 20 | Pending |
| SAUC-09 | Phase 20 | Pending |

**Coverage:**
- v1 + v1.1 requirements: 34 total
- Mapped to phases: 34 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-21*
*Last updated: 2026-04-27 after milestone gap planning for seller auction creation*
