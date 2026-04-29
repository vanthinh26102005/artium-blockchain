# Phase 13: Wallet Payment Confirmation with Asynchronous Retryable Idempotent Background Processor

## Goal

Move wallet checkout from browser-assumed success to backend-confirmed success.

After MetaMask returns a `txHash`, the platform should treat the payment as **pending** and let a payments-service owned background processor confirm the Sepolia transfer asynchronously. That processor must be:

- asynchronous
- retryable
- idempotent
- backend-authoritative

The frontend may show progress and poll backend status, but it must not be the source of truth for receipt validation or final payment success.

This phase plans directly from the live codebase. No separate research artifact is required because the architectural gap is already explicit in the wallet checkout flow, payment transaction model, and existing service boundaries.

---

## Root Cause (confirmed by code audit)

### 1) Wallet checkout stops at submission, not confirmation

In `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`, the wallet path:

1. creates the order
2. submits `eth_sendTransaction`
3. records the payment through `POST /payments/ethereum`
4. persists checkout success state with `isProcessing: true`

There is no follow-up mechanism that later flips wallet checkout from pending to confirmed.

### 2) `payments-service` records wallet transactions as `PROCESSING`, but never settles them

`BE/apps/payments-service/src/application/commands/payments/handlers/RecordEthereumPayment.command.handler.ts` creates Ethereum payment transactions with:

- `provider = ETHEREUM`
- `status = PROCESSING`
- `txHash`, `walletAddress`, and quote metadata stored

That is correct as an initial write, but there is no processor in `payments-service` that:

- loads the recorded transaction
- verifies the receipt on Sepolia
- marks the transaction `SUCCEEDED` or `FAILED`
- emits final payment events

### 3) The existing blockchain event listener is the wrong integration point

The shared blockchain listener in `@app/blockchain` is built around escrow contract events such as:

- `AuctionStarted`
- `DeliveryConfirmed`
- `DisputeOpened`
- `Withdrawn`

The current wallet checkout path is not using escrow contract events as its confirmation source. It is a direct ETH transfer to the configured platform wallet. So importing the full escrow event listener into `payments-service` would be the wrong coupling.

### 4) There is no backend-driven propagation of confirmed wallet payment state into orders

Orders already store:

- `paymentTransactionId`
- `paymentMethod`
- `paymentStatus`
- `txHash`

and the new private orders workspace already renders those fields.

But there is no payment-event consumer in `orders-service` that advances order payment state when a wallet transaction becomes truly confirmed.

### 5) The frontend can read transaction state, but currently has nothing meaningful to read

The gateway already exposes:

- `GET /payments/transactions`
- `GET /payments/transactions/:id`

So the right frontend evolution is not browser receipt validation. The right evolution is:

- backend confirms the transaction
- frontend polls backend transaction/order state for UX refinement

This keeps the backend authoritative while still giving the user a professional pending-to-confirmed experience.

---

## Architecture Direction

Phase 13 should adopt this confirmation model:

1. `recordEthereumPayment` remains a fast, synchronous write that stores the transaction as `PROCESSING`.
2. Recording the transaction triggers asynchronous confirmation work in `payments-service`.
3. A payments-owned background processor verifies the Sepolia receipt using a dedicated JSON-RPC provider, not the full escrow event listener.
4. The processor is retryable for transient RPC failures and idempotent for duplicate delivery or repeated scans.
5. On confirmed success, `payments-service` emits the same terminal payment event shape the rest of the platform already understands (`payment.succeeded`).
6. `orders-service` consumes terminal payment events and updates the linked order to backend-confirmed payment state.
7. The frontend treats wallet checkout as pending until backend status changes, then refreshes from backend truth.

Recommended reliability pattern:

- immediate event-driven confirmation trigger after `recordEthereumPayment`
- plus a recovery sweep for stuck `PROCESSING` wallet transactions

That combination is the best-practice fit here:

- queue/event gives fast normal-path confirmation
- recovery sweep closes gaps if a message is lost or a worker restarts mid-flight
- idempotent status transitions prevent duplicate settlement

---

## Plan 13.1 — Introduce a durable wallet-confirmation state model in payments-service

**Goal:** Make pending Ethereum transactions queryable and recoverable by a backend worker without relying on browser memory.

