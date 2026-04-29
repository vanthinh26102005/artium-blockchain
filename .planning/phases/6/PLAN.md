# Phase 6: Artwork Checkout — Stripe Card + Crypto Wallet Payment

## Goal

Deliver a complete, production-quality artwork checkout payment flow with two options:
1. **Card (Stripe)** — fix the existing broken flow (missing `confirmPaymentIntent` call, alert-based errors) and wire up Stripe webhook handling on the backend.
2. **Crypto Wallet (MetaMask/ETH)** — new payment path: browser wallet connection, ETH transfer, backend recording via a new `RecordEthereumPayment` command with Outbox event publication.

Both paths share the same checkout UI shell (contact step → payment step) and follow existing codebase conventions: CQRS commands/handlers in payments-service, `RpcExceptionHelper` for errors, `OutboxService` for all async events, `RpcExceptionHelper`, and `createUseQuery` / `paymentApis` on the frontend.

## Pre-conditions

- `ConfirmStripePaymentIntentHandler` is already implemented — **its `PaymentSucceededEvent` Outbox publishing will be removed in Plan 6.1 Step 0** to avoid double-publishing.
- `StripeWebhookController` (HTTP) in payments-service has full webhook logic — the CQRS handler in Plan 6.1 extracts this to the CQRS layer.
- `StripeService.constructWebhookEvent()` already exists in `payments-service`.
- `StripeWebhookDto` has `{ body: Buffer | string; signature: string }` — NOT `payload`.
- `PaymentProvider.ETHEREUM`, `txHash`, `walletAddress`, `escrowState` fields already exist on `PaymentTransaction` entity.
- `ExchangeName.PAYMENT_EVENTS` and `ExchangeName.BLOCKCHAIN_EVENTS` exchanges are declared.
- FE: `paymentApis.createPaymentIntent()` and `paymentApis.confirmPaymentIntent()` already exist.
- **Known bug**: `StripeService.createPaymentIntent()` multiplies amount by 100 again (amount already in cents). Fixed in Plan 6.4 Step 0.
- **Known bug**: Gateway `createStripeCustomer` does not inject `userId` from JWT. Fixed in Plan 6.4 Step 0b.
- Gateway `payments.controller.ts` already has `POST /payments/stripe/webhook` → `{ cmd: 'stripe_webhook' }` (no new gateway route needed for webhook).
- `@stripe/stripe-js` NOT yet installed in FE (added in Plan 6.4 Step 0c).

---

## Plan 6.1 — Backend: Stripe Webhook Handler

**Goal:** The payments-service handles `payment_intent.succeeded` and `payment_intent.payment_failed` Stripe webhook events, updating transaction state and publishing events via Outbox. The webhook is the **sole publisher** of terminal Stripe payment events — `ConfirmStripePaymentIntentHandler` must no longer publish `PaymentSucceededEvent`.

> **Existing code notes:**
> - `StripeWebhookController` (payments-service HTTP) already has full webhook logic but is bypassed by the gateway RPC path.
> - The microservice controller has a stub `@MessagePattern({ cmd: 'stripe_webhook' })` that returns `{ received: true }`.
> - The gateway `payments.controller.ts` already exposes `POST /payments/stripe/webhook` → `{ cmd: 'stripe_webhook' }`. No new gateway route is needed.
> - `ConfirmStripePaymentIntentHandler` currently publishes `PaymentSucceededEvent` — this must be removed to prevent double-publishing.

### Steps

**Step 0 — Remove terminal event publishing from `ConfirmStripePaymentIntentHandler`**

In `BE/apps/payments-service/src/application/commands/stripe/handlers/ConfirmStripePaymentIntent.command.handler.ts`, remove the entire `if (paymentIntent.status === 'succeeded')` block that calls `outboxService.createOutboxMessage`. The webhook handler (created below) is now the sole source of `PaymentSucceededEvent`. Keep the status update and `invoiceRepo.markAsPaid` calls as-is.

**Step 1 — Add `HandleStripeWebhookCommand`**

Create `BE/apps/payments-service/src/application/commands/stripe/HandleStripeWebhook.command.ts`:

```typescript
import { StripeWebhookDto } from '@app/common';

export class HandleStripeWebhookCommand {
  constructor(public readonly data: StripeWebhookDto) {}
}
```

**Step 2 — Add `HandleStripeWebhookHandler`**

