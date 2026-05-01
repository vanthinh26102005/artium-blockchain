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

### Checkout Payments

- [ ] **PAY-01**: Developers can complete checkout card payments end-to-end using a Stripe PaymentIntent confirmed in the same Stripe account context that collected the card details.
- [ ] **PAY-02**: Developers can connect MetaMask and submit wallet payments only with a verified ETH amount, never by treating the raw USD checkout total as ETH.
- [ ] **PAY-03**: Developers can record Ethereum payments through `POST /payments/ethereum` with consistent amount/currency metadata and duplicate `txHash` protection.
- [ ] **PAY-04**: Developers can process Stripe webhook terminal events through one canonical entry point that updates transactions and outbox events correctly.

### Checkout Payment Feedback

- [ ] **UX-01**: Developers can keep checkout users on an inline success or processing screen after Pay Now instead of redirecting away immediately.
- [ ] **UX-02**: Developers can show retry-friendly inline error and recovery states for card, network, and wallet failures without losing checkout step-1 data.
- [ ] **UX-03**: Developers can validate checkout payment changes with build/typecheck evidence and phase verification artifacts before the milestone is marked complete.

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

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-21*
*Last updated: 2026-04-23 after checkout gap-closure phase planning*