### Files to Modify

**1. `BE/apps/payments-service/src/domain/entities/payment-transaction.entity.ts`**

Extend the entity with explicit wallet-confirmation tracking fields instead of burying all worker state in `metadata`.

Recommended additions:

- `confirmationAttempts?: number`
- `nextConfirmationAt?: Date | null`
- `lastConfirmationError?: string | null`
- `confirmedBlockNumber?: string | null`
- `confirmationStartedAt?: Date | null`

Keep `status` as the canonical terminal state machine:

- `PROCESSING` while awaiting confirmation
- `SUCCEEDED` after verified receipt success
- `FAILED` only for terminally invalid wallet transactions or unrecoverable settlement failure

Do not invent a second terminal wallet-status model parallel to `TransactionStatus`.

**2. `BE/apps/payments-service/src/domain/interfaces/payment-transaction.repository.interface.ts`**

Add repository methods that support worker-safe querying and claiming, for example:

- `findEthereumTransactionsReadyForConfirmation(limit: number)`
- `markConfirmationAttemptStarted(transactionId: string, startedAt: Date)`
- `scheduleNextConfirmationAttempt(transactionId: string, nextConfirmationAt: Date, error: string)`
- `markEthereumTransactionSucceeded(...)`
- `markEthereumTransactionFailed(...)`

The interface should make idempotent status transitions explicit.

**3. `BE/apps/payments-service/src/infrastructure/repositories/payment-transaction.repository.ts`**

Implement the repository methods with deterministic filtering:

- provider = `ETHEREUM`
- status = `PROCESSING`
- `nextConfirmationAt <= now`

Best-practice notes:

- use update guards so already-terminal rows are not “re-completed”
- keep “claim” logic narrow so concurrent workers cannot both settle the same transaction
- make repeated confirmation attempts safe to re-run

**4. `BE/apps/payments-service/src/application/commands/payments/handlers/RecordEthereumPayment.command.handler.ts`**

On initial wallet payment record:

- set `confirmationAttempts = 0`
- set `nextConfirmationAt = now`
- leave `status = PROCESSING`

Do not mark wallet checkout successful here. This command should remain a fast enqueue/schedule boundary.

### Outcome

After this plan, the backend has a durable confirmation work queue encoded in the transaction model itself, not in the browser session or ad hoc in-memory timers.

---

## Plan 13.2 — Add payment-service owned confirmation contracts and final payment events

**Goal:** Create a clean service-local confirmation boundary and reuse existing terminal payment event semantics.

### Files to Create

**5. `BE/apps/payments-service/src/infrastructure/services/ethereum-transaction-confirmation.service.ts`**

Add a focused service that owns Sepolia receipt verification for direct ETH transfers.

Responsibilities:

- load transaction + receipt from a configured Sepolia RPC
- verify the transaction is on the expected chain
- verify `to === configured platform wallet`
- verify `from === recorded walletAddress`
- verify transferred value matches recorded `weiHex` quote metadata
- verify receipt success status
- optionally enforce a minimal confirmation threshold suitable for Sepolia

Important constraint:

- do **not** import the full escrow listener as the confirmation source
- use a dedicated provider/service for receipt lookup

**6. `BE/apps/payments-service/src/application/commands/payments/ConfirmEthereumPayment.command.ts`**

Add an explicit command for confirming one recorded Ethereum payment transaction by `transactionId`.

**7. `BE/apps/payments-service/src/application/commands/payments/handlers/ConfirmEthereumPayment.command.handler.ts`**

This handler should:

- load the transaction
- no-op if already terminal (`SUCCEEDED`/`FAILED`)
- call the receipt verification service
- classify the result as:
  - `confirmed`
  - `retryable pending`
  - `retryable transient failure`
  - `terminal invalid`
- update the row idempotently
- publish terminal payment events only once

Use the existing payment-events model where possible:

- emit `payment.succeeded` when the Ethereum receipt is confirmed
- emit `payment.failed` only for truly terminal invalid transactions or final exhaustion policy

That keeps downstream consumers consistent across Stripe and wallet flows.

### Files to Modify

**8. `BE/libs/rabbitmq/src/routing-keys/routing-keys.ts`**

