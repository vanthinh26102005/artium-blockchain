# Phase 14: Order Detail Copy Actions, Shipping Logic Alignment, and TypeScript Stabilization

## Goal

Tighten the private order-detail experience so it feels production-ready: users can copy payment identifiers without manual text selection, the shipping panel reflects real order lifecycle truth instead of static placeholders, and the current frontend TypeScript blockers in adjacent supporting code are removed before further order-detail work lands.

This phase is planned directly from the live codebase and the current `tsc` output. No separate research artifact is needed because the gaps are concrete and already visible in the existing order-detail view, shared UI primitives, and compile errors.

---

## Root Cause (confirmed by code audit)

### 1) Payment and wallet identifiers are rendered as dead text

`OrderDetailPageView.tsx` currently trims and prints `paymentTransactionId` and `txHash` as plain text.

That creates a weak UX for transaction records:

- users have to manually select hashes
- there is no clear copy affordance
- there is no feedback confirming whether the copy succeeded
- the behavior is not reusable elsewhere in the product

The codebase already has Radix tooltip primitives and multiple ad hoc clipboard snippets, but no professional shared copy-to-clipboard field for order records.

### 2) The shipping card is static, but order shipping behavior is stateful

The current shipping box always shows:

- shipping address
- carrier
- tracking
- shipping method

and falls back to generic strings such as `Not assigned` or `Not available`.

That does not match the business logic defined by the order lifecycle:

- `pending` and `confirmed` are not yet shipment-ready
- `processing` means fulfillment is in progress, not missing data
- `escrow_held` means shipment is expected next for blockchain-backed flows
- `cancelled` and `refunded` are terminal states where future shipping may not apply
- `dispute_open` should preserve shipment history while clarifying the order is under review

So the current panel is technically populated, but semantically weak. It treats every state as the same form instead of a lifecycle-driven record.

### 3) Frontend compile health is currently blocked by a small set of known supporting errors

Running `cd FE/artium-web && npx tsc --noemit` currently fails on:

- `src/@domains/artwork-detail/mock/mockArtworkDetail.ts`
- `src/@domains/auth/types/wallet.ts`
- `src/@domains/auth/hooks/useWalletLogin.ts`
- `src/@domains/auth/views/LoginPage.tsx`

These are not speculative issues. They are concrete blockers confirmed by the current compiler output:

- optional top-picks avatar data now conflicts with artwork-detail mock typing
- wallet provider typing conflicts with the current `window.ethereum` declaration shape
- `LoginPage` references wallet dialog state setters that are not declared

Even though these files are adjacent rather than central to order detail, they must be cleared if this phase is going to close with real typecheck evidence.

---

## Architecture Direction

The right implementation is a small, reusable presentation upgrade, not a redesign.

Recommended direction:

- add a shared copyable value primitive built on existing button/tooltip patterns
- keep order-detail view orchestration in `OrderDetailPageView`, but move shipping-state interpretation into order presentation helpers
- align shipping copy with current lifecycle rules already encoded in order status transitions and action gating
- clear TypeScript issues surgically rather than broad refactors

This preserves the existing dashboard look and avoids turning a focused polish phase into an architecture rewrite.

---

## Plan 14.1 — Add a reusable click-to-copy record field and integrate it into order detail

**Goal:** Make payment and wallet transaction identifiers easy to copy, with immediate professional feedback and no ad hoc inline clipboard logic.

### Files to Create

**1. `FE/artium-web/src/@shared/components/display/CopyValueField.tsx`**

Create a reusable display component for long identifiers and similar record values.

Recommended behavior:

- label/value presentation compatible with the existing order-detail cards
- copy button or copyable text affordance
- tooltip states such as `Copy`, `Copied`, and `Copy failed`
- keyboard accessible interaction
- defensive clipboard fallback handling when `navigator.clipboard` is unavailable
- optional truncation for display while preserving full copied value

Do not bury tooltip state inside `OrderDetailPageView`. This should be reusable.

### Files to Modify

**2. `FE/artium-web/src/@domains/orders/views/OrderDetailPageView.tsx`**

Replace the dead-text transaction rows with the shared copyable field for:

- `paymentTransactionId`
- `txHash`

Recommended UI treatment:

- preserve the existing visual system
- keep the record readable even when very long
- only show copy actions when a real value exists
- keep `Not available` treatment for missing values, but without rendering a dead copy affordance

