# Phase 7: Checkout Payment Feedback — Success & Error UI States

## Goal

After "Pay Now" is clicked on `/checkout/[artworkId]`:
- **Success**: show an inline step-3 success screen (no redirect) with order confirmation, artwork summary, "what happens next", and a CTA — mirroring the `QuickSellPaidState` reference pattern.
- **Failure**: show specific, retry-friendly inline error messages classified by error type (card declined, network, wallet rejected) instead of a single generic string.

---

## Root Cause (confirmed by code audit)

In `BuyerCheckoutPageView.tsx` (line 268):
```ts
void router.push(`/discover?checkout=success&orderNumber=${order.orderNumber}`)
```
- `DiscoverPage` never reads `?checkout=success` — the query param is silently dropped.
- No step-3 state exists; the checkout layout is immediately torn down.
- Error handling uses a single `setError(message)` regardless of error type.

---

## Plan 7.1 — Checkout Success & Error UI

### Files to Create

**1. `FE/artium-web/src/@domains/checkout/components/CheckoutSuccessScreen.tsx`**

Inline success component rendered as step 3 inside the existing checkout page (no layout/routing change needed).

Props:
```ts
type CheckoutSuccessScreenProps = {
  orderNumber: string
  artwork: ArtworkForCheckout
  pricing: CheckoutPricing
  paymentMethod: 'card' | 'wallet'
  onContinueShopping: () => void
}
```

Structure:
- Green animated checkmark badge (`animate-in fade-in zoom-in duration-500`)
- "Payment Successful" heading + order number
- Artwork thumbnail + title + artist name row
- Total paid (formatted)
- "What happens next" 3-step list (artist notified → prepared for shipment → tracking email)
- "Continue Shopping" button → calls `onContinueShopping`

**2. `FE/artium-web/src/@domains/checkout/utils/paymentErrors.ts`**

Pure error classification utility (no React):
```ts
export type PaymentErrorType = 'card_declined' | 'insufficient_funds' | 'incorrect_cvc' | 'expired_card' | 'network' | 'wallet_rejected' | 'wallet_pending' | 'generic'

export type ClassifiedPaymentError = {
  type: PaymentErrorType
  message: string
  retryable: boolean
}

export function classifyPaymentError(err: unknown): ClassifiedPaymentError
```

Classification rules (match against `err.message` lowercased):
- `card_declined` / "your card was declined" → "Your card was declined. Please check your details or try a different card."
- `insufficient_funds` → "Your card has insufficient funds. Please use a different card."
- `incorrect_cvc` / "security code" → "Your card's security code is incorrect."
- `expired_card` / "expired" → "Your card has expired. Please use a different card."
- "network" / "failed to fetch" / "econnrefused" / "timeout" → "Network error. Please check your connection and try again."
- "payment account" / "customer" → "Failed to set up your payment account. Please try again."
- Default → original `err.message` or "Payment failed. Please try again."

All types are `retryable: true` except `generic` (still retryable). No type is non-retryable (always offer retry).

### Files to Modify

**3. `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`**

Changes:
1. Add `PaymentResult` type inline:
   ```ts
   type PaymentResult = {
     orderNumber: string
     paymentMethod: 'card' | 'wallet'
   }
   ```
2. Add state: `const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)`
3. On success (line 268): replace `void router.push(...)` with:
   ```ts
   setPaymentResult({ orderNumber: order.orderNumber, paymentMethod: paymentValues.paymentMethod as 'card' | 'wallet' })
   ```
4. In catch block: replace `setError(message)` with:
   ```ts
   const classified = classifyPaymentError(err)
   setError(classified.message)
   ```
5. Add render branch **before** the main return:
   ```tsx
   if (paymentResult && artwork) {
     return (
       <CheckoutSuccessScreen
         orderNumber={paymentResult.orderNumber}
         artwork={artwork}
         pricing={pricing}
         paymentMethod={paymentResult.paymentMethod}
         onContinueShopping={() => void router.push('/discover')}
       />
     )
   }
   ```
6. Move step-2 error display to **above** the payment form (not below) so it's immediately visible.

**4. `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx`**

Improve MetaMask error classification in `connectWallet` and `sendEthTransaction` catch blocks:
```ts
function classifyMetaMaskError(err: unknown): string {
  // MetaMask error codes
  const code = (err as { code?: number })?.code
  if (code === 4001) return 'You rejected the request in MetaMask. Click "Connect Wallet" to try again.'
  if (code === -32002) return 'A MetaMask request is already pending. Open MetaMask to approve or reject it.'
  const msg = err instanceof Error ? err.message : 'Unknown error'
  if (msg.toLowerCase().includes('user rejected')) return 'You rejected the transaction in MetaMask.'
  return msg || 'Failed to connect wallet. Please try again.'
}
```

Add "Retry" button below `connectError` to re-call `connectWallet` without full page reload:
```tsx
{connectError && (
  <div className="flex flex-col items-center gap-2">
    <p className="text-[12px] text-red-500 text-center">{connectError}</p>
    <button type="button" onClick={connectWallet} className="text-[12px] text-[#0066FF] underline">
      Try Again
    </button>
  </div>
)}
```

Same pattern for `txError` → "Retry Transaction" button re-calls `sendEthTransaction`.

---

## Verification Steps

1. `npx tsc --noemit` exits 0 (from `FE/artium-web/`)
2. `npm run build` exits 0
3. Manual: click Pay Now with valid card → step 3 success screen renders (no redirect)
4. Manual: simulate network failure → specific inline error shown, form intact, retry works
5. Manual: reject MetaMask prompt → inline error with retry link

---

## Notes

- `CheckoutSuccessScreen` renders **outside** `BuyerCheckoutLayout` (no footer/header/timer needed on success).
- Error display moved **above** payment form (step 2) so it's above the fold on mobile.
- No new API calls, no router changes, no backend changes.
- `paymentResult.orderNumber` comes from `order.orderNumber` which is already returned by `orderApis.createOrder()`.
