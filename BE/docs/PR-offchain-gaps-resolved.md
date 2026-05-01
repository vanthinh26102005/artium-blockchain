# PR: Off-Chain Gap Closure & Blockchain Event Enhancements

## Summary

Closes all off-chain gaps identified by auditing the codebase against `docs/presentation-blockchain-auction-flow.md`. Wires blockchain auction notifications (11 events) through the outbox pattern with dead-letter exchange reliability, aligns the platform fee to the smart contract's 2.5%, implements the `FundsWithdrawn` handler, and refactors the blockchain event listener for type safety and cleaner cursor management.

**15 files changed · 615 insertions · 89 deletions**

---

## Changes by Commit

### 1. `feat(notifications): wire blockchain auction event notifications`
- Created `BlockchainAuctionEventHandler` in notifications-service with 10 `@RabbitSubscribe` handlers (AuctionStarted, NewBid, AuctionEnded, ArtShipped, DeliveryConfirmed, DisputeOpened, DisputeResolved, AuctionCancelled, ShippingTimeout, DeliveryTimeout)
- Added 10 `NotificationTriggerEvent` enum values to both `@app/common` and notifications-service domain
- Registered `NOTIFICATION_BLOCKCHAIN_AUCTION` queue in `@app/rabbitmq`

### 2. `fix(notifications): rethrow errors in blockchain event handlers`
- All 10 catch blocks were silently swallowing errors — added `throw error` after each `this.logger.error()` to ensure message nack and retry

### 3. `refactor(notifications): apply outbox pattern to blockchain event handler`
- Rewrote all 10 handlers to use `transactionService.execute()` wrapping both `NotificationHistory` creation and `outboxService.createOutboxMessage()` for atomicity
- Added `BLOCKCHAIN_EVENTS_DLX` dead-letter exchange and `BLOCKCHAIN_AUCTION_NOTIFICATION_FAILED` routing key
- Added `errorHandler` with `channel.nack(msg, false, false)` on all subscribers
- Extracted shared `DLX_QUEUE_OPTIONS` constant and `createNotificationWithOutbox()` helper

### 4. `fix(payments): align platform fee with smart contract (5% → 2.5%)`
- Created shared `PLATFORM_FEE_RATE = 0.025` constant in `@app/common/constants/fees.ts`
- Replaced hardcoded `0.05` in both `CreateStripePaymentIntent` and `CreateInvoicePaymentIntent` handlers

### 5. `refactor(blockchain): clean up event listener service`
- Marked lookup tables as `Readonly<>`, used `interface` instead of `type` aliases
- Extracted `SUPPORTED_EVENT_NAMES` constant and `PG_UNIQUE_VIOLATION` named constant
- Simplified `updateCursorBlock` from read-then-write (2 queries) to atomic conditional `UPDATE` (1 query)
- Removed redundant cursor update inside `processEvent` transaction
- Fixed pre-existing TS error with `'args' in log` type guard for ethers `Log | EventLog`
- Added JSDoc, section comments, and explicit `Promise<void>` return types

### 6. `feat(withdrawn): implement FundsWithdrawn handler with notification`
- Fixed param mismatch in orders-service handler (`user` → `bidder` to match EVENT_EXTRACTORS payload)
- Added enriched payload fields (`txHash`, `blockNumber`) and try/catch/rethrow error handling
- Added `AUCTION_FUNDS_WITHDRAWN` trigger event to both notification enums
- Created `handleFundsWithdrawn` notification subscriber with full outbox pattern in notifications-service

---

## Files Changed

| File | Service | What Changed |
|------|---------|--------------|
| `BlockchainAuctionEvent.event.handler.ts` | notifications | New: 11 event subscribers with outbox pattern |
| `notification.enums.ts` | notifications | Added 11 blockchain trigger events |
| `notification.enum.ts` | @app/common | Added 11 blockchain trigger events |
| `blockchain-event.handler.ts` | orders | Fixed FundsWithdrawn handler (param, error handling) |
| `blockchain-event-listener.service.ts` | @app/blockchain | Refactored for type safety, atomic cursor, clean code |
| `dl-exchange.ts` | @app/rabbitmq | Added BLOCKCHAIN_EVENTS_DLX |
| `dl-routing-keys.ts` | @app/rabbitmq | Added BLOCKCHAIN_AUCTION_NOTIFICATION_FAILED |
| `queues.ts` | @app/rabbitmq | Added NOTIFICATION_BLOCKCHAIN_AUCTION queue |
| `fees.ts` | @app/common | New: PLATFORM_FEE_RATE = 0.025 |
| `index.ts` | @app/common | Barrel export for constants |
| `CreateStripePaymentIntent.handler.ts` | payments | 0.05 → PLATFORM_FEE_RATE |
| `CreateInvoicePaymentIntent.handler.ts` | payments | 0.05 → PLATFORM_FEE_RATE |
| `index.ts` | notifications | Registered BlockchainAuctionEventHandler export |
| `app.module.ts` | notifications | Registered handler in providers |