Create `BE/apps/payments-service/src/application/commands/stripe/handlers/HandleStripeWebhook.command.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { HandleStripeWebhookCommand } from '../HandleStripeWebhook.command';
import { StripeService } from '../../../../infrastructure/services/stripe.service';
import { IPaymentTransactionRepository, IInvoiceRepository } from '../../../../domain/interfaces';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import { RpcExceptionHelper, TransactionStatus } from '@app/common';
import { PaymentSucceededEvent, PaymentFailedEvent } from '../../../../domain/events';

@CommandHandler(HandleStripeWebhookCommand)
export class HandleStripeWebhookHandler implements ICommandHandler<HandleStripeWebhookCommand> {
  private readonly logger = new Logger(HandleStripeWebhookHandler.name);

  constructor(
    private readonly stripeService: StripeService,
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    @Inject(IInvoiceRepository)
    private readonly invoiceRepo: IInvoiceRepository,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(command: HandleStripeWebhookCommand): Promise<{ received: boolean }> {
    const { data } = command;
    let event: any;

    try {
      event = this.stripeService.constructWebhookEvent(
        data.body,          // StripeWebhookDto uses `body`, not `payload`
        data.signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err.message);
      throw RpcExceptionHelper.badRequest('Invalid webhook signature');
    }

    this.logger.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled webhook event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
    const transaction = await this.transactionRepo.findByStripePaymentIntentId(paymentIntent.id);
    if (!transaction) {
      this.logger.warn(`No transaction found for payment intent: ${paymentIntent.id}`);
      return;
    }
    if (transaction.status === TransactionStatus.SUCCEEDED) {
      this.logger.debug(`Transaction ${transaction.id} already succeeded — idempotent skip`);
      return;
    }

    await this.transactionRepo.update(transaction.id, {
      status: TransactionStatus.SUCCEEDED,
      stripeChargeId: paymentIntent.latest_charge ?? null,
      processedAt: new Date(),
      completedAt: new Date(),
    });

    if (transaction.invoiceId) {
      await this.invoiceRepo.markAsPaid(transaction.invoiceId, transaction.id);
    }

    const event = new PaymentSucceededEvent(
      transaction.id,
      transaction.userId,
      paymentIntent.id,
      paymentIntent.latest_charge ?? '',
      Number(transaction.amount),
      transaction.currency,
      transaction.orderId ?? undefined,
      transaction.invoiceId ?? undefined,
    );

    await this.outboxService.createOutboxMessage({
      aggregateType: 'PaymentTransaction',
      aggregateId: transaction.id,
      eventType: PaymentSucceededEvent.getEventType(),
      payload: event.toPayload(),
      exchange: ExchangeName.PAYMENT_EVENTS,
      routingKey: RoutingKey.PAYMENT_SUCCEEDED,
    });

    this.logger.log(`PaymentSucceeded (webhook) published for transaction: ${transaction.id}`);
  }

  private async handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
    const transaction = await this.transactionRepo.findByStripePaymentIntentId(paymentIntent.id);
    if (!transaction) {
      this.logger.warn(`No transaction found for payment intent: ${paymentIntent.id}`);
      return;
    }

    const failureReason = paymentIntent.last_payment_error?.message ?? 'Payment failed';
    const failureCode = paymentIntent.last_payment_error?.code ?? null;

    await this.transactionRepo.update(transaction.id, {
      status: TransactionStatus.FAILED,
      failureReason,
      failureCode,
    });

    const event = new PaymentFailedEvent(
      transaction.id,
      transaction.userId,
      paymentIntent.id,
      Number(transaction.amount),
      transaction.currency,
      failureReason,
      failureCode ?? undefined,
    );

    await this.outboxService.createOutboxMessage({
      aggregateType: 'PaymentTransaction',
      aggregateId: transaction.id,
      eventType: PaymentFailedEvent.getEventType(),
      payload: event.toPayload(),
      exchange: ExchangeName.PAYMENT_EVENTS,
      routingKey: RoutingKey.PAYMENT_FAILED,
    });

    this.logger.log(`PaymentFailed (webhook) published for transaction: ${transaction.id}`);
  }
}
```

**Step 3 — Export the new handler**

Add `HandleStripeWebhookHandler` to `BE/apps/payments-service/src/application/commands/stripe/handlers/index.ts`.

**Step 4 — Register handler in app.module**

In `BE/apps/payments-service/src/app.module.ts`, add `HandleStripeWebhookHandler` to the `CommandHandlers` array.

**Step 5 — Fill the stub in microservice controller**

In `BE/apps/payments-service/src/presentation/microservice/payments.microservice.controller.ts`, the existing `handleStripeWebhook` method already has `@MessagePattern({ cmd: 'stripe_webhook' })` — replace its stub body with a real CQRS dispatch:

```typescript
@MessagePattern({ cmd: 'stripe_webhook' })
async handleStripeWebhook(@Payload() data: StripeWebhookDto): Promise<{ received: boolean }> {
  this.logger.debug('Processing Stripe webhook');
  return this.commandBus.execute(new HandleStripeWebhookCommand(data));
}
```

(Import `HandleStripeWebhookCommand` from `../../application`. The gateway already routes `POST /payments/stripe/webhook` → `{ cmd: 'stripe_webhook' }` — no gateway changes needed.)

### Verification

