# Roadmap: Artium Blockchain Marketplace

## Overview

This roadmap tracks sequential milestone work across the Artium platform. Earlier phases covered frontend standardization, checkout/order flows, seller auction creation, inventory actions, and backend contract cleanup. Current active work starts the v1.3 order invoice preview and export milestone at Phase 30.

Phases 21-26 previously covered a v1.2 backend deployment strategy. On 2026-04-29, the user marked that scope intentionally redundant and omitted it from active milestone closure. Historical artifacts remain in `.planning/phases/`, but these phases are no longer blockers for active work. Current active work resumes at Phase 27.

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
- [ ] **Phase 11: Wallet Checkout Pay-Now Orchestration & Success Redirect** - Move wallet order creation/send flow behind the main Pay Now action and return successful wallet checkouts to the success screen
- [x] **Phase 18: Seller auction access and artwork eligibility policy** - Define and enforce seller-only access plus own-inventory eligibility before auction setup
- [x] **Phase 19: Seller auction creation workspace and terms UX** - Let sellers pick eligible artwork, configure compliant terms, and preview auction policy before submission
- [x] **Phase 20: Auction start orchestration and seller lifecycle status** - Start auctions idempotently through backend/on-chain flow and expose pending/active/failed status to sellers (completed 2026-04-29)
- [x] **Phase 27: Frontend shared API definition standardization and edge-case audit** - Standardize frontend shared API request behavior while preserving existing module exports (completed 2026-04-29)
- [x] **Phase 28: Artwork upload draft backend gap audit and contract cleanup** - Audit `/artworks/upload?draftArtworkId=...` against backend draft-artwork APIs, close contract gaps, and keep the implementation clean (completed 2026-04-29)
- [x] **Phase 29: Inventory artwork actions and profile visibility** - Implement backend-backed inventory edit/delete/profile visibility and safe auction handoff behavior (completed 2026-04-29)
- [x] **Phase 30: Order-linked invoice backend contract and materialization** - Expose authorization-safe order invoice reads and idempotently materialize missing invoices from canonical order/payment data (completed 2026-04-30)
- [ ] **Phase 31: Orders invoice preview and extraction UI** - Add invoice actions, preview, and print/download-ready extraction to the Orders workspace using a professional document layout
- [ ] **Phase 32: Order invoice validation and milestone closure** - Verify backend authorization, frontend behavior, responsive UI quality, extraction output, and milestone evidence

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
**Plans**: `20-01-PLAN.md`, `20-02-PLAN.md`, `20-03-PLAN.md`, `20-04-PLAN.md`
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
**Goal**: Wallet checkout uses a verified Sepolia ETH amount, Sepolia-only chain enforcement, and consistent transaction state so MetaMask payments can complete end-to-end without stale form state or currency mismatches.
**Depends on**: Phase 6
**Requirements**: PAY-02, PAY-03
**Gap Closure**: Closes wallet amount and Ethereum checkout flow gaps from `v1.0-MILESTONE-AUDIT`
**Success Criteria** (what must be TRUE):
  1. Developer can send a MetaMask transaction only with an explicit ETH amount/quote for **Sepolia testnet** — never the raw USD checkout total
  2. Developer can attempt wallet checkout on the wrong MetaMask network and see inline blocking UX or an explicit switch-to-Sepolia path before **Send ETH** / **Pay Now** can proceed
  3. Developer can disconnect, reconnect, or retry wallet payment without stale `walletAddress` / `txHash` state keeping Pay Now enabled incorrectly
  4. Developer can record a successful wallet payment through `POST /payments/ethereum` with frontend and backend amount/currency metadata aligned
  5. Developer can re-run duplicate txHash and wallet rejection scenarios and see correct recovery / conflict behavior
**Plans**: `.planning/phases/8/PLAN.md`
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

### Phase 11: Wallet Checkout Pay-Now Orchestration & Success Redirect
**Goal**: Wallet checkout behaves like the card flow at the page level: the wallet panel shows quote/network details only, the main checkout `Pay Now` action owns order creation plus MetaMask submission orchestration, and a successful wallet payment returns the buyer to the checkout success screen instead of leaving them in an intermediate wallet-only state.
**Depends on**: Phase 8
**Requirements**: PAY-01, PAY-02, UX-01
**Success Criteria** (what must be TRUE):
  1. Developer can open the wallet payment step and see quote, network, and wallet details without a standalone `Send ... ETH on Sepolia` submit button inside the wallet section
  2. Developer can click the main checkout `Pay Now` button while using wallet checkout and observe that button take responsibility for order creation, quote freshness validation, and MetaMask transaction initiation in one coordinated flow
  3. Developer can complete a wallet checkout successfully and land on the same checkout success / processing screen used by the rest of the checkout flow
  4. Developer can retry or back out of wallet checkout without orphaning a created order or leaving stale in-flight wallet state attached to the form
  5. Developer can inspect the implementation and find the wallet orchestration split into clean responsibilities across page orchestration, wallet presentation, and payment API boundaries rather than burying checkout control flow inside the wallet component
