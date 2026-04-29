# Phase 16: Shared Form Field Standardization and Multi-Domain Text-Entry Migration

## Goal

Turn `FE/artium-web/src/@shared/components/forms` into the real app-wide foundation for text-entry fields, with one consistent shared contract for field shell, text input, password input, textarea, and autocomplete, plus controlled migration of page-level raw `Input` / `Textarea` / `Label` usage onto those primitives across the main form-heavy domains.

This phase is planned directly from the live codebase. No separate research artifact is required because the gaps are already concrete in the current shared form files and in the large number of still-unmigrated page surfaces.

---

## Root Cause (confirmed by code audit)

### 1) The current shared forms layer is too thin to be a real platform contract

`@shared/components/forms` currently exposes:

- `BaseFormField`
- `BaseInputField`
- `BasePasswordInputField`
- `BaseAutocompleteField`

But the abstraction is incomplete:

- `BaseFormField.tsx` is only a label/message wrapper
- `BaseInputField.tsx` and `BasePasswordInputField.tsx` use overlapping but different prop conventions
- there is no shared textarea field
- there is no normalized field-shell prop model for description, error, required, ids, disabled states, and slot styling
- autocomplete still owns too much ad hoc dropdown behavior and styling at the component call site

So the shared layer exists, but it is not yet strong enough to standardize text-entry behavior across the app.

### 2) Domain wrappers are only partially standardized

Auth has relatively clean thin wrappers:

- `AuthInput.tsx`
- `AuthPasswordInput.tsx`
- `AuthFormFields.tsx`
- `AuthOtpCodeInput.tsx`

But other domains still bypass the shared layer and re-implement the same field patterns inline.

Concrete examples confirmed in the codebase:

- checkout contact forms use raw `Input` + `label` + error spans
- quick-sell invoice and checkout forms use many local `Input` / `Textarea` / `Label` combinations
- orders action panels still render raw text-entry controls
- shared address fields only use shared autocomplete, while address lines and postal code still use raw inputs
- inventory-upload, profile, and events still contain many page-local text-entry blocks

That means the shared layer cannot currently enforce consistency, because too much field behavior still lives in page JSX.

### 3) The migration surface is broad enough that it needs wave-based planning

This is not a single-file cleanup.

The current migration footprint spans at least:

- `auth`
- `checkout`
- `quick-sell`
- `orders`
- `shared/address`
- `inventory-upload`
- `profile`
- `events`

Trying to replace all raw field usage blindly in one pass would create avoidable regression risk. The right move is a phased field-family upgrade followed by domain migration waves.

### 4) The existing roadmap history says forms should already be standardized, but the live codebase says otherwise

Earlier roadmap phases 2–5 originally carried the shared-form migration story, but the current live implementation still contains many raw field surfaces.

So Phase 16 should be treated as pragmatic catch-up work:

- do not assume the old migration phases are complete just because the roadmap once intended them
- plan against the current codebase reality
- use this phase to establish the field contract the rest of the app can actually build on

---

## Architecture Direction

The right approach is:

1. strengthen the shared text-entry field family first
2. keep domain wrappers as thin styling adapters
3. migrate consuming pages in controlled waves

The shared layer should own:

- ids and labeling semantics
- required markers
- description vs error messaging
- field-level accessibility attributes
- consistent prop names
- reusable shell structure

The domain layer should own:

- local visual language
- small copy differences
- RHF binding helpers where a domain benefits from them

This keeps the form system scalable without forcing every domain into identical visuals.

---

## Plan 16.1 — Rebuild the shared text-entry field family around one coherent contract

**Goal:** Make `@shared/components/forms` the single reliable contract for app text-entry fields.

### Files to Modify

**1. `FE/artium-web/src/@shared/components/forms/BaseFormField.tsx`**

Evolve this into the canonical field shell for text-entry controls.

It should centrally handle:

- `id`
- `label`
- `required`
- `description`
- `errorMessage`
- message precedence
- semantic label/message structure
- shared wrapper slot classes

Recommended contract direction:

- keep names straightforward and stable
- remove ambiguous overlap between `className` and many near-duplicate styling props where possible
- prefer a small set of slot-oriented escape hatches over uncontrolled prop sprawl

**2. `FE/artium-web/src/@shared/components/forms/BaseInputField.tsx`**

Refactor onto the new field-shell contract.

Recommended direction:

- stop treating `hasError` as a separate source of truth when `errorMessage` already exists
- align class prop names with the shell
- preserve `forwardRef`
- keep it as a thin wrapper over shared `Input`

**3. `FE/artium-web/src/@shared/components/forms/BasePasswordInputField.tsx`**

Refactor to match the same contract and slot model as text input.

Recommended direction:

- keep password visibility behavior local to this component
- align error/description/label semantics with the base input field
- avoid password-specific prop names that duplicate general shell concerns

**4. `FE/artium-web/src/@shared/components/forms/BaseAutocompleteField.tsx`**

Normalize autocomplete so it fits the same shared field family instead of behaving like a standalone mini-system.

Recommended direction:

- use the same shell semantics as other shared fields
- keep option/dropdown styling configurable but not uncontrolled
- preserve current UX parity for address and country/state/city flows

**5. `FE/artium-web/src/@shared/components/forms/BaseTextareaField.tsx`**

Create the missing shared textarea field.

This should mirror the text-input contract closely so page migrations can replace raw textarea blocks without inventing one-off wrappers.

**6. `FE/artium-web/src/@shared/components/forms/index.ts`**