- `cd BE && yarn test --testPathPattern payments-service` passes.
- Calling `POST /payments/stripe/webhook` without a valid signature returns 400.
- A simulated `payment_intent.succeeded` webhook updates the transaction status to `SUCCEEDED` and creates an outbox row with `event_type = 'PaymentSucceeded'` and `routing_key = 'payment.succeeded'`.
- A simulated `payment_intent.payment_failed` webhook updates transaction status to `FAILED` and creates an outbox row with `event_type = 'PaymentFailed'`.

---

## Plan 6.2 — Backend: Ethereum Payment Recording

**Goal:** A new `RecordEthereumPayment` command creates a `PaymentTransaction` with `provider: ETHEREUM` and publishes an `EthereumPaymentRecordedEvent` via Outbox. A new gateway endpoint accepts the recording request from the frontend.

### Steps

**Step 1 — Add `PAYMENT_ETHEREUM_RECORDED` routing key**

In `BE/libs/rabbitmq/src/routing-keys/routing-keys.ts`, add:

```typescript
PAYMENT_ETHEREUM_RECORDED: 'payment.ethereum.recorded',
```

**Step 2 — Add `EthereumPaymentRecordedEvent`**

Create `BE/apps/payments-service/src/domain/events/ethereum-payment-recorded.event.ts`:

```typescript
export class EthereumPaymentRecordedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly userId: string,
    public readonly walletAddress: string,
    public readonly txHash: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly orderId?: string,
  ) {}

  static getEventType(): string {
    return 'EthereumPaymentRecorded';
  }

  toPayload(): Record<string, any> {
    return {
      transactionId: this.transactionId,
      userId: this.userId,
      walletAddress: this.walletAddress,
      txHash: this.txHash,
      amount: this.amount,
      currency: this.currency,
      orderId: this.orderId,
      timestamp: new Date().toISOString(),
    };
  }
}
```

Export it from `BE/apps/payments-service/src/domain/events/index.ts`.

**Step 3 — Add `RecordEthereumPaymentDTO`**

Create `BE/apps/payments-service/src/domain/dtos/payment/RecordEthereumPayment.dto.ts`:

```typescript
import { IsString, IsNotEmpty, IsUUID, IsNumber, IsPositive, Matches, IsOptional } from 'class-validator';

export class RecordEthereumPaymentDTO {
  @IsUUID()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{64}$/, { message: 'txHash must be a valid Ethereum transaction hash (0x + 64 hex chars)' })
  txHash!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'walletAddress must be a valid Ethereum address (0x + 40 hex chars)' })
  walletAddress!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsUUID()
  @IsOptional()
  orderId?: string;

  @IsUUID()
  @IsOptional()
  sellerId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

Export from `BE/apps/payments-service/src/domain/dtos/payment/index.ts`.

**Step 3a — Add unique DB constraint on `txHash`**

In `BE/apps/payments-service/src/domain/entities/payment-transaction.entity.ts`, verify the `txHash` column has a `unique: true` option. If not, add it:

```typescript
@Column({ nullable: true, unique: true })
txHash: string | null;
```

Then generate and run a TypeORM migration:
```bash
cd BE && yarn typeorm migration:generate -n AddUniqueTxHash -d apps/payments-service/src/infrastructure/database/data-source.ts
yarn typeorm migration:run -d apps/payments-service/src/infrastructure/database/data-source.ts
```

This ensures the DB rejects duplicate txHash at the storage level even under race conditions (the `findByTxHash` pre-check is a fast-path, not a guarantee).

**Step 4 — Add `RecordEthereumPaymentCommand`**

Create `BE/apps/payments-service/src/application/commands/payments/RecordEthereumPayment.command.ts`:

```typescript
import { RecordEthereumPaymentDTO } from '../../../domain/dtos/payment';

export class RecordEthereumPaymentCommand {
  constructor(public readonly data: RecordEthereumPaymentDTO) {}
}
```

**Step 5 — Add `RecordEthereumPaymentHandler`**

Create `BE/apps/payments-service/src/application/commands/payments/handlers/RecordEthereumPayment.command.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, HttpException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RecordEthereumPaymentCommand } from '../RecordEthereumPayment.command';
import { IPaymentTransactionRepository } from '../../../../domain/interfaces';
import { OutboxService } from '@app/outbox';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';
import {
  PaymentProvider,
  PaymentMethodType,
  TransactionStatus,
  TransactionType,
  RpcExceptionHelper,
} from '@app/common';
import { EthereumPaymentRecordedEvent } from '../../../../domain/events';
import { PaymentTransaction } from '../../../../domain/entities';

@CommandHandler(RecordEthereumPaymentCommand)
export class RecordEthereumPaymentHandler implements ICommandHandler<RecordEthereumPaymentCommand> {
  private readonly logger = new Logger(RecordEthereumPaymentHandler.name);