If there is already a reliable chain explorer URL available for `txHash`, it can be linked as a secondary action. That is optional and should not block the copy interaction.

### Outcome

After this plan, order-detail payment records become actionable and consistent with professional commerce tooling.

---

## Plan 14.2 — Align the shipping box with real order lifecycle rules

**Goal:** Make the shipping panel explain the current state of fulfillment instead of showing generic placeholders that imply missing data.

### Files to Modify

**3. `FE/artium-web/src/@domains/orders/utils/orderPresentation.ts`**

Add a lifecycle-aware shipping presenter, for example a helper that derives:

- shipping state title
- primary explanatory copy
- whether shipment details are expected yet
- whether carrier / tracking / method should be shown as active records vs deferred information

This logic should map to current business rules, not invent a new workflow.

Recommended state model:

- `pending`: payment/order is not yet ready for fulfillment
- `confirmed` / `processing`: seller is preparing shipment; shipment data may not exist yet
- `escrow_held`: shipment is the next expected seller step in wallet-backed escrow flow
- `shipped`: tracking and carrier are active, show them prominently
- `dispute_open`: preserve shipment record, but clarify the order is under review
- `delivered`: show final shipment record as completed history
- `cancelled` / `refunded`: explain that fulfillment is closed and shipment may not proceed

**4. `FE/artium-web/src/@domains/orders/views/OrderDetailPageView.tsx`**

Refactor the shipping card so it consumes the presenter instead of hardcoded fallbacks.

Required UX direction:

- preserve address display when present
- replace misleading `Not assigned` copy with state-aware explanations
- only emphasize carrier/tracking/method when they are meaningful for the current lifecycle state
- keep the card useful for both buyer and seller perspectives without duplicating layouts

### Important guardrail

Do not change backend order status rules in this phase. This is a presentation-alignment pass based on current business logic, not a workflow redesign.

### Outcome

The shipping card will read like a trustworthy operational summary rather than a partially filled admin form.

---

## Plan 14.3 — Clear the current TypeScript blockers needed to close the phase cleanly

**Goal:** Remove the known compile errors currently blocking a clean frontend verification pass.

### Files to Modify

**5. `FE/artium-web/src/@domains/artwork-detail/mock/mockArtworkDetail.ts`**

Adjust mock conversion code so optional avatar data from top-picks artwork remains type-safe.

**6. `FE/artium-web/src/@domains/auth/types/wallet.ts`**

Unify the local Ethereum provider typing with the shape used by `useWalletLogin` and the current browser declaration.

**7. `FE/artium-web/src/@domains/auth/hooks/useWalletLogin.ts`**

Resolve provider typing assumptions so `request()` accepts both array and object params where needed.

**8. `FE/artium-web/src/@domains/auth/views/LoginPage.tsx`**

Restore the missing wallet dialog state that the page already references.

### Verification targets

At minimum:

- `cd FE/artium-web && npx tsc --noemit`
- targeted eslint on touched order/auth/artwork files

If additional compile issues surface after these are fixed, capture them explicitly in phase validation rather than silently broadening scope.

### Outcome

The phase can close against real typecheck evidence instead of carrying forward already-known blockers.

---

## Implementation Notes

- Reuse existing shared primitives first: button, tooltip, and card rhythm already exist.
- Keep the copy behavior in shared UI, not bespoke order-domain code.
- Keep lifecycle interpretation in `orderPresentation.ts` or an adjacent presenter helper, not inline JSX condition pyramids.
- Preserve the current visual language from the orders workspace rather than introducing a new component style.
- Do not turn TypeScript cleanup into unrelated auth redesign; only clear the verified blockers.

---

## Verification Checklist

Phase 14 is complete when all of the following are true:

1. `/orders/[orderId]` shows copyable payment transaction and wallet hash fields with immediate tooltip/state feedback.
2. The copy interaction is implemented via a reusable shared component or helper, not duplicated inline event handlers.
3. The shipping card messaging changes meaningfully across order states and matches the existing order lifecycle rules.
4. Generic placeholders such as `Not assigned` no longer appear in states where shipping is simply not expected yet.
5. `cd FE/artium-web && npx tsc --noemit` exits successfully after the targeted support fixes.
6. Touched files pass targeted linting, and any residual warnings are documented explicitly.