**Plans**: `.planning/phases/11-wallet-checkout-pay-now-orchestration-and-success-redirect/PLAN.md`
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5. Phase 6 is independent. Phase 7 depends on Phase 6. Gap-closure phases execute 8 → 9 → 10 → 11 after the current checkout phases. Phase 12 follows Phase 11. Phase 13 follows Phase 12. Phase 14 follows Phase 13. Phase 15 follows Phase 14. Phase 16 follows Phase 15. Phase 17 follows Phase 16. Seller auction creation proceeds 18 → 18.1 → 19 → 19.1 → 20 after the buyer-facing auction read/bid flow exists. Phases 21-26 are intentionally omitted/redundant as of 2026-04-29, so active work resumes at Phase 27. Phase 28 follows Phase 27 and focuses the next backend accuracy pass on the artwork upload draft flow. Phase 29 completes inventory edit/delete/profile visibility and auction handoff. v1.3 order invoice work proceeds 30 → 31 → 32.

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
| 11. Wallet Checkout Pay-Now Orchestration & Success Redirect | 0/TBD | Not started | - |
| 12. Private order tracking and management for buyers and sellers | 1/1 | Planned | - |
| 13. Wallet payment confirmation with asynchronous retryable idempotent background processor | 0/TBD | Not started | - |
| 14. Order detail copy actions, shipping logic alignment, and TypeScript stabilization | 1/1 | Planned | - |
| 15. Shared text-entry form standardization and cross-domain refactor | 1/1 | Planned | - |
| 16. Shared form field standardization and multi-domain text-entry migration | 1/1 | Planned | - |
| 17. Auction frontend integration with blockchain-backed backend flow and live auction state sync | 3/3 | Completed | 2026-04-24 |
| 18. Seller auction access and artwork eligibility policy | 3/3 | Completed | 2026-04-25 |
| 18.1. Seller registration and role activation gap closure | 1/1 | Completed | 2026-04-25 |
| 19. Seller auction creation workspace and terms UX | 3/3 | Completed | 2026-04-27 |
| 19.1. Seller auction artifact recovery and policy alignment | 3/3 | Completed | 2026-04-27 |
| 20. Auction start orchestration and seller lifecycle status | 4/4 | Complete    | 2026-04-29 |
| 21-26. Backend deployment strategy scope | historical artifacts retained | Omitted/redundant | 2026-04-29 |
| 27. Frontend shared API definition standardization and edge-case audit | 4/4 | Complete    | 2026-04-29 |
| 28. Artwork upload draft backend gap audit and contract cleanup | 3/3 | Complete   | 2026-04-29 |
| 29. Inventory artwork actions and profile visibility | 3/3 | Complete | 2026-04-29 |
| 30. Order-linked invoice backend contract and materialization | 2/2 | Complete    | 2026-04-30 |
| 31. Orders invoice preview and extraction UI | 0/2 | Planned    |  |
| 32. Order invoice validation and milestone closure | 0/TBD | Not started | - |

### Phase 12: Private order tracking and management for buyers and sellers

**Goal:** Authenticated users can review and manage their purchases or sales through a professional private orders workspace built on existing dashboard patterns, with role-aware actions and server-scoped access.
**Requirements**: ORD-01, ORD-02, ORD-03
**Depends on:** Phase 11
**Success Criteria** (what must be TRUE):
  1. Developer can visit a private orders workspace and switch between purchase and sales views without using the public profile tabs
  2. Developer can see only orders they are authorized to access, with list cards/rows showing order number, artwork, status, total, payment method, and created date
  3. Developer can open an order detail page and review timeline, artwork summary, payment details, shipping information, and next available action in one place
  4. Developer can perform role-valid actions only: buyers can confirm delivery or open disputes when eligible, sellers can mark shipped when eligible, and invalid actions stay hidden or disabled with clear explanation
  5. Developer can inspect the implementation and find the UI aligned with existing inventory/invoice/dashboard patterns rather than a new visual system
**Plans**: `.planning/phases/12-private-order-tracking-and-management-for-buyers-and-sellers/PLAN.md`
**UI hint**: yes

### Phase 13: Wallet payment confirmation with asynchronous retryable idempotent background processor

