---
phase: "6"
plan: "2"
subsystem: payments-service
tags: [ethereum, blockchain, payments, cqrs, outbox, api-gateway]
dependency-graph:
  requires: []
  provides: [record-ethereum-payment-command, ethereum-payment-recorded-event, payments-ethereum-endpoint]
  affects: [payments-service, api-gateway, rabbitmq-lib]
tech-stack:
  added: []
  patterns: [CQRS CommandHandler, OutboxService event publication, duplicate-detection via findByTxHash, JWT-protected gateway endpoint]
key-files:
  created:
    - BE/apps/payments-service/src/domain/events/ethereum-payment-recorded.event.ts
    - BE/apps/payments-service/src/domain/dtos/payment/RecordEthereumPayment.dto.ts
    - BE/apps/payments-service/src/application/commands/payments/RecordEthereumPayment.command.ts
    - BE/apps/payments-service/src/application/commands/payments/handlers/RecordEthereumPayment.command.handler.ts
    - BE/apps/api-gateway/src/presentation/http/controllers/payment/dtos/record-ethereum-payment.dto.ts
  modified:
    - BE/libs/rabbitmq/src/routing-keys/routing-keys.ts
    - BE/apps/payments-service/src/domain/events/index.ts
    - BE/apps/payments-service/src/domain/dtos/payment/index.ts
    - BE/apps/payments-service/src/domain/entities/payment-transaction.entity.ts
    - BE/apps/payments-service/src/domain/interfaces/payment-transaction.repository.interface.ts
    - BE/apps/payments-service/src/infrastructure/repositories/payment-transaction.repository.ts
    - BE/apps/payments-service/src/application/commands/payments/index.ts
    - BE/apps/payments-service/src/application/commands/payments/handlers/index.ts
    - BE/apps/payments-service/src/application/commands/index.ts
    - BE/apps/payments-service/src/application/index.ts
    - BE/apps/payments-service/src/app.module.ts
    - BE/apps/payments-service/src/presentation/microservice/payments.microservice.controller.ts
    - BE/apps/api-gateway/src/presentation/http/controllers/payment/payments.controller.ts
decisions:
  - "Used PaymentProvider.ETHEREUM and PaymentMethodType.CRYPTO_WALLET — both already existed in @app/common enums"
  - "unique: true added to txHash column in entity; migration intentionally deferred to team"
  - "findByTxHash implemented directly on ormRepository.findOne to avoid custom WhereOperator mapping overhead"
metrics:
  duration: "3m 51s"
  completed: "2026-04-23T05:08:27Z"
  tasks-completed: 9
  files-created: 5
  files-modified: 13
---

# Phase 6 Plan 2: RecordEthereumPayment Command + Gateway Endpoint Summary

**One-liner:** RecordEthereumPayment CQRS command with duplicate txHash detection, Outbox publication of `EthereumPaymentRecordedEvent`, and JWT-protected `POST /payments/ethereum` gateway endpoint.

## What Was Built

Implemented the full vertical slice for recording an Ethereum on-chain payment transaction in the payments microservice:

1. **`PAYMENT_ETHEREUM_RECORDED` routing key** — added to `@app/rabbitmq` RoutingKey constants
2. **`EthereumPaymentRecordedEvent`** — domain event with `toPayload()` and static `getEventType()` for Outbox serialization
3. **`RecordEthereumPaymentDTO`** — service-layer DTO with Ethereum-specific validation (txHash regex, walletAddress regex, positive amount)
4. **`unique: true` on `txHash` column** — entity-level DB constraint for idempotency (migration deferred)
5. **`RecordEthereumPaymentCommand`** — simple CQRS command wrapping the DTO
6. **`RecordEthereumPaymentHandler`** — command handler with:
   - Duplicate detection via `findByTxHash` before insert
   - `RpcExceptionHelper.conflict()` on duplicate
   - `RpcExceptionHelper.internalError()` on DB failure
   - Outbox publication via `OutboxService.createOutboxMessage()`
7. **`findByTxHash`** — added to `IPaymentTransactionRepository` interface and `PaymentTransactionRepository` implementation
8. **Barrel exports** — all indexes updated (handlers, payments commands, commands, application)
9. **`app.module.ts`** — `RecordEthereumPaymentHandler` added to `CommandHandlers` array
10. **Microservice controller** — `{ cmd: 'record_ethereum_payment' }` pattern added
11. **Gateway DTO** — `RecordEthereumPaymentDto` with Swagger annotations, created at `dtos/record-ethereum-payment.dto.ts`
12. **Gateway endpoint** — `POST /payments/ethereum` in `PaymentsController`, JWT-guarded, injects `userId` from `req.user?.id`

## Verification

Both TypeScript compilations passed with zero errors:
- `apps/payments-service/tsconfig.app.json` — clean
- `apps/api-gateway/tsconfig.app.json` — clean

## Deviations from Plan

None — plan executed exactly as written. `PaymentProvider.ETHEREUM` and `PaymentMethodType.CRYPTO_WALLET` already existed in the shared enum, so no enum additions were needed.

## Known Stubs

None — all code is fully wired. The `txHash` DB constraint requires a migration (intentionally deferred per plan instructions).

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: new-endpoint | BE/apps/api-gateway/src/presentation/http/controllers/payment/payments.controller.ts | `POST /payments/ethereum` — new authenticated endpoint recording financial transactions; protected by JwtAuthGuard, duplicate detection via txHash |

## Self-Check: PASSED
