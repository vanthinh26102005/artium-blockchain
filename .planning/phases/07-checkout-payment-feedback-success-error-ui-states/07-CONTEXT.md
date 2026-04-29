# Phase 7: Checkout Payment Feedback — Success & Error UI States - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning
**Source:** PRD Express Path (.planning/phases/7/PLAN.md)

<domain>
## Phase Boundary

After "Pay Now" on `pages/checkout/[artworkId].tsx`, keep the buyer in the checkout flow and render inline payment outcome states instead of redirecting away. Success must transition to a step-3 success or processing screen with order confirmation details and a CTA. Failure must show retry-friendly inline error states for card, network, and wallet scenarios without losing step-1 contact data.

This phase is frontend-only. It does not introduce new backend endpoints, payment APIs, or routing flows beyond preserving the current checkout URL while showing inline states.

</domain>

<decisions>
## Implementation Decisions

### Success-state behavior
- Show checkout success inline after payment completion instead of redirecting to `/discover`.
- Use a dedicated success component rendered from the checkout page view when payment completes.
- Continue Shopping must navigate to `/discover` without carrying `?checkout=success`.
- Wallet payments may show a processing-oriented success state when blockchain confirmation is still pending.

### Error-state behavior
- Replace generic payment errors with classified, retry-friendly inline error messages.
- Card, network/API, wallet connection rejection, and wallet transaction rejection must map to specific messages.
- Error recovery must preserve contact information entered in step 1.
- Payment-step errors should be displayed above the payment form so they are immediately visible on mobile.

### Wallet UX behavior
- MetaMask connection and transaction failures should use explicit inline messaging rather than generic fallback text.
- Wallet errors should provide inline retry affordances for reconnecting the wallet or retrying the transaction.

### Validation and evidence
- Planning must include typecheck/build verification for `FE/artium-web/`.
- Phase deliverables must leave room for verification artifacts required by UX-03.

### the agent's Discretion
- Exact component decomposition inside the checkout domain, provided the UX remains inline and retry-friendly.
- Visual presentation details of the success state, provided they follow existing checkout/quick-sell patterns and do not introduce a redesign.
- Whether success and processing variants share one component or compose smaller internal subcomponents.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase source
- `.planning/phases/7/PLAN.md` — existing narrative phase spec that defines the intended success/error UX and file targets

### Roadmap and requirements
- `.planning/ROADMAP.md` — phase goal, dependencies, and success criteria for Phase 7
- `.planning/REQUIREMENTS.md` — UX-01, UX-02, UX-03 requirement text and milestone traceability context

### Checkout implementation
- `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx` — current checkout orchestration, payment flow, error state, and redirect behavior
- `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx` — current MetaMask connection/transaction UX and error handling
- `FE/artium-web/src/@domains/checkout/components/BuyerCheckoutPaymentForm.tsx` — payment method UI composition and wallet/card branching
- `FE/artium-web/src/pages/checkout/[artworkId].tsx` — checkout route shell and Stripe Elements mounting

### Adjacent UI patterns
- `FE/artium-web/src/@domains/quick-sell/` — adjacent payment/success UX patterns referenced by the source phase spec

</canonical_refs>

<specifics>
## Specific Ideas

- Create `FE/artium-web/src/@domains/checkout/components/CheckoutSuccessScreen.tsx`.
- Add a pure utility `FE/artium-web/src/@domains/checkout/utils/paymentErrors.ts` for error classification.
- Update `BuyerCheckoutPageView.tsx` to:
  - store payment result state,
  - render the inline success screen,
  - stop redirecting away on success,
  - classify and display payment errors inline.
- Update `WalletPaymentSection.tsx` to classify MetaMask errors and expose retry actions.
- Preserve the existing checkout layout for steps 1 and 2; success can render outside the layout if that better matches the source spec.

</specifics>

<deferred>
## Deferred Ideas

- Backend/API payment behavior changes
- New payment providers or wallet types
- Broader checkout redesign beyond inline success/error UX

</deferred>

---

*Phase: 07-checkout-payment-feedback-success-error-ui-states*
*Context gathered: 2026-04-23 via PRD Express Path*