**Goal:** Wallet checkout moves from browser-assumed success to backend-confirmed success, using an asynchronous, retryable, idempotent Sepolia confirmation processor that advances recorded wallet payments and linked orders only after receipt verification succeeds.
**Requirements**: PAY-02, PAY-03, ORD-01
**Depends on:** Phase 12
**Success Criteria** (what must be TRUE):
  1. Developer can inspect wallet checkout code and find the frontend treating MetaMask submission as a pending state, not final payment success
  2. Developer can inspect backend flow and find Ethereum payments confirmed by an asynchronous background processor rather than only browser-side receipt polling
  3. Developer can re-run the same confirmation work item safely and see idempotent behavior with no duplicate transaction success handling or duplicate order advancement
  4. Developer can simulate transient Sepolia RPC failure and see retryable processor behavior instead of silent confirmation loss
  5. Developer can confirm that a wallet payment advances to a backend-confirmed success state only after receipt verification checks chain, destination wallet, sender wallet, amount, and transaction success
  6. Developer can open orders or transaction detail after confirmation and see backend truth reflected consistently across payment and order state
**Plans**: `.planning/phases/13-wallet-payment-confirmation-with-asynchronous-retryable-idem/PLAN.md`

### Phase 14: Order detail copy actions, shipping logic alignment, and TypeScript stabilization

**Goal:** Order detail surfaces become easier to trust and operate: payment and wallet identifiers are copyable with professional tooltip feedback, the shipping card reflects the real order lifecycle instead of generic placeholders, and the current frontend TypeScript blockers around orders/auth supporting code are cleared so follow-up work can ship cleanly.
**Requirements**: ORD-02, ORD-03, ORD-04, SAFE-03
**Depends on:** Phase 13
**Success Criteria** (what must be TRUE):
  1. Developer can open `/orders/[orderId]` and click to copy the payment transaction ID and wallet `txHash`, seeing immediate tooltip or state feedback instead of manual text selection
  2. Developer can inspect the implementation and find the copy interaction encapsulated in a reusable, accessible component or helper built on the existing tooltip system rather than ad hoc inline clipboard code
  3. Developer can open orders in `pending`, `confirmed`, `processing`, `escrow_held`, `shipped`, `delivered`, `cancelled`, `refunded`, and `dispute_open` states and see shipping messaging that matches the current business rules for that state
  4. Developer can confirm the shipping panel no longer shows misleading generic values like `Not assigned` when shipment data is not expected yet or the order is already in a terminal/non-shippable state
  5. Developer can run `cd FE/artium-web && npx tsc --noemit` and clear the current known blockers in `artwork-detail` and wallet-login/auth files required to support this surface cleanly
**Plans**: `.planning/phases/14-order-detail-copy-actions-shipping-logic-and-typescript-stabilization/PLAN.md`
**UI hint**: yes

### Phase 15: Shared text-entry form standardization and cross-domain refactor

**Goal:** The shared text-entry form layer becomes a clean, scalable foundation for the app: shared field primitives own semantics and accessibility, domain wrappers stay thin and style-specific, and pages currently using those text-entry surfaces are refactored onto the standardized contracts without visual or behavioral regressions.
**Requirements**: SHR-01, SHR-02, SHR-03, MIG-01, MIG-02, MIG-03, MIG-04, SAFE-02, SAFE-03
**Depends on:** Phase 14
**Success Criteria** (what must be TRUE):
  1. Developer can inspect `FE/artium-web/src/@shared/components/forms` and find a coherent text-entry family covering shared field shell, text input, password input, textarea, and autocomplete with one consistent prop contract
  2. Developer can inspect the implementation and find accessibility/semantics handled centrally in the shared layer, while auth/checkout/other domain wrappers stay thin and domain-styled rather than re-implementing field behavior
  3. Developer can grep the codebase and see the targeted pages and form surfaces migrated off ad hoc raw `Input` / `Textarea` / `Label` combinations where they map to the standardized text-entry primitives
  4. Developer can submit representative auth, checkout, quick-sell, orders, and address-backed flows and see field labels, descriptions, error states, required markers, and disabled states rendered consistently
  5. Developer can run `cd FE/artium-web && npx tsc --noemit` and targeted eslint on the refactored surfaces with no new form-contract regressions
**Plans**: `.planning/phases/15-shared-text-entry-form-standardization-and-cross-domain-refactor/PLAN.md`
**UI hint**: yes

### Phase 16: Shared form field standardization and multi-domain text-entry migration

