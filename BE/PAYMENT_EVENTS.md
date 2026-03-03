# Payment Events Documentation

This document describes all payment-related events published by the payments-service and how other services can consume them.

## Architecture Overview

The payments-service uses an event-driven architecture with the outbox pattern to ensure reliable event publishing. All payment state changes are published as events to RabbitMQ, allowing other services to react to payment-related activities.

### Event Flow

1. Payment operation occurs (e.g., payment intent created, payment succeeded)
2. Transaction and event stored in outbox table (atomic operation)
3. Outbox processor publishes event to RabbitMQ
4. Consuming services receive and process events

## Exchange and Routing Keys

### Exchange
- **Name**: `payment.events.exchange`
- **Type**: `topic`
- **Durable**: `true`

### Routing Keys
- `payment.stripe.customer.created`
- `payment.intent.created`
- `payment.succeeded`
- `payment.failed`
- `payment.refunded`
- `payment.method.attached`

## Event Types

### 1. StripeCustomerCreated

Published when a new Stripe customer is created for a user.

**Routing Key**: `payment.stripe.customer.created`

**Payload**:
```typescript
{
  userId: string;
  stripeCustomerId: string;
  email: string;
  name?: string;
  timestamp: string;
}
```

**Example**:
```json
{
  "userId": "user_123",
  "stripeCustomerId": "cus_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "timestamp": "2025-01-13T10:30:00.000Z"
}
```

**Use Cases**:
- Update user record with Stripe customer ID
- Track customer creation for analytics
- Trigger welcome email with payment setup instructions

**Current Consumers**:
- `identity-service`: Updates User entity with stripeCustomerId

---

### 2. PaymentIntentCreated

Published when a payment intent is created.

**Routing Key**: `payment.intent.created`

**Payload**:
```typescript
{
  transactionId: string;
  userId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  orderId?: string;
  invoiceId?: string;
  timestamp: string;
}
```

**Example**:
```json
{
  "transactionId": "txn_123",
  "userId": "user_123",
  "paymentIntentId": "pi_abc123",
  "amount": 99.99,
  "currency": "usd",
  "orderId": "order_456",
  "timestamp": "2025-01-13T10:30:00.000Z"
}
```

**Use Cases**:
- Track payment initiation
- Update order status to "payment_pending"
- Analytics and reporting
- Send payment confirmation email

---

### 3. PaymentSucceeded

Published when a payment is successfully processed.

**Routing Key**: `payment.succeeded`

**Payload**:
```typescript
{
  transactionId: string;
  userId: string;
  paymentIntentId: string;
  chargeId: string;
  amount: number;
  currency: string;
  orderId?: string;
  invoiceId?: string;
  timestamp: string;
}
```

**Example**:
```json
{
  "transactionId": "txn_123",
  "userId": "user_123",
  "paymentIntentId": "pi_abc123",
  "chargeId": "ch_xyz789",
  "amount": 99.99,
  "currency": "usd",
  "orderId": "order_456",
  "timestamp": "2025-01-13T10:35:00.000Z"
}
```

**Use Cases**:
- Mark order as paid
- Trigger order fulfillment
- Generate invoice
- Send payment receipt email
- Update user credits/balance
- Analytics and revenue tracking

---

### 4. PaymentFailed

Published when a payment fails.

**Routing Key**: `payment.failed`

**Payload**:
```typescript
{
  transactionId: string;
  userId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  failureReason: string;
  failureCode?: string;
  timestamp: string;
}
```

**Example**:
```json
{
  "transactionId": "txn_123",
  "userId": "user_123",
  "paymentIntentId": "pi_abc123",
  "amount": 99.99,
  "currency": "usd",
  "failureReason": "Your card was declined",
  "failureCode": "card_declined",
  "timestamp": "2025-01-13T10:35:00.000Z"
}
```

**Use Cases**:
- Mark order as payment_failed
- Send payment failure notification
- Suggest alternative payment methods
- Retry payment with different method
- Analytics for payment failure patterns

---

### 5. PaymentRefunded

Published when a payment is refunded (fully or partially).

**Routing Key**: `payment.refunded`

**Payload**:
```typescript
{
  transactionId: string;
  userId: string;
  paymentIntentId: string;
  refundAmount: number;
  currency: string;
  isPartialRefund: boolean;
  reason?: string;
  timestamp: string;
}
```

**Example**:
```json
{
  "transactionId": "txn_123",
  "userId": "user_123",
  "paymentIntentId": "pi_abc123",
  "refundAmount": 99.99,
  "currency": "usd",
  "isPartialRefund": false,
  "reason": "requested_by_customer",
  "timestamp": "2025-01-13T11:00:00.000Z"
}
```