  constructor(
    @Inject(IPaymentTransactionRepository)
    private readonly transactionRepo: IPaymentTransactionRepository,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(command: RecordEthereumPaymentCommand): Promise<PaymentTransaction> {
    const { data } = command;

    this.logger.log(
      `Recording Ethereum payment for user: ${data.userId}, txHash: ${data.txHash}`,
    );

    if (data.amount <= 0) {
      throw RpcExceptionHelper.badRequest('Payment amount must be greater than 0');
    }

    const existing = await this.transactionRepo.findByTxHash(data.txHash);
    if (existing) {
      throw RpcExceptionHelper.conflict(`Transaction with txHash ${data.txHash} already recorded`);
    }

    let transaction: PaymentTransaction;
    try {
      transaction = await this.transactionRepo.create({
        type: TransactionType.PAYMENT,
        status: TransactionStatus.PROCESSING,
        provider: PaymentProvider.ETHEREUM,
        userId: data.userId,
        orderId: data.orderId ?? null,
        amount: data.amount,
        currency: data.currency.toUpperCase(),
        paymentMethodType: PaymentMethodType.CRYPTO_WALLET,
        walletAddress: data.walletAddress,
        txHash: data.txHash,
        description: data.description ?? null,
      });
    } catch (error) {
      this.logger.error('Failed to create Ethereum payment transaction', error.stack);
      throw RpcExceptionHelper.internalError('Failed to record payment');
    }

    const event = new EthereumPaymentRecordedEvent(
      transaction.id,
      data.userId,
      data.walletAddress,
      data.txHash,
      data.amount,
      data.currency,
      data.orderId,
    );

    await this.outboxService.createOutboxMessage({
      aggregateType: 'PaymentTransaction',
      aggregateId: transaction.id,
      eventType: EthereumPaymentRecordedEvent.getEventType(),
      payload: event.toPayload(),
      exchange: ExchangeName.PAYMENT_EVENTS,
      routingKey: RoutingKey.PAYMENT_ETHEREUM_RECORDED,
    });

    this.logger.log(`EthereumPaymentRecordedEvent published for transaction: ${transaction.id}`);
    return transaction;
  }
}
```

**Step 6 — Add `findByTxHash` to `IPaymentTransactionRepository`**

In `BE/apps/payments-service/src/domain/interfaces/payment-transaction.repository.interface.ts`, add:

```typescript
findByTxHash(txHash: string): Promise<PaymentTransaction | null>;
```

Implement it in the TypeORM repository (`infrastructure/repositories/payment-transaction.repository.ts`):

```typescript
async findByTxHash(txHash: string): Promise<PaymentTransaction | null> {
  return this.repository.findOne({ where: { txHash } });
}
```

**Step 7 — Register handler and export command**

- Add `RecordEthereumPaymentHandler` to `CommandHandlers` array in `payments-service/src/app.module.ts`.
- Export `RecordEthereumPaymentCommand` from `application/commands/payments/index.ts`.
- Export `RecordEthereumPaymentHandler` from `application/commands/payments/handlers/index.ts`.

**Step 8 — Add `@MessagePattern` in microservice controller**

In `payments.microservice.controller.ts`, add:

```typescript
@MessagePattern({ cmd: 'record_ethereum_payment' })
async recordEthereumPayment(@Payload() data: RecordEthereumPaymentDTO) {
  this.logger.debug(`Recording Ethereum payment for user: ${data.userId}`);
  return this.commandBus.execute(new RecordEthereumPaymentCommand(data));
}
```

**Step 9 — Gateway: expose `POST /payments/ethereum`**

In `BE/apps/api-gateway/src/presentation/http/controllers/payment/payment.controller.ts`, add:

```typescript
@Post('ethereum')
@UseGuards(JwtAuthGuard)
@HttpCode(201)
async recordEthereumPayment(
  @CurrentUser() user: AuthPayload,
  @Body() body: RecordEthereumPaymentDto,
) {
  return this.paymentsClient.send({ cmd: 'record_ethereum_payment' }, {
    ...body,
    userId: user.userId,
  }).toPromise();
}
```

Create the corresponding gateway DTO `RecordEthereumPaymentDto` with the same fields as the service DTO (excluding `userId` which comes from JWT). Apply `@IsString`, `@Matches` validators.

### Verification

- `cd BE && yarn test --testPathPattern payments-service` passes.
- `POST /payments/ethereum` without JWT returns 401.
- `POST /payments/ethereum` with valid JWT + valid ETH txHash + walletAddress creates a `PaymentTransaction` row with `provider = 'ETHEREUM'`, `status = 'PROCESSING'`.
- A row appears in the `outbox` table with `event_type = 'EthereumPaymentRecorded'`, `routing_key = 'payment.ethereum.recorded'`.
- Submitting the same `txHash` twice returns 409 Conflict.
- Invalid `txHash` format (not `0x` + 64 hex chars) returns 400.

---

## Plan 6.3 — Frontend: Revamped Payment Method Selector (Card | Crypto Wallet)

**Goal:** Replace the accordion-toggle layout in `BuyerCheckoutPaymentForm.tsx` with a clear two-option selector at the top (Card / Crypto Wallet) and a distinct wallet connection section. Keep existing raw card inputs unchanged.

**UX Proposals implemented:**
- Primary choice is a two-column pill selector (`[ 💳 Card ] [ 🦊 Crypto Wallet ]`) — visually distinct, always visible.
- Selecting "Card" shows the existing card fields below.
- Selecting "Crypto Wallet" shows the MetaMask connect flow.
- The wire transfer section is removed from this step (out of scope for this phase).
- Error messages render inline below the selected method, not via `alert()`.

### Steps

**Step 1 — Extend the Zod payment schema**

In `FE/artium-web/src/@domains/checkout/validations/buyerCheckout.schema.ts`:

Replace `buyerCheckoutPaymentSchema` with a discriminated union:

```typescript
export const buyerCheckoutPaymentSchema = z.discriminatedUnion('paymentMethod', [
  z.object({
    paymentMethod: z.literal('card'),
    cardNumber: z
      .string()
      .trim()
      .min(1, 'Card number is required')
      .refine((v) => v.replace(/\s/g, '').length >= 13, 'Card number is incomplete'),
    expiryDate: z
      .string()
      .trim()
      .min(1, 'Expiry date is required')
      .regex(CARD_EXPIRY_REGEX, 'Use MM / YY format'),
    cvc: z
      .string()
      .trim()
      .min(1, 'Security code is required')
      .regex(/^\d{3,4}$/, 'Use a valid security code'),
    country: z.string().trim().min(1, 'Country is required'),
  }),
  z.object({
    paymentMethod: z.literal('wallet'),
    walletAddress: z
      .string()
      .min(1, 'Please connect your wallet')
      .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
    txHash: z
      .string()
      .min(1, 'Transaction hash is required after sending ETH')
      .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
  }),
]);

export type BuyerCheckoutPaymentValues = z.infer<typeof buyerCheckoutPaymentSchema>;
```

Update the default values in `BuyerCheckoutPageView.tsx` to default to `paymentMethod: 'card'` with the card fields.

**Step 2 — Rewrite `BuyerCheckoutPaymentForm.tsx`**

Rewrite the component with this structure:

```tsx
'use client'  // (no-op in Pages Router but documents intent)
import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { CreditCard } from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { Input } from '@shared/components/ui/input'
import type { BuyerCheckoutPaymentValues } from '../validations/buyerCheckout.schema'
import { WalletPaymentSection } from './WalletPaymentSection'

const METHOD_OPTIONS = [
  { value: 'card', label: 'Card', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'wallet', label: 'Crypto Wallet', icon: <span className="text-lg">🦊</span> },
] as const

export const BuyerCheckoutPaymentForm = () => {
  const { formState: { errors }, register, setValue, getValues } = useFormContext<BuyerCheckoutPaymentValues>()
  const paymentMethod = useWatch({ name: 'paymentMethod' }) ?? 'card'

  const handleMethodChange = (method: 'card' | 'wallet') => {
    if (method === 'card') {
      setValue('paymentMethod', 'card', { shouldDirty: true, shouldValidate: true })
    } else {
      setValue('paymentMethod', 'wallet', { shouldDirty: true, shouldValidate: true })
      setValue('walletAddress' as any, '', { shouldDirty: true })
      setValue('txHash' as any, '', { shouldDirty: true })
    }
  }

  return (
    <div className="space-y-6">
      {/* Method selector */}
      <div className="grid grid-cols-2 gap-3">
        {METHOD_OPTIONS.map(({ value, label, icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleMethodChange(value)}
            className={cn(
              'flex items-center justify-center gap-3 rounded-2xl border-2 p-4 transition',
              paymentMethod === value
                ? 'border-[#0066FF] bg-blue-50 text-[#0066FF]'
                : 'border-[#E5E5E5] text-[#595959] hover:border-[#D4D4D4]',
            )}
          >
            {icon}
            <span className="text-[14px] font-bold">{label}</span>
          </button>
        ))}
      </div>

      {/* Card fields */}
      {paymentMethod === 'card' && <CardSection register={register} setValue={setValue} errors={errors} />}

      {/* Wallet fields */}
      {paymentMethod === 'wallet' && (
        <WalletPaymentSection
          onWalletConnected={(address) => setValue('walletAddress' as any, address, { shouldDirty: true, shouldValidate: true })}
          onTxHashReceived={(hash) => setValue('txHash' as any, hash, { shouldDirty: true, shouldValidate: true })}
          errors={errors}
        />
      )}
    </div>
  )
}
```

The existing card fields (`CardSection`) should be extracted into a sub-component within this file (no visual change to card fields — just internal refactor).

**Step 3 — Create `WalletPaymentSection.tsx`**

Create `FE/artium-web/src/@domains/checkout/components/WalletPaymentSection.tsx`:

```tsx
import { useState, useCallback } from 'react'
import { cn } from '@shared/lib/utils'

type Props = {
  onWalletConnected: (address: string) => void
  onTxHashReceived: (hash: string) => void
  errors: any
  ethAmount?: number
}

export const WalletPaymentSection = ({ onWalletConnected, onTxHashReceived, errors, ethAmount }: Props) => {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string>('')
  const [isSendingTx, setIsSendingTx] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setConnectError('MetaMask not detected. Please install MetaMask.')
      return
    }
    setIsConnecting(true)
    setConnectError(null)
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]
      setWalletAddress(address)
      onWalletConnected(address)
    } catch (err: any) {
      setConnectError(err?.message ?? 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [onWalletConnected])

  const sendEthTransaction = useCallback(async () => {
    if (!walletAddress || !ethAmount) return
    setIsSendingTx(true)
    setTxError(null)
    try {
      // PLATFORM_ETH_WALLET is an env var on the frontend (NEXT_PUBLIC_PLATFORM_ETH_WALLET)
      const toAddress = process.env.NEXT_PUBLIC_PLATFORM_ETH_WALLET
      if (!toAddress) throw new Error('Platform wallet address not configured')

      // Convert ETH amount to wei (hex)
      const amountInWei = BigInt(Math.floor(ethAmount * 1e18)).toString(16)

      const hash: string = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{ from: walletAddress, to: toAddress, value: `0x${amountInWei}` }],
      })
      setTxHash(hash)
      onTxHashReceived(hash)
    } catch (err: any) {
      setTxError(err?.message ?? 'Transaction failed')
    } finally {
      setIsSendingTx(false)
    }
  }, [walletAddress, ethAmount, onTxHashReceived])

  return (
    <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-sm space-y-4">
      {!walletAddress ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <span className="text-4xl">🦊</span>
          <p className="text-[14px] text-[#595959] text-center">
            Connect your MetaMask wallet to pay with ETH
          </p>
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting}
            className="rounded-full bg-[#0066FF] px-8 py-3 text-[14px] font-bold text-white transition hover:bg-[#0052CC] disabled:opacity-60"
          >
            {isConnecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
          {connectError && (
            <p className="text-[12px] text-red-500">{connectError}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[13px] font-medium text-green-800">
              {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
            </span>
          </div>

          {ethAmount !== undefined && !txHash && (
            <button
              type="button"
              onClick={sendEthTransaction}
              disabled={isSendingTx}
              className="w-full rounded-2xl bg-[#F97316] px-6 py-4 text-[14px] font-bold text-white transition hover:bg-[#EA6C0A] disabled:opacity-60"
            >
              {isSendingTx ? 'Confirm in MetaMask…' : `Send ${ethAmount?.toFixed(4)} ETH`}
            </button>
          )}

          {txHash && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0066FF]">Transaction Sent</p>
              <p className="mt-1 text-[12px] font-mono text-[#191414] break-all">
                {txHash.slice(0, 10)}…{txHash.slice(-8)}
              </p>
            </div>
          )}

          {txError && <p className="text-[12px] text-red-500">{txError}</p>}
          {errors?.txHash?.message && (
            <p className="text-[12px] text-red-500">{String(errors.txHash.message)}</p>
          )}
        </div>
      )}
    </div>
  )
}
```

### Verification

- `cd FE/artium-web && npm run lint` passes.
- `cd FE/artium-web && npm run build` passes.
- Switching between Card and Wallet methods resets form fields correctly (no stale card data visible in wallet section).
- MetaMask not present: clicking "Connect Wallet" shows the error message inline (no `alert()`).

---

## Plan 6.4 — Frontend: Complete the Stripe Card Payment Flow

**Goal:** `BuyerCheckoutPageView.tsx` must complete the full payment flow: create order → create payment intent → tokenize card with Stripe.js → confirm payment intent → redirect to success. Replace all `alert()` calls with `setError` / inline rendering. Ensure Stripe customer exists before creating payment intent. Also fix two existing backend bugs: the 100× amount multiplication in `StripeService` and the missing `userId` injection in the gateway's `createStripeCustomer` endpoint.

### Steps

**Step 0 — Fix amount units bug in `StripeService`**

`StripeService.createPaymentIntent()` currently does `amount: Math.round(amount * 100)` — but the DTO docs say "Amount in cents" and the FE already sends `amountInCents = Math.round(total * 100)`. This causes Stripe to receive 100× the intended amount.

In `BE/apps/payments-service/src/infrastructure/services/stripe.service.ts`, change:
```typescript
// BEFORE (wrong — multiplies cents by 100 again)
amount: Math.round(amount * 100),
// AFTER (correct — amount is already in cents)
amount: Math.round(amount),
```

**Step 0b — Fix `createStripeCustomer` gateway to inject `userId` from JWT**

In `BE/apps/api-gateway/src/presentation/http/controllers/payment/payments.controller.ts`, the `createStripeCustomer` handler currently passes `data` without a `userId`. The payments-service `CreateCustomerDTO` requires `userId`. Fix:

```typescript
// BEFORE
async createStripeCustomer(@Body() data: CreateStripeCustomerDto) {
  return sendRpc(this.paymentsClient, { cmd: 'create_stripe_customer' }, data);
}
// AFTER
async createStripeCustomer(@Body() data: CreateStripeCustomerDto, @Req() req: any) {
  return sendRpc(this.paymentsClient, { cmd: 'create_stripe_customer' }, { ...data, userId: req.user?.id });
}
```

**Step 0c — Add Stripe.js card tokenization**

Install `@stripe/stripe-js` in the FE:
```bash
cd FE/artium-web && npm install @stripe/stripe-js
```

Create `FE/artium-web/src/@domains/checkout/hooks/useStripeCardToken.ts`:

```typescript
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export async function createStripePaymentMethod(card: {
  number: string
  exp_month: number
  exp_year: number
  cvc: string
}): Promise<string> {
  const stripe = await stripePromise
  if (!stripe) throw new Error('Stripe failed to load')

  const result = await stripe.createPaymentMethod({
    type: 'card',
    card: {
      number: card.number.replace(/\s/g, ''),
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      cvc: card.cvc,
    },
  })

  if (result.error) throw new Error(result.error.message ?? 'Card tokenization failed')
  return result.paymentMethod.id  // pm_...
}
```

Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `FE/artium-web/.env.local`.

In `BuyerCheckoutPageView.tsx`, call `createStripePaymentMethod()` before `confirmPaymentIntent` to obtain a `pm_...` ID, then pass it as `stripePaymentMethodId`:

```typescript
import { createStripePaymentMethod } from '../hooks/useStripeCardToken'