**Goal:** `FE/artium-web/src/@shared/components/forms` becomes the single clean foundation for text-entry fields across the app, with standardized shared field semantics, thin domain wrappers, and controlled migration of page-level raw `Input` / `Textarea` / `Label` usage onto scalable shared primitives.
**Requirements**: SHR-01, SHR-02, SHR-03, MIG-01, MIG-02, MIG-03, MIG-04, SAFE-02, SAFE-03
**Depends on:** Phase 15
**Success Criteria** (what must be TRUE):
  1. Developer can inspect `FE/artium-web/src/@shared/components/forms` and find a coherent field family for field shell, text input, password input, textarea, and autocomplete with one consistent prop contract
  2. Developer can inspect the implementation and see accessibility, descriptions, required markers, ids, and error messaging handled centrally in the shared layer instead of re-implemented per page
  3. Developer can inspect auth, checkout, quick-sell, orders, and shared address-backed forms and see them refactored away from ad hoc raw `Input` / `Textarea` / `Label` combinations where they map to the standardized field family
  4. Developer can confirm domain wrappers such as auth-specific fields remain thin styling adapters instead of forking shared field behavior
  5. Developer can run `cd FE/artium-web && npx tsc --noemit` and targeted eslint on the refactored surfaces with no new form-contract regressions
**Plans**: `.planning/phases/16-shared-form-field-standardization-and-multi-domain-text-entry-migration/PLAN.md`
**UI hint**: yes

### Phase 17: Auction frontend integration with blockchain-backed backend flow and live auction state sync

**Goal:** Replace the current mock `/auction` listing and simulated bid modal with an auction-first backend read contract, backend/on-chain synchronized live auction state, and a real MetaMask bid flow where backend DTOs remain the authoritative source of auction truth.
**Requirements**: TBD
**Depends on:** Phase 16
**Success Criteria** (what must be TRUE):
  1. Developer can call `GET /auctions` and `GET /auctions/:auctionId` through `api-gateway` and receive auction-first DTOs that embed artwork display fields directly.
  2. Developer can inspect `/auction` frontend code and confirm live lot data comes from backend auction DTOs, not `mockArtworks`.
  3. Developer can place a bid through MetaMask on Sepolia from the bid modal and see pending state after tx hash without treating local wallet submission as final auction truth.
  4. Developer can confirm bid modal `confirmed` and conflict states are driven by refreshed backend/on-chain synchronized auction state.
  5. Developer can run backend gateway/orders builds and frontend typecheck/lint with no new auction integration regressions.
**Plans**: `.planning/phases/17-auction-frontend-integration-with-blockchain-backed-backend-/17-01-PLAN.md`, `.planning/phases/17-auction-frontend-integration-with-blockchain-backed-backend-/17-02-PLAN.md`, `.planning/phases/17-auction-frontend-integration-with-blockchain-backed-backend-/17-03-PLAN.md`
**UI hint**: yes

Plans:
- [x] 17-01 Backend auction read model and realtime gateway contract
- [x] 17-02 Frontend auction listing API integration
- [x] 17-03 Wallet-backed bid modal and authoritative state sync

### Phase 18: Seller auction access and artwork eligibility policy

**Goal:** Establish the seller-only auction creation contract and eligibility policy so only authorized sellers can select owned, auctionable artworks before any auction terms or on-chain start flow is exposed.
**Requirements**: SAUC-01, SAUC-02, SAUC-03
**Depends on:** Phase 17
**Success Criteria** (what must be TRUE):
  1. Developer can visit the planned seller auction creation route as an unauthenticated user, non-seller user, and seller user and observe access outcomes that match policy.
  2. Developer can inspect backend guards and confirm seller authorization is enforced server-side, not only through frontend routing.
  3. Developer can list candidate artworks for the current seller and confirm the response includes only owned inventory records.
  4. Developer can inspect eligibility logic and confirm sold, deleted, already-auctioned, active-order, multi-quantity, missing-primary-image, and incomplete-metadata artworks are blocked with specific reason codes.
  5. Developer can reuse the eligibility result in frontend copy without duplicating business rules in React.
**Plans**: `.planning/phases/18-seller-auction-access-and-artwork-eligibility-policy/18-01-PLAN.md`, `.planning/phases/18-seller-auction-access-and-artwork-eligibility-policy/18-02-PLAN.md`, `.planning/phases/18-seller-auction-access-and-artwork-eligibility-policy/18-03-PLAN.md`
**UI hint**: yes

Plans:
- [x] 18-01 Shared artwork eligibility DTOs and artwork-service candidate policy
- [x] 18-02 Seller-only gateway endpoint and active order lock merge
- [x] 18-03 Seller auction artwork picker frontend

### Phase 18.1: Seller registration and role activation gap closure