Export the stabilized field family cleanly.

### Outcome

After this plan, the app has one real shared text-entry field family rather than a partial wrapper set.

---

## Plan 16.2 — Keep domain wrappers thin and migrate the first high-value surfaces

**Goal:** Move the most important form-heavy flows onto the standardized shared family without mixing in unrelated redesign work.

### Files to Modify

**7. `FE/artium-web/src/@domains/auth/components/AuthInput.tsx`**
**8. `FE/artium-web/src/@domains/auth/components/AuthPasswordInput.tsx`**
**9. `FE/artium-web/src/@domains/auth/components/AuthOtpCodeInput.tsx`**
**10. `FE/artium-web/src/@domains/auth/components/AuthFormFields.tsx`**

Auth should remain the clearest example of the target architecture:

- shared components own semantics
- auth wrappers only apply auth-specific styling and RHF ergonomics

Do not let auth wrappers drift into parallel shared components.

**11. `FE/artium-web/src/@shared/components/address/AddressFormFields.tsx`**

Migrate address line and postal-code fields onto the shared family so the component stops mixing shared autocomplete with raw inline inputs.

This file is important because it is reused by checkout and other flows.

**12. `FE/artium-web/src/@domains/checkout/components/BuyerCheckoutContactForm.tsx`**

Replace page-local raw field blocks with standardized field components where they map cleanly.

This should include:

- first name
- last name
- email
- phone
- address-backed text-entry fields through `AddressFormFields`

### Scope guardrail

Do not redesign the checkout layout. Preserve the current visual language while swapping the field implementation underneath.

### Outcome

The most user-visible, validation-heavy flows move onto the new contract first.

---

## Plan 16.3 — Migrate quick-sell, orders, and remaining raw text-entry surfaces in controlled waves

**Goal:** Eliminate the highest-value raw `Input` / `Textarea` / `Label` duplication across the remaining app domains that match the new shared field family.

### Primary wave

**13. `FE/artium-web/src/@domains/quick-sell/components/create/QuickSellInvoiceForm.tsx`**
**14. `FE/artium-web/src/@domains/quick-sell/components/create/QuickSellArtworkItemRow.tsx`**
**15. `FE/artium-web/src/@domains/quick-sell/components/create/QuickSellCustomItemRow.tsx`**
**16. `FE/artium-web/src/@domains/quick-sell/components/checkout/QuickSellCheckoutMainContent.tsx`**
**17. `FE/artium-web/src/@domains/quick-sell/components/checkout/QuickSellBuyerAddressForm.tsx`**

Quick-sell is one of the largest remaining concentrations of repeated field markup. It should be part of the planned migration, not left behind.

**18. `FE/artium-web/src/@domains/orders/components/OrderActionPanel.tsx`**

Use the new shared text-entry family for seller shipment inputs and buyer dispute/notes textareas.

### Secondary wave

Target the remaining domains with obvious text-entry duplication that cleanly matches the shared family:

- inventory-upload text inputs / textareas
- profile text-entry blocks
- events forms

The planner or executor can group these by write scope and regression risk, but the migration target should be explicit.

### Important guardrail

Only migrate surfaces that are genuinely text-entry field patterns.

Do not widen this phase into:

- file upload widgets
- date pickers
- calendar/time systems
- select menus unrelated to text-entry patterns
- rich text or markdown editors

Those are separate control families and should not be forced into this phase.

### Outcome

Raw duplicated text-entry patterns are substantially reduced across the app, and the shared field family becomes the default path instead of an optional helper.

---

## Verification Strategy

This phase needs both type/lint verification and representative form-flow confidence.

### Required engineering checks

- `cd FE/artium-web && npx tsc --noemit`
- targeted eslint on:
  - `src/@shared/components/forms`
  - `src/@shared/components/address`
  - touched auth / checkout / quick-sell / orders / inventory-upload / profile / events files

### Required behavioral checks

At minimum, executor validation should cover:

1. auth sign-in / sign-up / reset flows still show correct field labels and inline errors
2. checkout contact step still validates and preserves current UI
3. quick-sell create-invoice and checkout surfaces still render and validate correctly
4. orders action panel still accepts shipment notes, dispute reason, and delivery notes correctly
5. address flows still support country/state/city autocomplete plus address line and postal code validation

### Build note

If `npm run build` still stalls under the current environment, record that clearly as an environment-side limitation rather than silently treating it as passed.

---

## Implementation Notes

- Prefer parity-first migration, not visual redesign.
- Shared props must become simpler and more coherent, not more configurable in every direction.
- Domain wrappers should be thinner after this phase, not thicker.
- Keep RHF integration patterns consistent; do not invent one binding style per domain.
- Where possible, migrate repeated local label/error/counter patterns into shared field capabilities instead of copying them into wrappers again.

---

## Verification Checklist

Phase 16 is complete when all of the following are true:

1. `@shared/components/forms` exposes a coherent text-entry family with a consistent shared contract.
2. Auth wrappers remain thin adapters over the shared layer rather than parallel implementations.
3. Shared address fields no longer mix standardized autocomplete with ad hoc raw text-entry controls.
4. Checkout, quick-sell, orders, and the targeted remaining domains are materially migrated off repeated raw `Input` / `Textarea` / `Label` patterns where they match the shared field family.
5. `cd FE/artium-web && npx tsc --noemit` passes after the refactor.
6. Targeted lint passes, and any residual warnings or skipped surfaces are documented explicitly.