**Use Cases**:
- Update order status to refunded
- Reverse inventory allocation
- Send refund confirmation email
- Update user credits if applicable
- Analytics for refund patterns

---

### 6. PaymentMethodAttached

Published when a payment method is attached to a customer.

**Routing Key**: `payment.method.attached`

**Payload**:
```typescript
{
  userId: string;
  paymentMethodId: string;
  stripePaymentMethodId: string;
  type: string;
  lastFour?: string;
  brand?: string;
  timestamp: string;
}
```

**Example**:
```json
{
  "userId": "user_123",
  "paymentMethodId": "pm_123",
  "stripePaymentMethodId": "pm_abc123",
  "type": "card",
  "lastFour": "4242",
  "brand": "visa",
  "timestamp": "2025-01-13T10:30:00.000Z"
}
```

**Use Cases**:
- Send confirmation email
- Enable one-click checkout
- Update user preferences
- Analytics for payment method adoption

---

## Consuming Events

### Setting Up Event Handler

1. Create event handler class with `@RabbitSubscribe` decorator
2. Register handler in module providers
3. Import `AppRabbitMQModule` in your service module

**Example Event Handler**:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName, RoutingKey } from '@app/rabbitmq';

interface PaymentSucceededPayload {
  transactionId: string;
  userId: string;
  paymentIntentId: string;
  chargeId: string;
  amount: number;
  currency: string;
  orderId?: string;
  invoiceId?: string;
  timestamp: string;
}

@Injectable()
export class PaymentSucceededEventHandler {
  private readonly logger = new Logger(PaymentSucceededEventHandler.name);

  @RabbitSubscribe({
    exchange: ExchangeName.PAYMENT_EVENTS,
    routingKey: RoutingKey.PAYMENT_SUCCEEDED,
    queue: 'your-service.payment-succeeded',
    queueOptions: {
      durable: true,
    },
  })
  async handle(message: PaymentSucceededPayload) {
    this.logger.log(`Payment succeeded for transaction: ${message.transactionId}`);

    // Your business logic here
  }
}
```

### Module Registration

```typescript
import { Module } from '@nestjs/common';
import { AppRabbitMQModule } from '@app/rabbitmq';
import { PaymentSucceededEventHandler } from './event-handlers';

@Module({
  imports: [AppRabbitMQModule],
  providers: [PaymentSucceededEventHandler],
})
export class YourServiceModule {}
```

### Queue Naming Convention

Use the pattern: `{service-name}.{event-name}`

Examples:
- `identity-service.stripe-customer-created`
- `orders-service.payment-succeeded`
- `notifications-service.payment-failed`

### Error Handling

Configure error handling and dead letter queues:

```typescript
@RabbitSubscribe({
  exchange: ExchangeName.PAYMENT_EVENTS,
  routingKey: RoutingKey.PAYMENT_SUCCEEDED,
  queue: 'orders-service.payment-succeeded',
  queueOptions: {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'payment.events.dlx',
      'x-dead-letter-routing-key': 'payment.succeeded.failed',
    },
  },
  errorHandler: (channel, msg, props) => {
    channel.nack(msg, false, false);
  },
})
async handle(message: PayloadType) {
  try {
    // Process event
  } catch (error) {
    this.logger.error('Failed to process event', error.stack);
    throw error;
  }
}
```

## Event Sourcing Considerations

### Idempotency

Event handlers should be idempotent to handle duplicate messages:

```typescript
async handle(message: PaymentSucceededPayload) {
  const order = await this.orderRepo.findById(message.orderId);

  if (order.status === OrderStatus.PAID) {
    this.logger.warn(`Order ${message.orderId} already marked as paid`);
    return;
  }

  await this.orderRepo.update(message.orderId, {
    status: OrderStatus.PAID,
    paidAt: new Date(),
  });
}
```

### Event Ordering

Events are published in the order they occur, but network issues may cause out-of-order delivery. Always check entity state before applying changes.

### Event Replay

The outbox pattern ensures all events are persisted. Events can be replayed by re-processing outbox messages if needed.

## Testing Event Handlers

### Unit Testing

```typescript
describe('PaymentSucceededEventHandler', () => {
  it('should update order status when payment succeeds', async () => {
    const handler = new PaymentSucceededEventHandler(orderRepo);

    await handler.handle({
      transactionId: 'txn_123',
      userId: 'user_123',
      orderId: 'order_456',
      amount: 99.99,
      currency: 'usd',
      // ...
    });

    expect(orderRepo.update).toHaveBeenCalledWith('order_456', {
      status: OrderStatus.PAID,
      paidAt: expect.any(Date),
    });
  });
});
```

### Integration Testing

Use RabbitMQ test containers or in-memory message bus for integration tests.

## Monitoring and Observability

### Logging

All event handlers should log:
- Event received
- Processing started
- Processing completed
- Processing failed (with error details)

### Metrics

Track:
- Events published per type
- Events consumed per service
- Processing time
- Error rate
- Dead letter queue depth

## Environment Configuration

Required environment variables:

```env
RABBITMQ_URI=amqp://user:pass@localhost:5672
RABBITMQ_PREFETCH=10
RABBITMQ_RETRY_ATTEMPTS=10
RABBITMQ_RETRY_DELAY=5000
```

## Related Documentation

- [Stripe Integration Guide](./STRIPE_INTEGRATION.md)
- [Outbox Pattern Documentation](./libs/outbox/README.md)
- [RabbitMQ Configuration](./libs/rabbitmq/README.md)

## Example Integration Scenarios

### Scenario 1: Order Processing Service

When a payment succeeds, the orders-service needs to:
1. Mark order as paid
2. Trigger fulfillment workflow
3. Generate invoice

```typescript
@Injectable()
export class PaymentSucceededEventHandler {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly fulfillmentService: FulfillmentService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @RabbitSubscribe({
    exchange: ExchangeName.PAYMENT_EVENTS,
    routingKey: RoutingKey.PAYMENT_SUCCEEDED,
    queue: 'orders-service.payment-succeeded',
    queueOptions: { durable: true },
  })
  async handle(message: PaymentSucceededPayload) {
    if (!message.orderId) return;

    await this.orderRepo.update(message.orderId, {
      status: OrderStatus.PAID,
      paidAt: new Date(),
      transactionId: message.transactionId,
    });

    await this.fulfillmentService.initiateFulfillment(message.orderId);
    await this.invoiceService.generateInvoice(message.orderId);
  }
}
```

### Scenario 2: Notifications Service

Send email notifications for payment events:

```typescript
@Injectable()
export class PaymentEventsNotificationHandler {
  constructor(private readonly notificationService: NotificationService) {}