Add a dedicated routing key for background confirmation requests, for example:

- `payment.ethereum.confirmation.requested`

Keep `payment.ethereum.recorded` as the immutable fact that the transaction was first recorded. The worker trigger can be a separate routing key or an internal reuse of the recorded event, but the plan should favor explicitness for long-term maintainability.

**9. `BE/apps/payments-service/src/app.module.ts`**

Register:

- confirmation service
- confirmation command handler
- worker/subscriber dependencies
- `AppRabbitMQModule`

Do not import the escrow-oriented blockchain event listener module just to gain a provider.

**10. `BE/apps/payments-service/src/application/index.ts` and relevant command barrels**

Export the new command/handler so the existing module structure stays coherent.

### Outcome

After this plan, `payments-service` can authoritatively settle wallet payments and emit final platform payment events without any frontend receipt logic.

---

## Plan 13.3 — Implement the asynchronous, retryable, idempotent background processor

**Goal:** Add the core processor that performs confirmation work out-of-band, retries safely, and recovers from worker or RPC failure.

This is the critical Step 3 of the phase.

### Files to Create

**11. `BE/apps/payments-service/src/application/event-handlers/EthereumPaymentConfirmationProcessor.event.handler.ts`**

Create a RabbitMQ subscriber that reacts to the confirmation-requested event and dispatches `ConfirmEthereumPaymentCommand`.

Required behavior:

- asynchronous: never block the checkout request path
- retryable: transient RPC/network errors should reschedule work, not silently fail
- idempotent: duplicate queue delivery must not produce duplicate settlement

**12. `BE/apps/payments-service/src/application/workers/RetryStuckEthereumConfirmations.worker.ts`**

Add a recovery worker/sweeper that periodically scans for wallet transactions that are still:

- `provider = ETHEREUM`
- `status = PROCESSING`
- `nextConfirmationAt <= now`

and re-enqueues confirmation work.

Why this exists:

- queue delivery alone is not enough for robust recovery
- this sweep closes gaps after process restarts, message loss, or mid-confirmation crashes

### Processor Rules

The processor must classify outcomes clearly:

**Confirmed success**
- receipt exists
- receipt status is success
- chain ID matches Sepolia
- `to` address matches configured platform wallet
- `from` matches recorded wallet address
- value matches recorded quote metadata / `weiHex`

Result:
- mark transaction `SUCCEEDED`
- set `processedAt`, `completedAt`, `confirmedBlockNumber`
- emit `payment.succeeded` exactly once

**Retryable pending**
- tx not mined yet
- confirmations below threshold

Result:
- keep `PROCESSING`
- increment attempts
- schedule `nextConfirmationAt` with backoff

**Retryable transient failure**
- RPC timeout
- upstream provider unavailable
- temporary network fault

Result:
- keep `PROCESSING`
- store error summary
- schedule retry with bounded backoff

**Terminal invalid**
- receipt shows failure
- wrong destination wallet
- wrong sender wallet
- wrong amount
- wrong chain

Result:
- mark transaction `FAILED`
- emit `payment.failed` exactly once

### Best-practice constraints

- Backoff must be bounded and deterministic.
  Recommendation: short retry intervals early, then widen to a max cap.
- Idempotency must be enforced at the state-transition layer, not just “by convention”.
- Re-processing the same transaction after it is terminal must no-op safely.
- The worker must log with transaction ID, tx hash, and attempt count for traceability.

### Outcome

After this plan, wallet payment confirmation is no longer dependent on the user keeping a checkout tab open. The backend owns settlement progression robustly.

---

## Plan 13.4 — Sync orders and frontend UX to backend-confirmed wallet truth

**Goal:** Make order/payment surfaces reflect backend confirmation cleanly while preserving pending UX after MetaMask submission.

### Files to Modify

**13. `BE/apps/orders-service/src/application/event-handlers/...`**

Add payment-event consumers for terminal payment outcomes, especially `payment.succeeded`, so orders linked to wallet transactions can be updated authoritatively.

Recommended order updates on wallet confirmation:

- `paymentTransactionId`
- `paymentMethod = BLOCKCHAIN`
- `paymentStatus = PAID` (or the project’s correct confirmed state)
- `txHash`
- optional transition from generic order pending state into the correct post-payment state