// inside handleContinue, after createPaymentIntent:
const cardValues = paymentForm.getValues() as any
const pmId = await createStripePaymentMethod({
  number: cardValues.cardNumber,
  exp_month: parseInt(cardValues.expiryDate?.split('/')[0] ?? '0', 10),
  exp_year: parseInt(cardValues.expiryDate?.split('/')[1] ?? '0', 10),
  cvc: cardValues.cvv,
})

await paymentApis.confirmPaymentIntent({
  paymentIntentId: intent.stripePaymentIntentId,
  stripePaymentMethodId: pmId,
})
```

**Step 1 — Add `createStripeCustomer` auto-setup**

In `BuyerCheckoutPageView.tsx`, before calling `paymentApis.createPaymentIntent`, call `createStripeCustomer` and catch 409 (already exists):

```typescript
// Ensure Stripe customer exists
try {
  await paymentApis.createStripeCustomer({ email: checkoutValues.contact.email })
} catch (err: any) {
  // 409 = customer already exists — this is fine, continue
  if (err?.statusCode !== 409 && err?.response?.status !== 409) {
    throw new Error('Failed to set up payment account. Please try again.')
  }
}
```

**Step 2 — Call `confirmPaymentIntent` with the tokenized payment method ID**

After `await paymentApis.createPaymentIntent(...)` (which now receives `amountInCents`), tokenize the card and confirm:

```typescript
const intent = await paymentApis.createPaymentIntent({
  amount: amountInCents,
  currency: 'usd',
  orderId: order.id,
  sellerId: artwork.artistId || undefined,
  description: `Purchase: ${artwork.title}`,
})