**Goal:** Close the practical access gap between profile settings and seller-only auction creation by giving authenticated non-sellers a validated seller registration path that creates a seller profile, activates seller role capability server-side, and preserves verification/payment onboarding as later policy gates.
**Requirements**: SAUC-10
**Depends on:** Phase 18
**Success Criteria** (what must be TRUE):
  1. Developer can open the profile edit seller CTA and land on an authenticated `/seller/register` page instead of a missing route.
  2. Developer can submit validated seller profile details and see backend create the seller profile for the authenticated user without trusting client-supplied user IDs.
  3. Developer can inspect identity-service seller profile creation and confirm the `seller` role is added to the user in the same transaction as profile creation.
  4. Developer can confirm duplicate seller registration is blocked and the frontend recovers by showing the existing seller profile path.
  5. Developer can confirm new seller profiles remain unverified with payment onboarding incomplete by default.
**Plans**: `.planning/phases/18.1-seller-registration-and-role-activation-gap-closure/PLAN.md`
**UI hint**: yes

### Phase 19: Seller auction creation workspace and terms UX

**Goal:** Build a practical seller workspace where an eligible artwork can be picked, auction terms can be configured with clear policy constraints, and the seller can preview buyer-facing auction details before submission.
**Requirements**: SAUC-04, SAUC-05
**Depends on:** Phase 18
**Success Criteria** (what must be TRUE):
  1. Developer can open a seller-only auction creation page, select an eligible artwork from inventory, and move into terms setup without using quick-sell invoice UI.
  2. Developer can configure optional reserve policy, minimum bid increment, duration/start-end timing guidance, and shipping/payment disclosures with validation that prevents unsafe or ambiguous auction economics.
  3. Developer can preview the final auction card and policy summary before submission, including artwork image/title, seller name, activation timing, first bid floor, reserve disclosure, and Sepolia/network expectations.
  4. Developer can see clear copy that auction economics become locked once the auction is active, with `Back`, `Save Draft`, and `Start Auction` actions behaving predictably.
  5. Developer can run frontend typecheck and targeted lint on the new auction creation workspace without introducing new form or route regressions.
**Plans**: `.planning/phases/19-seller-auction-creation-workspace-and-terms-ux/19-01-PLAN.md`, `.planning/phases/19-seller-auction-creation-workspace-and-terms-ux/19-02-PLAN.md`, `.planning/phases/19-seller-auction-creation-workspace-and-terms-ux/19-03-PLAN.md`
**UI hint**: yes

Plans:
- [x] 19-01 Seller auction terms validation and local draft model
- [x] 19-02 Seller auction terms form and preview components
- [x] 19-03 Seller auction creation workspace integration

### Phase 19.1: Seller auction artifact recovery and policy alignment

**Goal:** Recover missing seller-auction evidence, align the Phase 19 terms/policy contract to the milestone wording, and restore roadmap/requirements traceability before final milestone closeout.
**Requirements**: SAUC-10, SAUC-04, SAUC-05
**Gap Closure:** Closes orphaned Phase 18.1 artifacts, missing Phase 19 verification, preview/policy alignment gaps, and stale milestone traceability from `v1.1-MILESTONE-AUDIT.md`
**Depends on:** Phase 19
**Success Criteria** (what must be TRUE):
  1. Developer can open a persisted Phase 18.1 artifact trail and verify seller registration / seller-role activation behavior against SAUC-10.
  2. Developer can open Phase 19 verification artifacts and see SAUC-04 and SAUC-05 proven with current seller auction workspace behavior.
  3. Developer can inspect the seller auction preview/policy summary and confirm it matches the final milestone contract for pre-start seller terms disclosure.
  4. Developer can open `REQUIREMENTS.md` and `ROADMAP.md` and see seller-auction requirement/phase status aligned to implemented reality.
  5. Developer can re-run milestone audit and remove the orphaned-artifact and Phase 19 traceability blockers.
**Plans**: `.planning/phases/19.1-seller-auction-artifact-recovery-and-policy-alignment/19.1-01-PLAN.md`, `.planning/phases/19.1-seller-auction-artifact-recovery-and-policy-alignment/19.1-02-PLAN.md`, `.planning/phases/19.1-seller-auction-artifact-recovery-and-policy-alignment/19.1-03-PLAN.md`
**UI hint**: yes

### Phase 20: Auction start orchestration and seller lifecycle status