Add a corresponding failure path only if the existing order lifecycle requires it. Avoid inventing a new order state if simple payment-status sync is sufficient.

**14. `FE/artium-web/src/@domains/checkout/utils/checkoutSuccessState.ts`**

Extend persisted checkout success state to include:

- `orderId`
- `transactionId`
- optional backend payment status snapshot

The browser should persist identifiers needed to refetch backend truth, not its own final success guess.

**15. `FE/artium-web/src/@domains/checkout/views/BuyerCheckoutPageView.tsx`**

Adjust the wallet success path so it:

- still shows pending immediately after MetaMask submission
- persists `transactionId` from `recordEthereumPayment`
- performs bounded polling of `GET /payments/transactions/:id`
- flips the checkout success screen from pending to confirmed only when backend status becomes terminal

Important rule:

- the frontend is allowed to poll backend state for UX, but it must not confirm Sepolia receipts itself

**16. `FE/artium-web/src/@domains/checkout/components/CheckoutSuccessScreen.tsx`**

Refine the success screen copy/state model so wallet checkout can represent:

- transaction submitted
- payment confirmed
- payment failed

without pretending the browser itself performed confirmation.

**17. `FE/artium-web/src/@domains/orders/views/OrderDetailPageView.tsx` and related orders domain components**

Ensure the new private orders workspace reflects backend-confirmed wallet payment state consistently once the confirmation processor settles the transaction.

### Outcome

After this plan, checkout, orders, and transactions all converge on the same backend-confirmed wallet truth model.

---

## Verification Requirements

The phase is only complete when a developer can verify all of the following:

1. wallet checkout still returns promptly after MetaMask submission and never waits synchronously for on-chain confirmation inside the request/response path
2. a recorded Ethereum transaction enters `PROCESSING` and is picked up asynchronously by the confirmation processor
3. repeated confirmation delivery or repeated recovery sweeps do not duplicate settlement or emit duplicate terminal events
4. transient Sepolia RPC failures result in scheduled retries instead of stuck silent `PROCESSING`
5. a mined valid transaction transitions to `SUCCEEDED` only after receipt verification passes all invariant checks
6. an invalid/wrong transaction can be marked terminally `FAILED`
7. the wallet checkout success screen can move from pending to confirmed using backend transaction status
8. the orders workspace reflects confirmed wallet payment state after settlement

### Suggested validation commands

Backend:

- `cd BE && yarn build:gateway`
- `cd BE && ./node_modules/.bin/nest build payments-service`
- `cd BE && ./node_modules/.bin/nest build orders-service`

Frontend:

- `cd FE/artium-web && npx tsc --noemit`
- `cd FE/artium-web && ./node_modules/.bin/eslint src/@domains/checkout src/@domains/orders src/@shared/apis/paymentApis.ts`
- `cd FE/artium-web && npm run build`

### Required test coverage

Add targeted tests for:

- idempotent confirmation of an already-succeeded transaction
- retry scheduling on provider timeout
- terminal failure on wrong destination / wrong amount / reverted receipt
- event emission only once on transition to `SUCCEEDED`
- frontend pending-to-confirmed wallet success state transition against mocked backend transaction responses

---

## UAT Scenarios

1. Buyer completes wallet checkout, lands on a pending success screen, refreshes the page, and still sees backend-backed pending state instead of losing context.
2. Background processor confirms the Sepolia transaction, and the buyer later sees confirmed wallet payment state in checkout follow-up and order detail.
3. The same confirmation job is delivered twice, and the transaction/order are still advanced only once.
4. A transient RPC outage occurs after `recordEthereumPayment`, and the transaction is retried later rather than being stranded permanently in `PROCESSING`.
5. A wallet transaction with mismatched destination wallet or amount is rejected as invalid and never promoted to confirmed payment.

---

## Notes for Execution

- Do not move Sepolia receipt confirmation into the browser.
- Do not couple this direct-wallet checkout flow to the escrow contract event listener.
- Prefer payments-service owned confirmation logic plus a recovery sweep over “queue only” or “poll only”.
- Reuse the existing terminal payment event vocabulary (`payment.succeeded`, `payment.failed`) where possible so downstream services do not fork by provider unnecessarily.
