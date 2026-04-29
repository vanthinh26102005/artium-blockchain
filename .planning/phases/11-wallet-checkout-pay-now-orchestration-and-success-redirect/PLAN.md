# Phase 11: Wallet Checkout Pay-Now Orchestration & Success Redirect

## Goal

Make wallet checkout behave like the main checkout flow instead of a nested sub-flow:

1. the wallet panel displays wallet, network, and quote status only,
2. the main checkout `Pay Now` button owns wallet submit orchestration,
3. `Pay Now` creates the order, triggers the MetaMask transaction, records the Ethereum payment, and then transitions to the existing checkout success state,
4. wallet retry / cancel / back-out flows remain clean and do not leave stale state or orphaned orders behind.

This phase plans directly from the roadmap and live code. No separate research artifact is needed because the implementation is a direct follow-on to Phases 7 and 8.

---

## Root Cause (confirmed by code audit)

### 1) Wallet checkout is split across two submit surfaces

Today the wallet flow is split between:

- `WalletPaymentSection.tsx`, which owns the standalone `Send ... ETH on Sepolia` button and submits the MetaMask transaction itself
- `BuyerCheckoutPageView.tsx`, which owns the main checkout `Pay Now` button and only continues after a `txHash` has already been written into the form

That means the buyer must complete a wallet-specific transaction step before the real checkout submit button does its work. The checkout page is not the true orchestrator.

### 2) The form contract is shaped around pre-submitted tx state instead of checkout intent

`buyerCheckoutPaymentSchema` currently requires `txHash` for wallet validity, and `isWalletReady` in `BuyerCheckoutPageView.tsx` also depends on `txHash`.

That makes the flow backwards:

- the user must have already sent the transaction before `Pay Now` becomes enabled
- `Pay Now` no longer means "begin checkout" for wallet payments

For a clean UX, `Pay Now` should become the moment that the wallet payment is attempted.

### 3) MetaMask orchestration is buried inside a presentation component

`WalletPaymentSection.tsx` currently mixes:

- wallet connection / account state
- chain switching
- quote display
- transaction submission
- tx hash lifecycle
- retry UX

That concentration makes the component harder to reason about and forces page-level orchestration to depend on side effects from a child component.

### 4) Wallet success already has the right terminal state, but it is reached through the wrong path

`BuyerCheckoutPageView.tsx` already persists `CheckoutSuccessState` and renders `CheckoutSuccessScreen` for wallet payments after `recordEthereumPayment()` succeeds.

So the missing piece is not a brand-new success experience. The missing piece is to route wallet checkout through the existing page-owned success path after page-owned MetaMask orchestration.

---

## Architecture Direction

This phase should move wallet checkout to a clean split:

- `BuyerCheckoutPageView.tsx` is the orchestration layer for wallet checkout submit
- `WalletPaymentSection.tsx` is a display + local wallet-control surface for connection/network/quote visibility
- MetaMask transaction submission logic lives in a reusable wallet checkout hook or controller owned by the checkout domain, not in the presentational wallet section

Recommended structure:

- Create `useWalletCheckout.ts` (or an equivalent domain hook/controller) that encapsulates:
  - wallet connection state
  - current account and chain state
  - Sepolia enforcement
  - quote-bound transaction submission
  - tx hash / in-flight / retry state
- `BuyerCheckoutPageView.tsx` calls that hook and invokes `submitWalletPayment()` from the main `handleContinue()`
- `WalletPaymentSection.tsx` receives derived state and commands as props and no longer contains a standalone send button

This keeps control flow at the page level and keeps the wallet panel focused on UX presentation.

---

## Plan 11.1 — Extract wallet submit orchestration out of the wallet panel

**Goal:** Remove MetaMask transaction submission from `WalletPaymentSection` so the wallet panel becomes detail-only.

### Files to Create

**1. `FE/artium-web/src/@domains/checkout/hooks/useWalletCheckout.ts`**

Create a domain hook that owns wallet orchestration state and actions for checkout.

Recommended surface:

```ts
type WalletCheckoutState = {
  walletAddress: string
  currentChainId: string | null
  txHash: string
  isConnecting: boolean
  isSubmittingPayment: boolean
  connectError: WalletErrorState | null
  networkError: WalletErrorState | null
  transactionError: WalletErrorState | null
  isOnRequiredChain: boolean
}

type UseWalletCheckoutArgs = {
  quote: EthereumQuoteResponse | null
  isQuoteExpired: boolean
}

type UseWalletCheckoutResult = WalletCheckoutState & {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToRequiredChain: () => Promise<boolean>
  clearTransactionState: () => void
  submitQuotedTransaction: () => Promise<{ txHash: string }>
}
```

Responsibilities:

- sync `eth_accounts` and `eth_chainId`
- subscribe to `accountsChanged` / `chainChanged`
- normalize chain IDs
- enforce Sepolia before submission
- submit `eth_sendTransaction` using `quote.weiHex`
- centralize MetaMask error classification
- own in-flight state and transaction hash lifecycle

Do not make this hook depend on `react-hook-form`. It should be form-agnostic.

### Files to Modify

**2. `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx`**

Refactor into a view component that:

- shows quote details
- shows connected wallet address
- shows active network state
- exposes Connect / Disconnect / Switch to Sepolia / Refresh Quote actions
- optionally displays the most recent tx hash after the main `Pay Now` flow submits it

Remove the standalone orange submit button:

- delete `Send ... ETH on Sepolia`
- delete direct `eth_sendTransaction` ownership from this component

The wallet section should no longer be able to complete payment by itself.

**3. `FE/artium-web/src/@domains/checkout/components/BuyerCheckoutPaymentForm.tsx`**