**Goal:** Connect seller auction creation to the backend/on-chain start flow with idempotent orchestration, authoritative auction state persistence, locked post-activation economics, and seller-visible pending/active/failed lifecycle feedback.
**Requirements**: SAUC-06, SAUC-07, SAUC-08, SAUC-09
**Depends on:** Phase 19.1
**Success Criteria** (what must be TRUE):
  1. Developer can submit a valid seller auction start request and observe backend validation for seller identity, artwork ownership, eligibility, seller wallet/profile readiness, and contract/network configuration before on-chain creation.
  2. Developer can retry a timed-out or duplicated start request without creating duplicate on-chain/off-chain auctions for the same artwork.
  3. Developer can inspect persistence and confirm artwork status, auction/order state, on-chain auction ID, tx hash, and public auction read DTOs converge after the auction starts.
  4. Developer can see seller lifecycle feedback for pending, active, failed, and retryable auction start states with actionable reason codes, while unsafe auction economics remain locked after activation and only explicitly safe lifecycle actions stay available.
  5. Developer can confirm the public `/auction` listing and seller inventory/order views reflect the new auction through backend state, not optimistic frontend-only mutation.
**Plans**: TBD
**UI hint**: yes

### Omitted Phases 21-26: Backend Deployment Strategy

**Status:** Intentionally omitted/redundant by user decision on 2026-04-29.
**Historical artifacts:** retained under `.planning/phases/21-*`, `.planning/phases/22-*`, and `.planning/phases/26-*` where present.
**Active milestone impact:** no remaining milestone closure blocker. Do not treat missing or incomplete Phase 21-26 verification as active work unless the user explicitly reopens backend deployment strategy.

### Phase 27: Frontend shared API definition standardization and edge-case audit

**Goal:** Standardize the frontend shared API definition layer so all JSON, upload, mock, query, path, base URL, auth, cache, and error-handling behavior uses one documented client contract without breaking existing API module imports.
**Requirements**: TBD
**Depends on:** Phase 20; Phases 21-26 intentionally omitted/redundant
**Success Criteria** (what must be TRUE):
  1. Frontend API modules under `FE/artium-web/src/@shared/apis` preserve their current public default exports while using shared helpers for query strings, path params, base URL resolution, JSON bodies, and structured API errors.
  2. Artwork, folder, upload, messaging, invoice, auction, order, payment, profile, followers, events, and users API modules no longer duplicate ad hoc request plumbing where the shared client can support the behavior.
  3. Edge cases are explicitly handled or documented: `204 No Content`, string-array backend messages, `0` and `false` query values, array query values, IDs containing reserved URL characters, artwork base URL variants, and `FormData` boundaries.
  4. Upload requests with progress and invoice mock responses are represented as documented special cases rather than hidden one-off implementations.
  5. Frontend verification runs through existing commands: `cd FE/artium-web && npm run lint` and `cd FE/artium-web && npm run build`, with any unrelated pre-existing failures named in the execution summary.
**Plans**: `.planning/phases/27-frontend-shared-api-definition-standardization-and-edge-case/27-01-PLAN.md`, `.planning/phases/27-frontend-shared-api-definition-standardization-and-edge-case/27-02-PLAN.md`, `.planning/phases/27-frontend-shared-api-definition-standardization-and-edge-case/27-03-PLAN.md`, `.planning/phases/27-frontend-shared-api-definition-standardization-and-edge-case/27-04-PLAN.md`

Plans:
**Wave 1**
- [x] 27-01-PLAN.md — Shared API client primitives, structured errors, empty response handling, and API definition README

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 27-02-PLAN.md — JSON API module migration to shared query, path, and artwork base URL helpers

**Wave 3** *(blocked on Wave 1 and Wave 2 completion)*
- [x] 27-03-PLAN.md — Shared upload transport and invoice mock isolation

**Wave 4** *(blocked on Wave 1, Wave 2, and Wave 3 completion)*
- [x] 27-04-PLAN.md — Final API edge-case audit, documentation examples, lint, and build verification

Cross-cutting constraints:
- Existing API module default exports remain stable.
- Dynamic route parameters use shared path encoding.
- Query strings use the shared helper and preserve `0` and `false`.
- Frontend verification uses existing `lint` and `build` scripts unless execution explicitly adds new test tooling.

### Phase 28: Artwork upload draft backend gap audit and contract cleanup

