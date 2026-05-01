# Roadmap: Artium Frontend Component Standardization

## Overview

This milestone standardizes the frontend component layer domain-by-domain, starting with the infrastructure that makes safe migration possible (audit, barrel exports, prop contracts, regression tooling), then building the shared form primitives that every domain will delegate to, and finally migrating each domain in ROI order: highest-duplication form domains first (auth, checkout, quick-sell), then library-retirement domains (profile, events), then structural consolidation of modals and display components. Every phase preserves existing UI and behavior exactly — no visual or behavioral changes ship.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Safety Setup** - Audit, barrel exports, prop API contracts, and regression tooling in place before any migration begins
- [ ] **Phase 2: Shared Component Layer** - Shared form primitives built on `@shared/components/ui/form`, RHF-compatible, with locked prop APIs
- [ ] **Phase 3: Auth, Checkout & Quick-Sell Migration** - Highest-duplication form domains delegate to shared components; pixel-level regressions verified
- [ ] **Phase 4: Profile & Events Domain Migration** - Third-party library retirement and cross-domain import safety resolved
- [ ] **Phase 5: Modal, Display & Remaining Domains** - Modal consolidation, display card unification, and remaining domain barrel completion
- [ ] **Phase 6: Artwork Checkout — Stripe Card + Crypto Wallet Payment** - Complete the Stripe card confirm flow, add MetaMask/ETH wallet payment path, Stripe webhook handling with Outbox events, and inline error UX
- [ ] **Phase 7: Checkout Payment Feedback — Success & Error UI States** - After pay-now, show success/error states inline with retry-friendly UX
- [ ] **Phase 8: Wallet Payment Correctness** - Fix USD→ETH handling, wallet transaction state wiring, and Ethereum checkout end-to-end correctness
- [ ] **Phase 9: Checkout Completion & Webhook Alignment** - Canonicalize Stripe webhook handling and finish retry/success behavior across checkout outcomes
- [ ] **Phase 10: Checkout Traceability & Validation Closure** - Restore PAY/UX traceability and create the verification evidence needed for milestone re-audit

## Phase Details

### Phase 1: Foundation & Safety Setup
**Goal**: All prerequisite infrastructure is in place so no migration can cause silent import breakage, color regressions, or unverified behavior changes
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, SAFE-01, SAFE-02
**Success Criteria** (what must be TRUE):
  1. Developer can view a complete audit spreadsheet listing every domain component with a migrate/wrap/leave-alone decision and priority
  2. Developer can find a barrel `index.ts` in every domain `components/` directory (all 13 previously-missing barrels created)
  3. Developer can reference a locked TypeScript prop interface for every shared form component before a single line of implementation is written
  4. Developer can run a deterministic before/after screenshot diff on any form field surface and detect pixel-level visual differences prior to committing
  5. Developer can consult a design token audit that maps every CSS variable (`--destructive`, `--muted-foreground`, etc.) to its resolved hex value, confirming which domains use semantic tokens vs. literal hex
**Plans**: TBD
**UI hint**: yes

### Phase 2: Shared Component Layer
**Goal**: Shared form primitives exist with locked prop APIs, full RHF compatibility, and a backward-compat wrapper pattern that makes every future domain migration a one-file swap
**Depends on**: Phase 1
**Requirements**: SHR-01, SHR-02, SHR-03
**Success Criteria** (what must be TRUE):
  1. Developer can import `FormInputField`, `FormPasswordField`, `FormTextareaField`, and `FormSelectField` from `@shared/components/forms/` with zero TypeScript errors under `strict: true`
  2. Developer can use any shared form component with React Hook Form's `register()` spread or `Controller` without adding manual `forwardRef` plumbing at the call site
  3. Developer can create a domain wrapper in one file that keeps the old export name and delegates entirely to the new shared component — zero changes required at any existing call site
  4. Developer can verify each new shared component renders with class-for-class identical Tailwind output to the original implementations it replaces (literal pixel values preserved: `h-[44px]`, hex colors verbatim)
**Plans**: TBD
**UI hint**: yes

### Phase 3: Auth, Checkout & Quick-Sell Migration
**Goal**: Auth, checkout, and quick-sell domain form components delegate to shared components with zero visible or behavioral change — verified by screenshot diff
**Depends on**: Phase 2
**Requirements**: MIG-01, MIG-02
**Success Criteria** (what must be TRUE):
  1. Developer can inspect the checkout domain and find zero raw `Input + label + span` patterns with local `const inputClass` strings — all replaced by domain wrappers delegating to shared components
  2. Developer can submit checkout and quick-sell forms with invalid data and see correct error states appear on every field (no silent suppression from mismatched `hasError` props)
  3. Developer can view a before/after screenshot diff for every form field in checkout, quick-sell, and auth flows and confirm pixel-identical rendering
  4. Developer can confirm `AuthInput` and `PasswordInput` have `displayName` set and delegate correctly to shared form primitives
