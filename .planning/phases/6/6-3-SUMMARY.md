---
phase: 6
plan: 3
subsystem: fe/checkout
tags: [payment, metamask, ethereum, react-hook-form, zod, discriminated-union]
dependency_graph:
  requires: [6-2-SUMMARY.md]
  provides: [card-wallet-payment-selector, wallet-payment-section, metamask-integration]
  affects: [BuyerCheckoutPageView, BuyerCheckoutPaymentForm, buyerCheckout.schema]
tech_stack:
  added: [WalletPaymentSection component, window.ethereum MetaMask integration]
  patterns: [Zod discriminated union, react-hook-form useFormContext with union type, CardSection sub-component]
key_files:
  created:
    - FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx
  modified:
    - FE/artium-web/src/@domains/checkout/validations/buyerCheckout.schema.ts
    - FE/artium-web/src/@domains/checkout/components/BuyerCheckoutPaymentForm.tsx
    - FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx
decisions:
  - Zod discriminated union (card | wallet) replaces flat object schema for payment
  - Removed wire transfer accordion UI; simplified to two-pill selector
  - Removed Google Pay / Klarna variants (not needed for crypto wallet feature)
  - window.ethereum global type sourced from existing @types/ethereum.d.ts (not re-declared)
  - ethAmount passed as undefined from BuyerCheckoutPageView (ETH conversion not in scope here)
metrics:
  duration: ~15m
  completed: "2026-04-23"
  tasks_completed: 3
  files_changed: 4
---

# Phase 6 Plan 3: Payment Method Selector — Card/Crypto Wallet Pills Summary

**One-liner:** Replaced flat payment schema with Zod discriminated union (card | wallet), rewrote `BuyerCheckoutPaymentForm` with two-pill selector, and created `WalletPaymentSection` with MetaMask connect + `eth_sendTransaction` flow.

## What Was Built

### Schema (`buyerCheckout.schema.ts`)
- `buyerCheckoutPaymentSchema` replaced from `z.object` (flat, with `google_pay`/`klarna` enum) to `z.discriminatedUnion('paymentMethod', [...])` 
- **card variant:** cardNumber, expiryDate (regex `MM / YY`), cvc (3–4 digits), country
- **wallet variant:** walletAddress (EIP-55 `0x...40hex`), txHash (`0x...64hex`)
- `BuyerCheckoutPaymentValues` type re-exported as union infer

### BuyerCheckoutPaymentForm (`BuyerCheckoutPaymentForm.tsx`)
- Removed: accordion toggle, wire transfer section, Google Pay / Klarna sub-options
- Added: two-pill method selector (Card | Crypto Wallet) using `cn()` styling
- `CardSection` sub-component retains all existing card field UI (number, expiry, CVC, country, Visa/MC logos, disclaimer text) exactly
- Wallet branch renders `WalletPaymentSection` with `onWalletConnected` / `onTxHashReceived` callbacks wired to `setValue`

### WalletPaymentSection (`WalletPaymentSection.tsx`)
- Pre-connect state: MetaMask fox emoji, descriptive text, "Connect Wallet" button
- Connect flow: `eth_requestAccounts` via `window.ethereum`, inline error state
- Post-connect state: green badge with truncated address
- Send ETH button (shown only when `ethAmount !== undefined` and no txHash yet): calls `eth_sendTransaction` with `NEXT_PUBLIC_PLATFORM_ETH_WALLET` as recipient
- Transaction hash display badge (truncated) after success
- All errors inline as `<p className="text-[12px] text-red-500">` — no `alert()`

### BuyerCheckoutPageView (`BuyerCheckoutPageView.tsx`)
- Updated `defaultValues` from `{ country: 'VN' }` to `{ country: '' }` per plan spec
- Passes `ethAmount={undefined}` to `BuyerCheckoutPaymentForm` (ETH price conversion not in scope for this plan)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Conflicting `Window.ethereum` declaration**
- **Found during:** Step 3 (build)
- **Issue:** `WalletPaymentSection.tsx` re-declared `window.ethereum` but `@types/ethereum.d.ts` already has a more complete declaration (includes `isMetaMask`, `on`, `removeListener`). TypeScript type error: "Subsequent property declarations must have the same type."
- **Fix:** Removed the `declare global { interface Window { ethereum? } }` block from `WalletPaymentSection.tsx`; relies on the project's existing `@types/ethereum.d.ts`
- **Files modified:** `WalletPaymentSection.tsx`

**2. [Rule 1 - Bug] TypeScript `any` cast in JSX props triggered ESLint**
- **Found during:** Step 2 (lint)
- **Issue:** `register as UseFormRegister<any>` etc. in JSX caused `@typescript-eslint/no-explicit-any` errors
- **Fix:** Removed explicit casts — TypeScript accepts direct assignment from typed `register`/`errors`/`setValue` to `any`-parameterized `CardSectionProps` without casts
- **Files modified:** `BuyerCheckoutPaymentForm.tsx`

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| `ethAmount={undefined}` passed to `BuyerCheckoutPaymentForm` | `BuyerCheckoutPageView.tsx` line ~300 | ETH price conversion (USD → ETH) requires exchange rate API; not in scope for plan 6.3. The "Send ETH" button in `WalletPaymentSection` will not appear until `ethAmount` is provided. Wallet connection still works. |

## Self-Check

### PASSED

- ✅ `WalletPaymentSection.tsx` — created at correct path
- ✅ `BuyerCheckoutPaymentForm.tsx` — modified with pill selector + CardSection
- ✅ `buyerCheckout.schema.ts` — discriminated union schema
- ✅ `BuyerCheckoutPageView.tsx` — defaultValues updated, ethAmount prop passed
- ✅ Commit `03b7f8aa` verified in git log
- ✅ Build passes (`npm run build`)
- ✅ No new lint errors in changed files (pre-existing warnings only)
