---
phase: "6"
plan: "4"
subsystem: payments/checkout
tags: [stripe, checkout, card-tokenization, ethereum, bug-fix]
dependency_graph:
  requires: [6-3]
  provides: [complete-checkout-flow, stripe-card-tokenization, ethereum-payment-recording]
  affects: [BuyerCheckoutPageView, paymentApis, stripe.service, payments.controller]
tech_stack:
  added: ["@stripe/stripe-js"]
  patterns: [discriminated-union-narrowing, inline-error-state, stripe-payment-method-raw-card]
key_files:
  created:
    - FE/artium-web/src/@domains/checkout/hooks/useStripeCardToken.ts
  modified:
    - BE/apps/payments-service/src/infrastructure/services/stripe.service.ts
    - BE/apps/api-gateway/src/presentation/http/controllers/payment/payments.controller.ts
    - FE/artium-web/src/@shared/apis/paymentApis.ts
    - FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx
    - FE/artium-web/package.json
decisions:
  - "Use stripe.createPaymentMethod with raw card as `card as any` cast to work around Stripe.js type restriction on non-element raw card data"
  - "gateway createStripeCustomer injects userId from req.user?.id so payments-service can associate the customer"
  - "FE ignores 409 from createStripeCustomer (customer already exists) instead of erroring"
metrics:
  duration: "4 minutes"
  completed: "2026-04-23T05:25:00Z"
  tasks_completed: 11
  files_changed: 7
---

# Phase 6 Plan 4: Complete Checkout Payment Flow Summary

**One-liner:** Full card tokenization (Stripe.js raw card → PaymentMethod ID) + Ethereum wallet recording, with BE amount-units and userId injection fixes.

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Fix BE amount units bug (100× overcharge) | ✅ | 28f32cf8 |
| 2 | Fix gateway createStripeCustomer inject userId | ✅ | 28f32cf8 |
| 3 | Install @stripe/stripe-js | ✅ | 28f32cf8 |
| 4 | Create useStripeCardToken.ts hook | ✅ | 28f32cf8 |
| 5 | Add recordEthereumPayment to paymentApis.ts | ✅ | 28f32cf8 |
| 6 | Rewrite BuyerCheckoutPageView.tsx | ✅ | 28f32cf8 |
| 7 | TypeScript check (FE) | ✅ | — |
| 8 | Lint check (FE) | ✅ | — |
| 9 | Build check (FE) | ✅ | — |
| 10 | Backend TypeScript check | ✅ | — |
| 11 | Commit all changes | ✅ | 28f32cf8 |

## What Was Built

### Backend Fixes

**Task 1 — Amount units bug:**
`stripe.service.ts` line 38 was `amount: Math.round(amount * 100)`. Since the FE already sends `amountInCents = Math.round(total * 100)`, the service was multiplying cents by 100 again, causing 100× overcharge. Fixed to `amount: Math.round(amount)`.

**Task 2 — userId injection:**
`payments.controller.ts` `createStripeCustomer` now accepts `@Req() req: any` and spreads `{ ...data, userId: req.user?.id }` into the RPC payload. This ensures payments-service can associate the Stripe customer with the user's account.

### Frontend Additions

**useStripeCardToken.ts:**
Module-level `stripePromise` singleton via `loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`. Exports `createStripePaymentMethod(card)` which calls `stripe.createPaymentMethod({ type: 'card', card: card as any })` (cast required as Stripe.js types reject raw card data in newer versions). Returns the PaymentMethod ID string.

**paymentApis.ts:**
Added `RecordEthereumPaymentRequest` and `RecordEthereumPaymentResponse` types. Added `recordEthereumPayment()` function posting to `/payments/ethereum`.

**BuyerCheckoutPageView.tsx (full rewrite):**
- Removed ALL `alert()` and `confirm()` calls
- `handleCancel` step 1: calls `router.back()` directly (no dialog)
- `handleApplyPromo`: no-op (comment only, no alert)
- Validation errors: `setError(...)` inline state
- Card path: createStripeCustomer (ignore 409) → createPaymentIntent → tokenize card via Stripe.js → confirmPaymentIntent
- Wallet path: recordEthereumPayment
- Success: `void router.push('/discover?checkout=success&orderNumber=...')` — no alert
- Error banner rendered inline below payment form on step 2
- `ethAmount={pricing.total}` passed to `BuyerCheckoutPaymentForm` (was `undefined`)

## Deviations from Plan

None — plan executed exactly as written. The `handleApplyPromo` no-op was explicitly specified in the plan's "Important TypeScript notes" section.

## Known Stubs

None — all flows are wired to real API calls.

## Self-Check: PASSED
