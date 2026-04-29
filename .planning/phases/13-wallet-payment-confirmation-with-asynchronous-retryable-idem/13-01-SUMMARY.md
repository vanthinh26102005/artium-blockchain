# Phase 13 Execution Summary

## Outcome

Phase 13 is implemented.

Wallet checkout no longer treats a MetaMask `txHash` as final success. The platform now records Sepolia wallet payments as `PROCESSING`, confirms them asynchronously in `payments-service`, retries safely on transient RPC/pending states, and only promotes the order to paid/confirmed after backend receipt validation succeeds.

## Backend Changes

### Durable confirmation state and idempotent worker flow

- `BE/apps/payments-service/src/domain/entities/payment-transaction.entity.ts`
- `BE/apps/payments-service/src/domain/interfaces/payment-transaction.repository.interface.ts`
- `BE/apps/payments-service/src/infrastructure/repositories/payment-transaction.repository.ts`
  - added durable confirmation tracking fields:
    - `confirmationAttempts`
    - `nextConfirmationAt`
    - `confirmationStartedAt`
    - `lastConfirmationError`
    - `confirmedBlockNumber`
  - added worker-safe repository methods for:
    - selecting ready Ethereum confirmations
    - claiming confirmation attempts with a lease
    - scheduling retry attempts
    - idempotent success/failure settlement

- `BE/apps/payments-service/src/application/commands/payments/handlers/RecordEthereumPayment.command.handler.ts`
  - wallet payment recording now initializes confirmation state
  - emits a dedicated background confirmation request event after the transaction is stored

- `BE/apps/payments-service/src/domain/events/ethereum-payment-confirmation-requested.event.ts`
- `BE/libs/rabbitmq/src/routing-keys/routing-keys.ts`
  - added explicit `payment.ethereum.confirmation.requested` routing

- `BE/apps/payments-service/src/infrastructure/services/ethereum-transaction-confirmation.service.ts`
  - added focused Sepolia receipt verification for direct ETH transfers
  - validates:
    - expected chain
    - destination platform wallet
    - sender wallet
    - quoted `weiHex`
    - receipt success
    - minimum confirmations

- `BE/apps/payments-service/src/application/commands/payments/ConfirmEthereumPayment.command.ts`
- `BE/apps/payments-service/src/application/commands/payments/handlers/ConfirmEthereumPayment.command.handler.ts`
- `BE/apps/payments-service/src/application/event-handlers/EthereumPaymentConfirmationProcessor.event.handler.ts`
- `BE/apps/payments-service/src/application/event-handlers/RetryStuckEthereumConfirmations.worker.ts`
- `BE/apps/payments-service/src/app.module.ts`
  - added the async confirmation command path
  - added RabbitMQ consumer for immediate confirmation triggers
  - added a recovery sweep worker so pending transactions are not queue-only

### Terminal payment event normalization

- `BE/apps/payments-service/src/domain/events/payment-succeeded.event.ts`
- `BE/apps/payments-service/src/domain/events/payment-failed.event.ts`
- `BE/apps/payments-service/src/application/commands/stripe/handlers/HandleStripeWebhook.command.handler.ts`
- `BE/apps/payments-service/src/presentation/http/controllers/stripe-webhook.controller.ts`
  - normalized terminal payment events onto structured payload constructors
  - Ethereum confirmation now emits the same `payment.succeeded` / `payment.failed` contract shape as Stripe flows

### Order sync and private transaction access

- `BE/apps/orders-service/src/application/event-handlers/payment-event.handler.ts`
- `BE/apps/orders-service/src/application/event-handlers/index.ts`
- `BE/apps/orders-service/src/app.module.ts`
  - orders-service now consumes terminal payment success events
  - linked orders are updated with:
    - `paymentTransactionId`
    - wallet vs Stripe payment method
    - `paymentStatus = PAID`
    - `txHash`
    - `confirmedAt`
    - `status = CONFIRMED` when appropriate

- `BE/apps/api-gateway/src/presentation/http/controllers/payment/payments.controller.ts`
  - `GET /payments/transactions/:id` is now user-scoped in the gateway
  - unauthorized transaction lookups return a safe `404`

## Frontend Changes

### Backend-polled wallet confirmation UX

- `FE/artium-web/src/@shared/apis/paymentApis.ts`
  - expanded transaction response typing with `userId`, `orderId`, `txHash`, failure fields, and timestamps

- `FE/artium-web/src/@domains/checkout/utils/checkoutSuccessState.ts`
  - replaced the boolean `isProcessing` flag with a durable status model:
    - `processing`
    - `succeeded`
    - `failed`
  - stores `transactionId` for wallet checkout
  - includes legacy-session migration so older persisted success state still hydrates safely

- `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`
  - wallet checkout now stores the recorded payment transaction ID returned by the backend
  - success-route hydration now polls `GET /payments/transactions/:id` while wallet status is pending
  - wallet success state flips only from backend-confirmed transaction status, not browser inference

- `FE/artium-web/src/@domains/checkout/components/CheckoutSuccessScreen.tsx`
  - success UI now supports professional wallet lifecycle states:
    - submitted / pending confirmation
    - confirmed success
    - failed confirmation
  - copy and next-step guidance now reflect backend truth instead of assuming immediate success

## UX Notes

- Wallet checkout still redirects users immediately to the checkout success route, but pending wallet payments are now explicitly presented as backend-confirmed work in progress.
- Refreshing the success page no longer loses wallet confirmation context because the session state keeps the transaction ID and rehydrates polling.
- Orders become the durable downstream record of confirmed wallet payment, instead of the checkout page being the only place that knows anything about the transaction.
