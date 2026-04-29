# Phase 07: Checkout Payment Feedback — Success & Error UI States - Pattern Map

**Mapped:** 2026-04-23  
**Files analyzed:** 6  
**Analogs found:** 6 / 6

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx` | component | request-response | `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx` | exact |
| `FE/artium-web/src/@domains/checkout/components/CheckoutSuccessScreen.tsx` | component | transform | `FE/artium-web/src/@domains/checkout/components/CheckoutSuccessScreen.tsx` | exact |
| `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx` | component | event-driven | `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx` | exact |
| `FE/artium-web/src/@domains/checkout/components/BuyerCheckoutPaymentForm.tsx` | component | transform | `FE/artium-web/src/@domains/checkout/components/BuyerCheckoutPaymentForm.tsx` | exact |
| `FE/artium-web/src/@domains/checkout/utils/paymentErrors.ts` | utility | transform | `FE/artium-web/src/@domains/checkout/utils/paymentErrors.ts` | exact |
| `FE/artium-web/src/pages/checkout/[artworkId].tsx` | route | request-response | `FE/artium-web/src/pages/checkout/[artworkId].tsx` | exact |

## Pattern Assignments

### `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx` (component, request-response)

**Primary analog:** `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`  
**Secondary analogs:**  
- `FE/artium-web/src/@domains/quick-sell/views/QuickSellCheckoutPageView.tsx`
- `FE/artium-web/src/@domains/quick-sell/components/checkout/QuickSellCheckoutStatusBanner.tsx`

**Imports + form setup pattern** (`BuyerCheckoutPageView.tsx` lines 1-28, 85-111):
```tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useRouter } from 'next/router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStripe, useElements, CardNumberElement } from '@stripe/react-stripe-js'

import { BuyerCheckoutLayout } from '../components/BuyerCheckoutLayout'
import { BuyerCheckoutContactForm } from '../components/BuyerCheckoutContactForm'
import { BuyerCheckoutPaymentForm } from '../components/BuyerCheckoutPaymentForm'
import { CheckoutSuccessScreen } from '../components/CheckoutSuccessScreen'
import { classifyPaymentError, type ClassifiedPaymentError } from '../utils/paymentErrors'
```
```tsx
const contactForm = useForm<BuyerCheckoutContactStepValues>({
  resolver: zodResolver(buyerCheckoutContactStepSchema),
  defaultValues: defaultBuyerCheckoutDraft,
  mode: 'onChange',
})
const paymentForm = useForm<BuyerCheckoutPaymentValues>({
  resolver: zodResolver(buyerCheckoutPaymentSchema),
  defaultValues: { paymentMethod: 'card', country: 'VN' },
  mode: 'onChange',
})
const watchedDraft = useWatch({ control: contactForm.control })
const watchedPaymentValues = useWatch({ control: paymentForm.control })
```

**Auth/prefill pattern** (`BuyerCheckoutPageView.tsx` lines 71-73, 147-156): checkout is not route-guarded; auth is used only to prefill contact fields.
```tsx
const { user, isAuthenticated } = useAuthStore()