**Goal:** The artwork upload draft flow at `/artworks/upload?draftArtworkId=6f2c4075-4892-4e09-ba4e-e24101b262f9` is audited end-to-end against backend reality, with frontend/API contract gaps identified and cleaned so draft loading, editing, validation, media handling, and final submission are accurate, secure, and maintainable.
**Requirements**: AUD-28-01 backend draft identity, AUD-28-02 owner-scoped draft authorization, AUD-28-03 upload media ownership, AUD-28-04 frontend/backend DTO parity, AUD-28-05 targeted verification evidence
**Depends on:** Phase 27
**Plans:** 3/3 plans complete
**UI hint**: yes
**Backend focus:** inventory/artwork draft APIs, API gateway contracts, DTO validation, persistence semantics, file/media ownership, auth/authorization, and frontend request mapping for the upload draft route.
**Success Criteria** (what must be TRUE):
  1. Developer can trace the exact frontend calls made by `/artworks/upload?draftArtworkId=6f2c4075-4892-4e09-ba4e-e24101b262f9` to backend controllers, DTOs, services, and persistence paths without relying on mocks or undocumented assumptions.
  2. Developer can identify and close mismatches between upload-form fields and backend artwork/draft DTOs, including required fields, enum values, numeric formats, dimensions, pricing, materials, tags, visibility/status, and media metadata.
  3. Backend-side validation and authorization are authoritative: only the draft owner can read/update/submit the draft, invalid payloads fail with structured errors, and frontend validation mirrors backend rules without becoming the source of truth.
  4. Draft media/file handling is clean and accurate: uploaded media references are owned by the authenticated seller, stale or missing media states are handled explicitly, and final artwork submission cannot persist inconsistent media records.
  5. API client code for the upload flow uses shared Phase 27 helpers for path encoding, query handling, structured errors, and upload transport rather than ad hoc request logic.
  6. Verification evidence includes backend-focused checks for the relevant service/gateway code plus frontend type/lint checks targeted to the upload flow, with any existing unrelated lint debt documented separately.

Plans:
**Wave 1**
- [x] 28-01-PLAN.md — Backend upload-draft contract, owner-scoped CQRS handlers, and draft submit validation

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 28-02-PLAN.md — Upload endpoint hardening plus frontend draft hydration and draft-aware submit mapping

**Wave 3** *(blocked on Wave 1 and Wave 2 completion)*
- [x] 28-03-PLAN.md — Backend contract audit artifact, targeted verification, and final structural checks

Cross-cutting constraints:
- The URL query value `draftArtworkId` is treated as a backend draft artwork ID, not only a local Zustand key.
- Seller identity for draft and upload mutations is derived from authenticated `UserPayload`; request bodies must not control `sellerId`.
- Upload endpoints must validate seller-owned `DRAFT` artwork state before writing media.
- Frontend API modules must keep using Phase 27 helpers: `apiFetch`, `apiUpload`, and `encodePathSegment`.
- Verification must separate Phase 28 regressions from unrelated repository lint/build debt.

### Phase 29: please check /inventory from frontend and please implement delete artwork, edit artwork and show on profile functions with best practice. And check if we have got any where in inventory that can trigger starting auction

**Goal:** Implement backend-backed inventory artwork actions for edit, delete, profile visibility, and safe auction handoff, while preserving public profile filtering and seller auction lifecycle rules.
**Requirements**: TBD
**Depends on:** Phase 28
**Plans:** 3/3 plans complete

Plans:
**Wave 1**
- [x] 29-01 — Backend policy and visibility filters

**Wave 2 *(blocked on Wave 1 completion)***
- [x] 29-02 — Inventory action menu and root/folder handlers

**Wave 3 *(blocked on Wave 1 and Wave 2 completion)***
- [x] 29-03 — Profile filtering, auction handoff, and final evidence

Cross-cutting constraints:
- Artwork update and delete commands must derive seller authorization from authenticated `UserPayload.id`, not from request body fields.
- Profile-visible artwork is queryable with `status: ArtworkStatus.ACTIVE` and `isPublished: true`.
- Inventory may navigate to seller auction setup, but it must not call seller auction start, retry, attach-transaction, or wallet APIs directly.
- Root inventory and folder inventory must share the same artwork action behavior.

### Phase 30: Order-linked invoice backend contract and materialization

**Goal:** Orders can expose a trustworthy invoice read model by reusing payments-service invoice persistence, enforcing the same buyer/seller access rules as `/orders`, and materializing a missing invoice from canonical order/payment data when needed.
**Requirements:** OINV-01, OINV-02, OINV-03
**Depends on:** Phase 29
**Success Criteria** (what must be TRUE):
  1. Developer can call an authenticated order-invoice endpoint for an order they bought or sold and receive invoice data; unauthorized users receive the same non-disclosing access behavior as private order reads.
  2. Developer can inspect backend code and confirm invoice lookup/materialization reuses payments-service invoices with `order_id`, line items, invoice numbers, statuses, totals, and payment transaction links rather than creating a parallel orders-service invoice table.
  3. Developer can request invoice data for an order without an existing invoice and see one idempotently derived from persisted order, order items, payment, shipping, and lifecycle data.
  4. Developer can request invoice data repeatedly for the same order and observe stable invoice identity, totals, line items, and status with no duplicate invoices.
  5. Backend DTOs expose only the fields needed for order invoice preview/export and avoid leaking unrelated buyer/seller private data across workspace scopes.