  @RabbitSubscribe({
    exchange: ExchangeName.PAYMENT_EVENTS,
    routingKey: RoutingKey.PAYMENT_SUCCEEDED,
    queue: 'notifications-service.payment-succeeded',
    queueOptions: { durable: true },
  })
  async handlePaymentSucceeded(message: PaymentSucceededPayload) {
    await this.notificationService.sendEmail({
      userId: message.userId,
      template: 'payment-receipt',
      context: {
        amount: message.amount,
        currency: message.currency,
        transactionId: message.transactionId,
      },
    });
  }

  @RabbitSubscribe({
    exchange: ExchangeName.PAYMENT_EVENTS,
    routingKey: RoutingKey.PAYMENT_FAILED,
    queue: 'notifications-service.payment-failed',
    queueOptions: { durable: true },
  })
  async handlePaymentFailed(message: PaymentFailedPayload) {
    await this.notificationService.sendEmail({
      userId: message.userId,
      template: 'payment-failed',
      context: {
        amount: message.amount,
        failureReason: message.failureReason,
      },
    });
  }
}
```

### Scenario 3: Analytics Service

Track payment metrics:

```typescript
@Injectable()
export class PaymentAnalyticsEventHandler {
  constructor(private readonly analyticsRepo: IAnalyticsRepository) {}

  @RabbitSubscribe({
    exchange: ExchangeName.PAYMENT_EVENTS,
    routingKey: 'payment.*',
    queue: 'analytics-service.payment-events',
    queueOptions: { durable: true },
  })
  async handle(message: any) {
    await this.analyticsRepo.trackEvent({
      eventType: message.eventType || 'payment_event',
      userId: message.userId,
      amount: message.amount,
      currency: message.currency,
      metadata: message,
      timestamp: new Date(message.timestamp),
    });
  }
}
```

## Troubleshooting

### Event Not Received

1. Check RabbitMQ connection: Verify `RABBITMQ_URI` is correct
2. Verify exchange and queue exist: Use RabbitMQ management UI
3. Check routing key matches: Ensure routing key in handler matches publisher
4. Verify queue binding: Queue should be bound to exchange with correct routing key

### Duplicate Events

1. Implement idempotent handlers
2. Use transaction IDs to deduplicate
3. Store processed event IDs in cache/database

### Events Processing Too Slowly

1. Increase `RABBITMQ_PREFETCH` to process more messages in parallel
2. Scale consumer instances horizontally
3. Optimize handler logic
4. Add indexes to database queries

### Dead Letter Queue Growing

1. Check handler error logs
2. Fix bugs causing failures
3. Implement retry logic with exponential backoff
4. Monitor DLQ and alert on growth