useEffect(() => {
  if (isAuthenticated && user) {
    const nameParts = (user.displayName || user.username || '').split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    contactForm.setValue('contact.firstName', firstName)
    contactForm.setValue('contact.lastName', lastName)
    contactForm.setValue('contact.email', user.email || '')
  }
}, [contactForm, isAuthenticated, user])
```

**Core payment orchestration pattern** (`BuyerCheckoutPageView.tsx` lines 191-353):
```tsx
const handleContinue = useCallback(async () => {
  setPaymentError(null)

  if (step === 1) {
    const isStepValid = await contactForm.trigger()
    if (!isStepValid) {
      setPaymentError({ type: 'generic', message: 'Please fill in all contact information fields.' })
      return
    }
    setStep(2)
    return
  }

  if (paymentValues.paymentMethod === 'card' && (!stripe || !elements)) {
    setPaymentError({ type: 'generic', message: 'Payment form is not ready yet. Please wait a moment and try again.' })
    return
  }

  createdOrder = await orderApis.createOrder({
    sellerId: artwork.artistId || '',
    items: [{ artworkId: artwork.id, quantity: 1, price: artwork.price }],
    shippingAddress: shippingAddr,
    notes: undefined,
  })
  const intent = await paymentApis.createPaymentIntent({
    amount: Math.round(pricing.total * 100),
    currency: 'usd',
    orderId: createdOrder.id,
    sellerId: artwork.artistId || undefined,
    description: `Purchase: ${artwork.title}`,
  })
  const confirmation = await stripe!.confirmCardPayment(intent.clientSecret, {
    payment_method: {
      card: cardNumberEl,
      billing_details: {
        name: `${checkoutValues.contact.firstName} ${checkoutValues.contact.lastName}`.trim(),
        email: checkoutValues.contact.email,
        address: { country: paymentValues.country },
      },
    },
  })

  setPaymentResult({
    orderNumber: createdOrder.orderNumber,
    orderId: createdOrder.id,
    paymentMethod: 'card',
    isProcessing: confirmedStatus === 'processing',
    totalPaid: createdOrder.totalAmount,
  })
}, [artwork, artworkId, cardElementsComplete, contactForm, elements, paymentForm, pricing.total, router, step, stripe])
```

**Success rendering pattern** (`BuyerCheckoutPageView.tsx` lines 387-399):
```tsx
if (paymentResult) {
  return (
    <CheckoutSuccessScreen
      orderNumber={paymentResult.orderNumber}
      artwork={artwork}
      totalPaid={paymentResult.totalPaid}
      paymentMethod={paymentResult.paymentMethod}
      isProcessing={paymentResult.isProcessing}
      onContinueShopping={() => void router.push('/discover')}
    />
  )
}
```

**Error handling + orphan-order cleanup pattern** (`BuyerCheckoutPageView.tsx` lines 344-350):
```tsx
} catch (err) {
  if (createdOrder) {
    void orderApis.cancelOrder(createdOrder.id, 'Payment failed').catch(() => undefined)
  }
  setPaymentError(classifyPaymentError(err))
} finally {
  setIsLoading(false)
}
```

**Inline error banner placement pattern** (`BuyerCheckoutPageView.tsx` lines 448-456, `QuickSellCheckoutPageView.tsx` lines 422-427):
```tsx
{paymentError && (
  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
    <p className="text-[13px] font-semibold text-red-700">{paymentError.message}</p>
    {paymentError.type !== 'generic' && (
      <p className="mt-1 text-[12px] text-red-600">Your card has not been charged.</p>
    )}
  </div>
)}
```
```tsx
{redirect_status === 'failed' && (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4">
    <p className="font-medium text-red-900">Payment Failed</p>
    <p className="text-sm text-red-700">Please try again or use a different card.</p>
  </div>
)}
```

**Validation wiring pattern** (`BuyerCheckoutPageView.tsx` lines 85-97, 437-463):
```tsx
<FormProvider {...contactForm}>
  <BuyerCheckoutContactForm />
</FormProvider>
{paymentError && step === 1 && (
  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
    <p className="text-[13px] text-red-700">{paymentError.message}</p>
  </div>
)}
<FormProvider {...paymentForm}>
  <BuyerCheckoutPaymentForm
    ethAmount={pricing.total}
    onCardElementsChange={setCardElementsComplete}
  />
</FormProvider>
```

---

### `FE/artium-web/src/@domains/checkout/components/CheckoutSuccessScreen.tsx` (component, transform)

**Primary analog:** `FE/artium-web/src/@domains/checkout/components/CheckoutSuccessScreen.tsx`  
**Secondary analog:** `FE/artium-web/src/@domains/quick-sell/components/checkout/QuickSellPaidState.tsx`

**Imports + status-shell pattern** (`CheckoutSuccessScreen.tsx` lines 1-13, 24-35):
```tsx
import Link from 'next/link'
import { Check, Clock, Package, ShoppingBag } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