**Plans:** 2/2 plans complete
**UI hint:** no

Plans:
**Wave 1**
- [x] 30-01 — Payments-service order invoice DTO and materialization contract

**Wave 2 *(blocked on Wave 1 completion)***
- [x] 30-02 — Gateway authorized order invoice endpoint and frontend API contract

Cross-cutting constraints:
- Order invoice persistence must reuse payments-service `Invoice` and `InvoiceItem` entities with `order_id`; do not create an orders-service invoice table.
- Missing order invoices materialize through `get_or_materialize_order_invoice` and use `INV-${order.orderNumber}` as the stable invoice number.
- `GET /orders/:id/invoice` must call the existing `getAuthorizedOrder(id, req.user?.id)` before calling payments-service.
- Frontend API typing may expose `getOrderInvoice`, but no invoice UI is implemented in Phase 30.

### Phase 31: Orders invoice preview and extraction UI

**Goal:** Buyers and sellers can open invoice preview and extraction actions directly from the Orders workspace, with a polished responsive document layout that derives all financial truth from backend invoice/order DTOs.
**Requirements:** OINV-04, OINV-05, OINV-06, OINV-07, OINV-08
**Depends on:** Phase 30
**Success Criteria** (what must be TRUE):
  1. Developer can open `/orders` in buyer or seller scope and see invoice actions only where the backend says invoice preview/extraction is available for the order state.
  2. Developer can open `/orders/[orderId]` and launch an invoice preview without losing the existing order detail context, action panel, timeline, payment records, or role-aware behavior.
  3. Developer can inspect the invoice preview UI and find a professional document layout with invoice number/status, order number, dates, buyer/seller blocks, artwork line items, payment identifiers, shipping/billing context, subtotal, tax, discount, shipping, total, and Artium branding.
  4. Developer can use print/download extraction controls and produce an invoice output that preserves layout, identifiers, totals, and readable spacing across desktop and mobile widths.
  5. Developer can trigger loading, unavailable, unauthorized, and retryable backend failure states and see clear inline UI that does not break order filters, pagination, or detail navigation.
  6. Developer can inspect frontend code and confirm monetary values and invoice identity come from backend DTOs, with no client-only recomputation or invented financial placeholders.
**Plans:** 0/2 plans executed
**Wave 1**
- 31-01 — Core invoice presentation, availability helpers, detail panel, preview modal, and DTO-driven invoice document

**Wave 2 *(blocked on Wave 1 completion)***
- 31-02 — Orders list/detail integration, invoice loading/retry, panel focus, modal orchestration, and print/save extraction

Cross-cutting constraints:
- Invoice UI must derive invoice number, status, subtotal, tax, discount, shipping, total, parties, addresses, payment identifiers, and line items from `orderApis.getOrderInvoice` / `OrderInvoiceResponse`.
- Authorization, not-found, and seller-redaction cases must render as non-disclosing unavailable or labeled missing/redacted data; the frontend must not infer private fields from order-page data.
- Browser print/save-as-PDF must use `window.print()`, hide workspace chrome and controls, and print only the invoice document plus minimal Artium footer.
**UI hint:** yes

### Phase 32: Order invoice validation and milestone closure

**Goal:** Prove the order invoice contract, preview, extraction, and UI quality are complete through focused backend, frontend, responsive, and documentation evidence before closing v1.3.
**Requirements:** OINV-09
**Depends on:** Phase 31
**Success Criteria** (what must be TRUE):
  1. Developer can open verification artifacts showing authorized buyer, authorized seller, unauthorized user, existing invoice, missing invoice materialization, and repeated materialization scenarios all behave correctly.
  2. Developer can inspect frontend evidence covering buyer and seller orders list actions, order detail preview, extraction output, responsive mobile/desktop layout, and loading/error states.
  3. Developer can run backend targeted tests/build checks around orders gateway, payments invoice query/materialization, and shared DTOs with no invoice regressions.
  4. Developer can run `cd FE/artium-web && npx tsc --noemit`, targeted lint, and any invoice preview component checks with no new Orders workspace regressions.
  5. Developer can open `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, and phase verification artifacts and see OINV-01 through OINV-09 fully mapped and evidenced.
**Plans:** TBD
**UI hint:** yes