**Plans**: TBD
**UI hint**: yes

### Phase 4: Profile & Events Domain Migration
**Goal**: Profile retires its third-party libraries with behavioral parity verified; events domain resolves cross-domain import risks so `home` domain consumers are unaffected
**Depends on**: Phase 3
**Requirements**: MIG-03
**Success Criteria** (what must be TRUE):
  1. Developer can remove `react-select`, `react-international-phone`, and `react-select-country-list` from `package.json` and confirm the build passes with zero errors
  2. Developer can confirm `editProfileStyles.ts` is deleted — no file in the codebase imports it
  3. Developer can use the profile country picker (keyboard navigation, flag+name display, search filter) and observe behavior identical to the previous `react-select` implementation
  4. Developer can import event types from the events domain barrel (`@domains/events`) without referencing internal component file paths — all types moved to `@domains/events/types/`
  5. Developer can submit profile forms with invalid data and see error states on every field (no silent error suppression from prop mismatch)
**Plans**: TBD
**UI hint**: yes

### Phase 5: Modal, Display & Remaining Domains
**Goal**: All remaining domain components (modals, display cards, skeletons, messaging/discover/portfolio) delegate to shared implementations, completing 100% migration coverage
**Depends on**: Phase 4
**Requirements**: MIG-04
**Success Criteria** (what must be TRUE):
  1. Developer can import `ConfirmActionModal` and `ShareModal` from `@shared/components/modals/` and confirm that all domain-level modal variants (`ConfirmDeleteModal`, `DeleteConfirmDialog`, `ShareSocialModal`, `ShareEventModal`, `SharePortfolioModal`) delegate to them with no behavior change
  2. Developer can import `ArtworkCard` from `@shared/components/display/` with a `variant` prop and confirm it replaces the four previously-separate card implementations with identical hover overlays, link targets, and data shapes
  3. Developer can inspect all remaining domains (`messaging`, `discover`, `portfolio`, `inventory-upload`) and find zero raw `animate-pulse` inline skeleton patterns — all replaced by `SkeletonCard`/`SkeletonRow`/`SkeletonAvatar` from `@shared/components/display/`
  4. Developer can grep the entire codebase for cross-domain deep imports (`@domains/A` importing internal paths of `@domains/B`) and get zero results
**Plans**: TBD
**UI hint**: yes

### Phase 6: Artwork Checkout — Stripe Card + Crypto Wallet Payment
**Goal**: Buyers can complete artwork purchase via either Stripe card or MetaMask ETH wallet, with proper payment intent confirmation, Stripe webhook processing, Outbox-published events, and zero `alert()` UX
**Depends on**: Independent (no dependency on phases 1–5)
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04
**Success Criteria** (what must be TRUE):
  1. Developer can open the checkout page, complete the payment step with card details, and observe both `createPaymentIntent` and `confirmPaymentIntent` called in sequence — no `alert()` dialogs
  2. Developer can select "Crypto Wallet" and connect MetaMask to see a connected address displayed inline (or an inline error if MetaMask is absent)
  3. Developer can POST a valid Ethereum payment to `POST /payments/ethereum` and see a `PaymentTransaction` row with `provider = 'ETHEREUM'` and an outbox row with `event_type = 'EthereumPaymentRecorded'`
  4. Developer can POST a simulated Stripe `payment_intent.succeeded` webhook and see the transaction updated to `SUCCEEDED` with an outbox row with `routing_key = 'payment.succeeded'`
  5. Developer can submit the same `txHash` twice and receive a 409 Conflict response
**Plans**: `.planning/phases/6/PLAN.md`
**UI hint**: yes

### Phase 7: Checkout Payment Feedback — Success & Error UI States
**Goal**: After "Pay Now" succeeds, buyers see an inline success screen (step 3) with order confirmation, artwork summary, what-happens-next info, and a CTA. Payment failures show specific, retry-friendly inline error states — no silent page transitions, no generic messages.
**Depends on**: Phase 6
**Requirements**: UX-01, UX-02, UX-03
**Success Criteria** (what must be TRUE):
  1. Developer can complete a card or wallet payment and see the checkout page transition to a step-3 success screen — no `alert()`, no immediate redirect — showing the order number, artwork title, and "What happens next" steps
  2. Developer can click "Continue Shopping" on the success screen and land on `/discover` with the `?checkout=success` query param absent from the URL
  3. Developer can trigger a card decline and see a specific inline error (e.g. "Your card was declined. Please check your details or try a different card.") with a "Try Again" button that resets the payment form without losing contact info from step 1
  4. Developer can trigger a network/API failure during payment and see a generic inline error with a "Retry" action that re-submits without re-entering data
  5. Developer can trigger a wallet rejection (user cancels MetaMask prompt) and see an inline error in the `WalletPaymentSection` with a "Retry Connection" action
  6. `npx tsc --noemit` exits 0 and `npm run build` exits 0 after all changes
