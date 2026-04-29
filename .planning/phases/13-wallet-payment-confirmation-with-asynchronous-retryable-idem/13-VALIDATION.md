# Phase 13 Validation

## Implemented Checks

### Backend

- `cd BE && yarn build:gateway`
  - Result: passed

- `cd BE && ./node_modules/.bin/nest build payments-service`
  - Result: passed

- `cd BE && ./node_modules/.bin/nest build orders-service`
  - Result: passed

### Frontend

- `cd FE/artium-web && ./node_modules/.bin/eslint src/@domains/checkout/views/BuyerCheckoutPageView.tsx src/@domains/checkout/components/CheckoutSuccessScreen.tsx src/@domains/checkout/utils/checkoutSuccessState.ts src/@shared/apis/paymentApis.ts`
  - Result: passed with one existing framework warning
  - Warning:
    - `CheckoutSuccessScreen.tsx` still uses a plain `<img>` element and triggers `@next/next/no-img-element`

- `cd FE/artium-web && npx tsc --noemit`
  - Result: failed due to pre-existing auth/login TypeScript issues outside Phase 13
  - Blocking files:
    - `src/@domains/auth/hooks/useWalletLogin.ts`
    - `src/@domains/auth/types/wallet.ts`
    - `src/@domains/auth/views/LoginPage.tsx`
  - Assessment: no remaining Phase 13-specific TypeScript error was present after the wallet confirmation changes were patched

- `cd FE/artium-web && npm run build`
  - Result: failed for the same pre-existing frontend auth/login TypeScript issues
  - Assessment: Phase 13 did not introduce the current build blocker; the checkout confirmation work sits behind a separate existing frontend compile failure

## Requirement Coverage

1. Wallet checkout remains pending immediately after MetaMask submission
   - Covered by `recordEthereumPayment` leaving the transaction in `PROCESSING` and the checkout success UI showing a submitted/pending state

2. Wallet confirmation is backend-authoritative
   - Covered by the new `EthereumTransactionConfirmationService` plus `ConfirmEthereumPaymentHandler`

3. Confirmation processing is asynchronous, retryable, and idempotent
   - Covered by explicit confirmation request events, leased worker claims, retry scheduling, and guarded terminal transitions

4. Lost worker messages do not permanently strand pending transactions
   - Covered by the `RetryStuckEthereumConfirmationsWorker` recovery sweep

5. Orders only move into paid/confirmed state after backend confirmation
   - Covered by orders-service consuming `payment.succeeded` and updating the order only after terminal success

6. Frontend wallet success UX reads backend transaction state instead of validating receipts in-browser
   - Covered by polling `GET /payments/transactions/:id` from the persisted checkout success state

## Residual Risks

- The current order sync path only reacts to `payment.succeeded`. If product requirements later demand automatic unpaid/cancelled handling for terminal wallet failures, that should be added as a follow-up phase instead of overloading this confirmation phase.
- Frontend release readiness still depends on fixing the unrelated auth/login TypeScript issues that currently block `tsc` and `next build`.
- The checkout success artwork tile still uses a plain `<img>` and should be upgraded to `next/image` if the team wants a fully warning-free lint result for that screen.