// Tokenize raw card inputs via Stripe.js (see Step 0c)
const cardValues = paymentForm.getValues() as any
const pmId = await createStripePaymentMethod({
  number: cardValues.cardNumber,
  exp_month: parseInt(cardValues.expiryDate?.split('/')[0] ?? '0', 10),
  exp_year: parseInt(cardValues.expiryDate?.split('/')[1] ?? '0', 10),
  cvc: cardValues.cvv,
})

await paymentApis.confirmPaymentIntent({
  paymentIntentId: intent.stripePaymentIntentId,
  stripePaymentMethodId: pmId,
})
```

**Step 3 — Handle wallet path in `handleContinue`**

Add a branch for the wallet payment method after the card flow:

```typescript
const paymentValues = paymentForm.getValues()

if (paymentValues.paymentMethod === 'card') {
  // existing Stripe flow (Steps 1+2)
} else if (paymentValues.paymentMethod === 'wallet') {
  // Record the ETH transaction
  await paymentApis.recordEthereumPayment({
    txHash: (paymentValues as any).txHash,
    walletAddress: (paymentValues as any).walletAddress,
    orderId: order.id,
    amount: pricing.total,
    currency: 'ETH',
    description: `Purchase: ${artwork.title}`,
  })
}
```

**Step 4 — Add `recordEthereumPayment` to `paymentApis.ts`**

In `FE/artium-web/src/@shared/apis/paymentApis.ts`, add:

```typescript
export type RecordEthereumPaymentRequest = {
  txHash: string
  walletAddress: string
  orderId?: string
  amount: number
  currency: string
  description?: string
}

