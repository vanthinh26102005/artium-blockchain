# Phase 07 Research: Checkout Payment Feedback — Success & Error UI States

## Scope Confirmation

- Phase 7 remains frontend-only on the existing checkout route.
- Success must stay inline on `/checkout/[artworkId]` instead of redirecting away.
- Failures must be classified and retry-friendly.
- Step-1 contact data must survive payment-step failures.
- No backend/API redesign or new payment providers belong in this phase.

## Current Codebase State

### Existing checkout work already present

The checkout flow already contains substantial in-progress Phase 7-style work:

- `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`
- `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx`
- `FE/artium-web/src/@domains/checkout/components/BuyerCheckoutPaymentForm.tsx`
- `FE/artium-web/src/pages/checkout/[artworkId].tsx`

The working tree also already contains new checkout artifacts:

- `FE/artium-web/src/@domains/checkout/components/CheckoutSuccessScreen.tsx`
- `FE/artium-web/src/@domains/checkout/utils/paymentErrors.ts`

### What is already implemented

- `BuyerCheckoutPageView.tsx` already uses `paymentResult` and `paymentError` state.
- A success branch already renders `CheckoutSuccessScreen`.
- Payment-step error UI is already rendered above the payment form.
- `WalletPaymentSection.tsx` already classifies MetaMask connect/transaction failures and exposes retry buttons.

### Remaining gaps that planning must address

1. **Card/network retry UX is incomplete**
   - The checkout-level error banner still only shows text.
   - There is no explicit checkout-level retry or try-again action for card/network failures.

2. **Retry semantics are risky**
   - `handleContinue()` creates the order before attempting payment.
   - On payment failure it only best-effort cancels the order.
   - A naive retry path can create duplicate or orphan order records.

3. **Success URL behavior still conflicts with inline-success intent**
   - Checkout still updates the URL with `?status=success`.
   - A page effect redirects returning success URLs to `/discover` if `paymentResult` is absent.
   - Refresh/back-entry therefore drops the inline success state.

4. **Wallet correctness leaks from adjacent phase**
   - Wallet UI still labels/uses values in ways that reflect the known Phase 8 USD/ETH correctness gap.
   - Phase 7 should avoid expanding this bug while keeping scope focused on UI feedback.

## Existing Patterns to Reuse

### Stripe / checkout route

- Stripe is loaded once at module scope in `pages/checkout/[artworkId].tsx`.
- `Elements` wraps the route once.
- `useStripe()` / `useElements()` are already guarded before card submission.

### React Hook Form state preservation

- Checkout already uses separate `contactForm` and `paymentForm`.
- `FormProvider` + `useWatch` patterns already preserve step-1 data across step transitions and conditional renders.

### Adjacent UI reference

- Quick-sell success/paid-state patterns are the closest UI analog for the desired confirmation experience.
- Checkout planning should borrow content structure rather than inventing a new confirmation pattern.

## Planning Implications

### Recommended plan decomposition

The phase should not be planned as a single “update checkout page” blob. It should cover at least:

1. Outcome-state model and success-screen rendering
2. Checkout-level error classification and retry UX
3. Wallet retry-state refinement and copy alignment
4. Validation and evidence capture for UX-03

### Scope guardrails

- Do not plan backend changes here.
- Do not solve the broader USD→ETH correctness issue here; keep that in Phase 8.
- Do not remove existing Stripe/RHF structure that already works.
- Do plan around duplicate-order risk when defining retry behavior.

## Validation Architecture

### Automated validation

Run from `FE/artium-web/`:

1. `npx tsc --noemit`
2. `npm run build`

These already pass against the current codebase and must remain required verification steps for this phase.

### Manual scenario validation

Plans should explicitly require manual validation for:

1. Card success -> inline step-3 success screen renders without redirect
2. Continue Shopping -> navigates to `/discover` without `?checkout=success`
3. Card decline -> specific inline error and retry action
4. Network/API failure -> generic inline error and retry action without losing step-1 data
5. Wallet connection rejection -> inline retry connection path
6. Wallet transaction rejection/pending request -> inline retry transaction path

### Evidence expectations

- Plan tasks should leave clear hooks for later verification artifacts required by UX-03.
- Verification must cite the exact FE typecheck/build commands above.
- Any retry behavior must be described so a verifier can reproduce it manually.

## Target Files Most Likely in Scope

- `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`
- `FE/artium-web/src/@domains/checkout/components/CheckoutSuccessScreen.tsx`
- `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx`
- `FE/artium-web/src/@domains/checkout/components/BuyerCheckoutPaymentForm.tsx`
- `FE/artium-web/src/@domains/checkout/utils/paymentErrors.ts`
- `FE/artium-web/src/pages/checkout/[artworkId].tsx`

## Notes for Planner

- Plan against the **current** checkout implementation, not the older Phase 7 narrative alone.
- Treat retry UX and retry execution semantics as distinct concerns.
- Make success-state persistence/URL behavior an explicit task instead of assuming the current shallow route replacement is acceptable.