export const CheckoutSuccessScreen = ({
  orderNumber,
  artwork,
  totalPaid,
  paymentMethod,
  isProcessing,
  onContinueShopping,
}: CheckoutSuccessScreenProps) => {
  const formattedTotal = `$${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#FDFDFD] px-4 pb-16 pt-12 font-sans text-[#191414]">
```

**Success vs processing visual pattern** (`CheckoutSuccessScreen.tsx` lines 45-84, `QuickSellCheckoutStatusBanner.tsx` lines 33-67):
```tsx
<div
  className={cn(
    'animate-in fade-in zoom-in rounded-2xl border p-8 text-center duration-500',
    isProcessing ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50',
  )}
>
  {isProcessing ? <Clock className="h-8 w-8 text-amber-600" /> : <Check className="h-8 w-8 text-green-600" strokeWidth={3} />}
  <h1>{isProcessing ? 'Transaction Submitted' : 'Payment Successful'}</h1>
</div>
```
```tsx
if (status === 'PENDING') {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="font-semibold text-blue-900">Processing Payment</p>
    </div>
  )
}
```

**Content-structure pattern to preserve** (`QuickSellPaidState.tsx` lines 34-87, `CheckoutSuccessScreen.tsx` lines 87-143):
```tsx
<div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center animate-in fade-in zoom-in duration-500">
  <h2 className="text-2xl font-bold text-green-900">Payment Complete</h2>
  <p className="mt-2 text-green-800">
    Thank you! Invoice #{invoiceCode} has been paid successfully.
  </p>
</div>
<div className="space-y-4 rounded-lg bg-slate-50 p-6">
  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
    <Package className="h-5 w-5 text-slate-500" />
    What happens next?
  </h3>
</div>
```
```tsx
<div className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
  <img src={artwork.coverUrl} alt={artwork.title} className="h-full w-full object-cover" />
  <div className="min-w-0 flex-1">
    <p className="truncate text-[15px] font-bold text-[#191414]">{artwork.title}</p>
    <p className="mt-0.5 truncate text-[13px] text-[#595959]">{artwork.artistName}</p>
  </div>
</div>
<div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
  <h2 className="flex items-center gap-2 text-[14px] font-bold text-[#191414]">
    <Package className="h-4 w-4 text-[#595959]" />
    What happens next
  </h2>
</div>
```

**CTA pattern** (`CheckoutSuccessScreen.tsx` lines 133-142):
```tsx
<Button
  type="button"
  onClick={onContinueShopping}
  className="flex-1 gap-2 rounded-full bg-[#0066FF] py-3 text-[14px] font-semibold text-white hover:bg-blue-700"
>
  <ShoppingBag className="h-4 w-4" />
  Continue Shopping
</Button>
```

---

### `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx` (component, event-driven)

**Primary analog:** `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx`

**Error classification pattern** (`WalletPaymentSection.tsx` lines 4-19):
```tsx
type MetaMaskError = { code?: number; message?: string }

function classifyMetaMaskError(err: unknown): { message: string; canRetry: boolean } {
  const code = (err as MetaMaskError)?.code
  if (code === 4001 || (err instanceof Error && err.message.toLowerCase().includes('user rejected'))) {
    return { message: 'You rejected the request in MetaMask. Click below to try again.', canRetry: true }
  }
  if (code === -32002) {
    return {
      message: 'A MetaMask request is already pending. Open MetaMask to approve or reject it.',
      canRetry: false,
    }
  }
  const raw = err instanceof Error ? err.message : 'Failed to connect wallet'
  return { message: raw, canRetry: true }
}
```

**Wallet connect/transaction callback pattern** (`WalletPaymentSection.tsx` lines 46-89):
```tsx
const connectWallet = useCallback(async () => {
  const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[]
  const address = accounts[0]
  setWalletAddress(address)
  onWalletConnected(address)
}, [onWalletConnected])

const sendEthTransaction = useCallback(async () => {
  setTxHash('')
  onTxHashCleared?.()
  const hash = (await window.ethereum!.request({
    method: 'eth_sendTransaction',
    params: [{ from: walletAddress, to: toAddress, value: `0x${amountInWei}` }],
  })) as string
  setTxHash(hash)
  onTxHashReceived(hash)
}, [ethAmount, onTxHashCleared, onTxHashReceived, walletAddress])
```

**Retry affordance pattern** (`WalletPaymentSection.tsx` lines 115-127, 168-179):
```tsx
{connectError && (
  <div className="flex flex-col items-center gap-2 text-center">
    <p className="text-[12px] text-red-500">{connectError.message}</p>
    {connectError.canRetry && (
      <button type="button" onClick={connectWallet} className="text-[12px] font-semibold text-[#0066FF] underline">
        Try Again
      </button>
    )}
  </div>
)}
```
```tsx
{txError && (
  <div className="flex flex-col gap-2">
    <p className="text-[12px] text-red-500">{txError.message}</p>
    {txError.canRetry && (
      <button type="button" onClick={sendEthTransaction} className="self-start text-[12px] font-semibold text-[#0066FF] underline">
        Retry Transaction
      </button>
    )}
  </div>
)}
```

**Validation handoff pattern** (`WalletPaymentSection.tsx` lines 183-185):
```tsx
{errors?.txHash?.message && (
  <p className="text-[12px] text-red-500">{String(errors.txHash.message)}</p>
)}
```

---

### `FE/artium-web/src/@domains/checkout/components/BuyerCheckoutPaymentForm.tsx` (component, transform)

**Primary analog:** `FE/artium-web/src/@domains/checkout/components/BuyerCheckoutPaymentForm.tsx`  
**Secondary analog:** `FE/artium-web/src/@domains/quick-sell/components/checkout/QuickSellPaymentForm.tsx`

**Import + local Stripe-element styling pattern** (`BuyerCheckoutPaymentForm.tsx` lines 1-29):
```tsx
import { useFormContext, useWatch } from 'react-hook-form'
import { CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import { CreditCard } from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { WalletPaymentSection } from './WalletPaymentSection'

const METHOD_OPTIONS = [
  { value: 'card' as const, label: 'Card', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'wallet' as const, label: 'Crypto Wallet', icon: <span className="text-lg">🦊</span> },
]
```

**Method-switch pattern** (`BuyerCheckoutPaymentForm.tsx` lines 165-180):
```tsx
const paymentMethod = useWatch({ name: 'paymentMethod' }) ?? 'card'
const selectedCountry = useWatch({ name: 'country' }) ?? 'VN'

const handleMethodChange = (method: 'card' | 'wallet') => {
  setValue('paymentMethod', method, { shouldDirty: true, shouldValidate: true })
  onCardElementsChange?.(false)
  if (method === 'card') {
    setValue('walletAddress' as any, '', { shouldDirty: true, shouldValidate: false })
    setValue('txHash' as any, '', { shouldDirty: true, shouldValidate: false })
  }
}
```

**Conditional card/wallet composition pattern** (`BuyerCheckoutPaymentForm.tsx` lines 182-237):
```tsx
{paymentMethod === 'card' && (
  <StripeCardSection
    setValue={setValue}
    selectedCountry={selectedCountry}
    onCardElementsChange={onCardElementsChange ?? (() => undefined)}
  />
)}

{paymentMethod === 'wallet' && (
  <WalletPaymentSection
    ethAmount={ethAmount}
    onWalletConnected={(address) => setValue('walletAddress' as any, address, { shouldDirty: true, shouldValidate: true })}
    onTxHashReceived={(hash) => setValue('txHash' as any, hash, { shouldDirty: true, shouldValidate: true })}
    onTxHashCleared={() => setValue('txHash' as any, '', { shouldDirty: true, shouldValidate: true })}
    errors={errors}
  />
)}
```

**Card field error/focus pattern** (`BuyerCheckoutPaymentForm.tsx` lines 44-67, 73-127):
```tsx
const fieldBorderClass = (error?: string, fieldName?: string) =>
  cn(
    'h-12 flex items-center rounded-xl border px-4 bg-white transition-colors',
    error ? 'border-red-500' : focusedField === fieldName ? 'border-[#0066FF]' : 'border-[#E5E5E5]',
  )
```

---

### `FE/artium-web/src/@domains/checkout/utils/paymentErrors.ts` (utility, transform)

**Primary analog:** `FE/artium-web/src/@domains/checkout/utils/paymentErrors.ts`

**Pure classifier pattern** (`paymentErrors.ts` lines 1-56):
```ts
export type PaymentErrorType =
  | 'card_declined'
  | 'insufficient_funds'
  | 'incorrect_cvc'
  | 'expired_card'
  | 'network'
  | 'generic'

export type ClassifiedPaymentError = {
  type: PaymentErrorType
  message: string
}

export function classifyPaymentError(err: unknown): ClassifiedPaymentError {
  const raw = err instanceof Error ? err.message : String(err ?? '')
  const lower = raw.toLowerCase()

  if (lower.includes('card_declined') || lower.includes('your card was declined')) {
    return { type: 'card_declined', message: 'Your card was declined. Please check your details or try a different card.' }
  }
  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('timeout')) {
    return { type: 'network', message: 'Network error. Please check your connection and try again.' }
  }

  return { type: 'generic', message: raw || 'Payment failed. Please try again.' }
}
```

**Usage pattern to copy** (`BuyerCheckoutPageView.tsx` lines 344-350):
```tsx
setPaymentError(classifyPaymentError(err))
```

---

### `FE/artium-web/src/pages/checkout/[artworkId].tsx` (route, request-response)

**Primary analog:** `FE/artium-web/src/pages/checkout/[artworkId].tsx`

**Route-shell pattern** (`[artworkId].tsx` lines 15-40):
```tsx
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const BuyerCheckoutPageView = dynamic(
  () =>
    import('@domains/checkout/views/BuyerCheckoutPageView').then(
      (module) => module.BuyerCheckoutPageView,
    ),
  { ssr: false },
)

return (
  <Elements stripe={stripePromise}>
    <Metadata title="Checkout | Artium" />
    <BuyerCheckoutPageView artworkId={artworkIdStr} />
  </Elements>
)
```

**Page-rule pattern** (`[artworkId].tsx` lines 27-47): keep root page thin; business logic stays in `@domains/checkout/views`.
```tsx
const CheckoutArtworkRoute: NextPageWithLayout = () => {
  const router = useRouter()
  const { artworkId } = router.query
  const artworkIdStr = typeof artworkId === 'string' ? artworkId : undefined
  if (!artworkIdStr) return null
  return (
    <Elements stripe={stripePromise}>
      <Metadata title="Checkout | Artium" />
      <BuyerCheckoutPageView artworkId={artworkIdStr} />
    </Elements>
  )
}

CheckoutArtworkRoute.getLayout = (page) => page
```

## Shared Patterns

### Stripe bootstrapping
**Source:** `FE/artium-web/src/pages/checkout/[artworkId].tsx` lines 15-40  
**Apply to:** checkout route shell and any payment page wrappers
```tsx
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
const BuyerCheckoutPageView = dynamic(
  () =>
    import('@domains/checkout/views/BuyerCheckoutPageView').then(
      (module) => module.BuyerCheckoutPageView,
    ),
  { ssr: false },
)
<Elements stripe={stripePromise}>
  <BuyerCheckoutPageView artworkId={artworkIdStr} />
</Elements>
```

### Dual-form state preservation with RHF
**Source:** `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx` lines 85-111, 437-463  
**Apply to:** step transitions and retry flows that must preserve step-1 contact data
```tsx
const contactForm = useForm<BuyerCheckoutContactStepValues>({
  resolver: zodResolver(buyerCheckoutContactStepSchema),
  defaultValues: defaultBuyerCheckoutDraft,
  mode: 'onChange',
})
const paymentForm = useForm<BuyerCheckoutPaymentValues>({
  resolver: zodResolver(buyerCheckoutPaymentSchema),
  defaultValues: { paymentMethod: 'card', country: 'VN' },
  mode: 'onChange',
})
const watchedDraft = useWatch({ control: contactForm.control })
const watchedPaymentValues = useWatch({ control: paymentForm.control })
<FormProvider {...contactForm}><BuyerCheckoutContactForm /></FormProvider>
<FormProvider {...paymentForm}>
  <BuyerCheckoutPaymentForm ethAmount={pricing.total} onCardElementsChange={setCardElementsComplete} />
</FormProvider>
```

### Inline error banner placement
**Source:** `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx` lines 448-456  
**Apply to:** card/network/API retry messaging above the payment form
```tsx
<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
  <p className="text-[13px] font-semibold text-red-700">{paymentError.message}</p>
</div>
```

### Success / processing outcome surfaces
**Sources:**  
- `FE/artium-web/src/@domains/checkout/components/CheckoutSuccessScreen.tsx` lines 45-84  
- `FE/artium-web/src/@domains/quick-sell/components/checkout/QuickSellPaidState.tsx` lines 34-87  
**Apply to:** inline step-3 success and wallet-processing variants
```tsx
isProcessing ? 'Transaction Submitted' : 'Payment Successful'
```
```tsx
<h3 className="flex items-center gap-2 font-semibold text-slate-900">
  <Package className="h-5 w-5 text-slate-500" />
  What happens next?
</h3>
```

### Wallet retry affordances
**Source:** `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx` lines 115-179  
**Apply to:** MetaMask connect and transaction rejection flows
```tsx
{connectError.canRetry && <button onClick={connectWallet}>Try Again</button>}
{txError.canRetry && <button onClick={sendEthTransaction}>Retry Transaction</button>}
```

## No Analog Found

None. Current checkout code already contains live in-scope implementations for all Phase 07 files; planner should refine existing files rather than invent parallel structures.

## Metadata

**Analog search scope:**  
- `FE/artium-web/src/@domains/checkout/`
- `FE/artium-web/src/@domains/quick-sell/`
- `FE/artium-web/src/pages/checkout/`

**Files scanned:** 60  
**Checkout/quick-sell test analogs found:** 0  
**Pattern extraction date:** 2026-04-23