export type RecordEthereumPaymentResponse = {
  id: string
  type: string
  status: string
  provider: string
  txHash: string
  walletAddress: string
  amount: number
  currency: string
  orderId: string | null
  createdAt: string
}
```

And add to the `paymentApis` object:

```typescript
recordEthereumPayment: async (
  data: RecordEthereumPaymentRequest,
): Promise<RecordEthereumPaymentResponse> => {
  return apiPost<RecordEthereumPaymentResponse>('/payments/ethereum', data)
},
```

**Step 5 — Replace all `alert()` with inline error state**

In `BuyerCheckoutPageView.tsx`:
- Replace every `alert('...')` with `setError('...')`.
- Add an error banner below the form if `error` is set:

```tsx
{error && (
  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
    <p className="text-[13px] text-red-700">{error}</p>
  </div>
)}
```

- The existing `setError(null)` at the top of `handleContinue` is already in place — keep it.
- Remove the `confirm('Are you sure...')` native dialog in `handleCancel`; replace with an inline modal or simply call `router.back()` directly.

**Step 6 — Success redirect**

After a successful payment (either path), replace:
```typescript
alert(`Order ${order.orderNumber} placed successfully!`)
router.push('/discover')
```
with:
```typescript
router.push(`/orders/${order.id}/confirmation?orderNumber=${order.orderNumber}`)
```

> **Note:** If the `/orders/[id]/confirmation` page does not yet exist, redirect to `/discover` with a success query param: `router.push('/discover?checkout=success')`. The page creation is out of scope for this phase.

**Step 7 — Pass `ethAmount` to `WalletPaymentSection`**

In `BuyerCheckoutPageView.tsx`, pass the `pricing.total` as the `ethAmount` prop to `BuyerCheckoutPaymentForm`, which in turn passes it to `WalletPaymentSection`. This requires threading `pricing` into the payment form via a prop or context.

Simplest approach: render `BuyerCheckoutPaymentForm` with a new optional prop `ethAmount`:

```tsx
<FormProvider {...paymentForm}>
  <BuyerCheckoutPaymentForm ethAmount={pricing.total} />