**Plans**: `.planning/phases/7/PLAN.md`
**UI hint**: yes

### Phase 8: Wallet Payment Correctness
**Goal**: Wallet checkout uses a verified ETH amount and consistent transaction state so MetaMask payments can complete end-to-end without stale form state or currency mismatches.
**Depends on**: Phase 6
**Requirements**: PAY-02, PAY-03
**Gap Closure**: Closes wallet amount and Ethereum checkout flow gaps from `v1.0-MILESTONE-AUDIT`
**Success Criteria** (what must be TRUE):
  1. Developer can send a MetaMask transaction only with an explicit ETH amount/quote — never the raw USD checkout total
  2. Developer can disconnect, reconnect, or retry wallet payment without stale `walletAddress` / `txHash` state keeping Pay Now enabled incorrectly
  3. Developer can record a successful wallet payment through `POST /payments/ethereum` with frontend and backend amount/currency metadata aligned
  4. Developer can re-run duplicate txHash and wallet rejection scenarios and see correct recovery / conflict behavior
**Plans**: TBD
**UI hint**: yes

### Phase 9: Checkout Completion & Webhook Alignment
**Goal**: Checkout completion UX and Stripe webhook ownership are consistent, retry-friendly, and verifiable across card and wallet outcomes.
**Depends on**: Phase 8
**Requirements**: PAY-04, UX-01, UX-02
**Gap Closure**: Closes webhook ambiguity plus success/error UX gaps from `v1.0-MILESTONE-AUDIT`
**Success Criteria** (what must be TRUE):
  1. Developer can configure Stripe to hit one canonical webhook entry point and observe `payment_intent.succeeded` / `payment_intent.payment_failed` update transactions and outbox events through that path
  2. Developer can trigger card decline, network/API failure, and wallet rejection flows and see specific inline retry states without losing step-1 checkout data
  3. Developer can complete a card or wallet payment and remain on inline success / processing UI until the user chooses the CTA
  4. Developer can confirm no duplicate terminal payment transitions are emitted across gateway and payments-service webhook surfaces
**Plans**: TBD
**UI hint**: yes

### Phase 10: Checkout Traceability & Validation Closure
**Goal**: Checkout payment requirements, verification artifacts, and milestone validation are restored so the checkout milestone can be re-audited against evidence instead of summaries alone.
**Depends on**: Phase 9
**Requirements**: PAY-01, UX-03
**Gap Closure**: Closes missing REQUIREMENTS traceability, VERIFICATION, and VALIDATION gaps from `v1.0-MILESTONE-AUDIT`
**Success Criteria** (what must be TRUE):
  1. Developer can open `REQUIREMENTS.md` and find PAY-01..04 and UX-01..03 mapped to active phases with status aligned to reality
  2. Developer can open phases 6-10 and find the missing summary / verification / validation artifacts needed to prove coverage
  3. Developer can re-run milestone audit and see the previous orphan / verification gaps removed or reduced to remaining code-only issues
  4. Developer can reference the required FE validation commands (`npx tsc --noemit`, `npm run build`) directly in checkout verification evidence
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5. Phase 6 is independent. Phase 7 depends on Phase 6. Gap-closure phases execute 8 → 9 → 10 after the current checkout phases.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Safety Setup | 0/TBD | Not started | - |
| 2. Shared Component Layer | 0/TBD | Not started | - |
| 3. Auth, Checkout & Quick-Sell Migration | 0/TBD | Not started | - |
| 4. Profile & Events Domain Migration | 0/TBD | Not started | - |
| 5. Modal, Display & Remaining Domains | 0/TBD | Not started | - |
| 6. Artwork Checkout — Stripe Card + Crypto Wallet Payment | 5/5 | Planned | - |
| 7. Checkout Payment Feedback — Success & Error UI States | 1/1 | Planned | - |
| 8. Wallet Payment Correctness | 0/TBD | Not started | - |
| 9. Checkout Completion & Webhook Alignment | 0/TBD | Not started | - |
| 10. Checkout Traceability & Validation Closure | 0/TBD | Not started | - |