Replace transaction-side-effect callbacks with a cleaner wallet state prop surface.

Recommended direction:

- keep this component as the composition layer between the page and `WalletPaymentSection`
- stop treating `txHash` as a prerequisite for wallet form validity
- pass wallet state/actions from the page-owned hook into `WalletPaymentSection`

The form should remain responsible for payment-method selection, not payment execution.

---

## Plan 11.2 — Make the main `Pay Now` button own wallet checkout end-to-end

**Goal:** `BuyerCheckoutPageView.tsx` becomes the single orchestrator for wallet checkout submit.

### Files to Modify

**4. `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`**

Rework wallet submit flow inside `handleContinue()`:

1. Validate step-1 data as today
2. Validate wallet readiness at the page level:
   - quote exists
   - quote not expired
   - wallet connected
   - chain is Sepolia or can be switched before send
3. Create the order
4. Trigger MetaMask transaction by calling the extracted wallet-submit action
5. Call `paymentApis.recordEthereumPayment()` with:
   - `txHash`
   - `walletAddress`
   - `orderId`
   - `amount = walletQuote.usdAmount`
   - `currency = 'USD'`
   - `quoteToken`
   - `chainId`
6. Persist `CheckoutSuccessState`
7. Transition to `CheckoutSuccessScreen`

Keep best-effort orphan cleanup:

- if order creation succeeds but transaction submission or payment recording fails, cancel the created order using the existing cancellation path

Do not create a second wallet-specific success route. Reuse the existing success-screen branch already used by checkout.

### Required behavior changes

**Wallet validity**

Update wallet readiness logic so `Pay Now` does not require a pre-existing `txHash`.

Recommended shift:

- before: wallet ready = `walletAddress && txHash`
- after: wallet ready = `walletAddress && quoteReady && !quoteExpired`

**Main CTA loading**

The main checkout loading state should cover:

- order creation
- MetaMask transaction initiation
- Ethereum payment recording

The user should feel that `Pay Now` is the single submit action.

**Error recovery**

Wallet rejection, wrong network, or quote expiry should surface through the existing inline payment error path or the wallet detail panel without forcing a page refresh.

### Related schema update

**5. `FE/artium-web/src/@domains/checkout/validations/buyerCheckout.schema.ts`**

Remove `txHash` as a required pre-submit field for wallet payments.

Recommended direction:

```ts
z.object({
  paymentMethod: z.literal('wallet'),
  walletAddress: z
    .string()
    .min(1, 'Please connect your wallet')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
})
```

If `txHash` remains in state for display/debugging, treat it as runtime orchestration state rather than a field that gates submit.

---

## Plan 11.3 — Preserve success-state UX and keep recovery flows clean

**Goal:** Wallet success lands on the existing checkout success state, and wallet cancellation/retry flows remain clean.

### Files to Modify

**6. `FE/artium-web/src/@domains/checkout/utils/checkoutSuccessState.ts`**

No major contract changes are expected, but verify that wallet submits triggered by `Pay Now` still persist:

- `artworkId`
- `orderNumber`
- `paymentMethod: 'wallet'`
- `isProcessing: true`
- `totalPaid`

Only modify this file if the success persistence shape needs to be generalized for the new wallet orchestration path.

**7. `FE/artium-web/src/@domains/checkout/utils/paymentErrors.ts`**

Expand or refine classification only if needed so the page can distinguish:

- wallet rejected
- wallet network mismatch
- quote expired
- transaction pending / request already pending
- payment recording failure

The output should remain page-friendly and retry-friendly.

### Recovery rules

After refactor, these must stay true:

1. If the buyer disconnects the wallet, wallet readiness immediately drops
2. If the quote refreshes, old transaction state is invalidated
3. If MetaMask rejects the transaction, no stale tx hash remains in submit state
4. If the created order is cancelled after wallet failure, the next `Pay Now` attempt starts cleanly
5. After a successful wallet payment record, checkout transitions to the same success UI used elsewhere

---

## Verification Steps

### Static checks

1. `cd FE/artium-web && npx tsc --noemit`
2. `cd FE/artium-web && npm run build`

### Manual scenarios

1. Open checkout, select wallet, confirm the wallet panel shows quote/network/wallet details with **no standalone send button**
2. Connect MetaMask on Sepolia, click the main `Pay Now` button, and confirm:
   - order is created
   - MetaMask opens from the main checkout flow
   - after approval and payment recording, checkout transitions to the success screen
3. Attempt wallet checkout on the wrong chain and confirm the flow blocks or switches to Sepolia before transaction submission
4. Reject the MetaMask transaction from the `Pay Now` flow and confirm:
   - inline error remains visible
   - stale transaction state is cleared
   - retry works without a full page reload
5. Force quote expiry before clicking `Pay Now` and confirm the flow blocks until a fresh quote is fetched
6. Complete a successful wallet checkout, refresh the checkout route, and confirm the persisted success state still renders correctly

---

## Implementation Notes

- Prefer extracting orchestration to a domain hook over imperative refs from parent to child
- Keep `WalletPaymentSection` declarative and presentation-first
- Do not duplicate order-creation logic across card and wallet paths more than necessary; extract helpers if orchestration branches start to drift
- Keep backend contracts unchanged unless a real frontend gap is found during execution
- Reuse the existing checkout success-state path rather than introducing a second wallet-specific completion route

---

## Expected Deliverable

After Phase 11, wallet checkout should feel like this:

1. user reviews quote/network/wallet status,
2. user clicks the main checkout `Pay Now`,
3. checkout orchestrates order creation + MetaMask transaction + recording,
4. checkout lands on the success status screen.