</FormProvider>
```

Update `BuyerCheckoutPaymentForm` to accept and forward `ethAmount?: number` to `WalletPaymentSection`.

### Verification

- `cd FE/artium-web && npm run lint` passes.
- `cd FE/artium-web && npm run build` passes (no TypeScript errors).
- In the UI, submitting the card form with a valid card calls both `createPaymentIntent` and `confirmPaymentIntent` (observable in Network tab or mock).
- Network error during payment shows the error message inline below the form (no `alert()` box appears).
- Clicking Cancel on step 1 goes back in history without showing a native confirm dialog.
- Completing the wallet path (with a mocked `txHash`) calls `paymentApis.recordEthereumPayment`.

---

## Plan 6.5 — Frontend: `window.ethereum` Type Declaration

**Goal:** Prevent TypeScript errors for `window.ethereum` access in `WalletPaymentSection.tsx`.

### Steps

**Step 1 — Add Ethereum type shim**

Create `FE/artium-web/src/@types/ethereum.d.ts`:

```typescript
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  };
}
```

### Verification

- `cd FE/artium-web && npx tsc --noemit` passes with no errors on `WalletPaymentSection.tsx`.

---

## UAT (User Acceptance Tests)

The following must be true for this phase to be complete:

1. **Card path**: Developer can open the checkout page, complete the contact step, select "Card", enter card details, click "Pay Now", and observe `createStripeCustomer` → `createPaymentIntent` → `confirmPaymentIntent` (with `stripePaymentMethodId`) API calls in the Network tab without seeing any `alert()` dialog.

2. **Wallet path**: Developer can select "Crypto Wallet" on the payment step, click "Connect Wallet", and see either a connected wallet address (if MetaMask present) or an inline error message (if MetaMask absent) — no `alert()` appears.

3. **Ethereum recording**: Developer can POST `{ txHash: "0x<64hexchars>", walletAddress: "0x<40hexchars>", amount: 100, currency: "ETH" }` to `POST /payments/ethereum` (with valid JWT) and receive a 201 response containing the created transaction. The `outbox` table contains a row for this transaction with `event_type = 'EthereumPaymentRecorded'`.

4. **Stripe webhook**: Developer can POST a simulated `payment_intent.succeeded` event body to `POST /payments/stripe/webhook` with a valid `stripe-signature` header and observe the corresponding transaction updated to `SUCCEEDED` and an outbox row with `routing_key = 'payment.succeeded'`.

5. **Duplicate protection**: POSTing the same `txHash` twice to `POST /payments/ethereum` returns 409 Conflict.

6. **Type safety**: `npx tsc --noemit` from `FE/artium-web` exits with code 0.

7. **Build**: `npm run build` from `FE/artium-web` exits with code 0.

8. **Backend tests**: `yarn test` from `BE/` exits with code 0 (no regressions).
