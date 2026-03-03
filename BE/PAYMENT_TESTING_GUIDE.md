# Payment Service Testing Guide

This guide provides step-by-step instructions for testing the Stripe payment integration.

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Manual API Testing](#manual-api-testing)
3. [Webhook Testing](#webhook-testing)
4. [Event-Driven Flow Testing](#event-driven-flow-testing)
5. [Automated Testing](#automated-testing)
6. [Common Test Scenarios](#common-test-scenarios)
7. [Troubleshooting](#troubleshooting)

---

## Environment Setup

### 1. Get Stripe Test Keys

1. Sign up for Stripe account at https://dashboard.stripe.com/register
2. Navigate to Developers > API keys
3. Copy your test keys (they start with `pk_test_` and `sk_test_`)

### 2. Configure Environment Variables

Create or update `apps/payments-service/.env.local`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=artium_payments

# Stripe
STRIPE_API_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# RabbitMQ
RABBITMQ_URI=amqp://guest:guest@localhost:5672
RABBITMQ_PREFETCH=10
RABBITMQ_RETRY_ATTEMPTS=10
RABBITMQ_RETRY_DELAY=5000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Service
PORT=3001
```

### 3. Install Stripe CLI

```bash
# Windows (using Scoop)
scoop install stripe

# Mac (using Homebrew)
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.5/stripe_1.19.5_linux_x86_64.tar.gz
tar -xvf stripe_1.19.5_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

Verify installation:
```bash
stripe --version
```

Login to Stripe:
```bash
stripe login
```

### 4. Start Required Services

```bash
# Start PostgreSQL (if not running)
# Docker example:
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Start RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Start Redis
docker run -d --name redis -p 6379:6379 redis

# Verify RabbitMQ is running
# Access management UI at http://localhost:15672 (guest/guest)
```

### 5. Start Services

```bash
# Terminal 1: Start payments-service
yarn start:dev payments-service

# Terminal 2: Start identity-service (for event testing)
yarn start:dev identity-service

# Terminal 3: Start outbox processor (for event publishing)
yarn start:dev outbox-processor
```

---

## Manual API Testing

### Using Swagger UI

1. Navigate to http://localhost:3001/api
2. Explore all available endpoints
3. Test directly from the browser

### Using Postman/REST Client

Create a collection with these requests:

#### 1. Create Stripe Customer

**Endpoint**: `POST http://localhost:3001/stripe/customers`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "userId": "user_123",
  "email": "test@example.com",
  "name": "Test User",
  "phone": "+1234567890"
}
```

**Expected Response**:
```json
{
  "stripeCustomerId": "cus_xxxxx",
  "email": "test@example.com",
  "name": "Test User"
}
```

**Verification**:
- Check Stripe Dashboard > Customers
- Check identity-service logs for event handling
- Query identity-service database to verify `stripeCustomerId` was updated

---

#### 2. Create Payment Intent

**Endpoint**: `POST http://localhost:3001/stripe/payment-intents`

**Body**:
```json
{
  "userId": "user_123",
  "amount": 99.99,
  "currency": "usd",
  "stripeCustomerId": "cus_xxxxx",
  "orderId": "order_456",
  "description": "Test payment for order #456",
  "metadata": {
    "productId": "prod_123",
    "quantity": 2
  }
}
```

**Expected Response**:
```json
{
  "transactionId": "txn_xxxxx",
  "paymentIntentId": "pi_xxxxx",
  "clientSecret": "pi_xxxxx_secret_xxxxx",
  "amount": 99.99,
  "currency": "usd",
  "status": "requires_payment_method"
}
```

**Verification**:
- Check Stripe Dashboard > Payments
- Check `payment_transactions` table in database
- Check `outbox_messages` table for event
- Check payments-service logs

---

#### 3. Confirm Payment Intent

**Endpoint**: `POST http://localhost:3001/stripe/payment-intents/confirm`

**Body**:
```json
{
  "paymentIntentId": "pi_xxxxx",
  "paymentMethodId": "pm_card_visa"
}
```

**Test Cards** (Use these Stripe test cards):
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
```

**Expected Response**:
```json
{
  "transactionId": "txn_xxxxx",
  "paymentIntentId": "pi_xxxxx",
  "status": "succeeded",
  "amount": 99.99,
  "currency": "usd"
}
```

---

#### 4. Attach Payment Method

**Endpoint**: `POST http://localhost:3001/stripe/payment-methods/attach`

**Body**:
```json
{
  "userId": "user_123",
  "paymentMethodId": "pm_card_visa",
  "stripeCustomerId": "cus_xxxxx"
}
```

**Expected Response**:
```json
{
  "id": "pm_xxxxx",
  "userId": "user_123",
  "type": "card",
  "lastFour": "4242",
  "brand": "visa",
  "expiryMonth": 12,
  "expiryYear": 2025
}
```

---

#### 5. Create Refund

**Endpoint**: `POST http://localhost:3001/stripe/refunds`

**Body**:
```json
{
  "transactionId": "txn_xxxxx",
  "paymentIntentId": "pi_xxxxx",
  "amount": 99.99,
  "reason": "requested_by_customer",
  "metadata": {
    "refundedBy": "admin_123"
  }
}
```

**Expected Response**:
```json
{
  "transactionId": "txn_xxxxx",
  "status": "refunded",
  "refundAmount": 99.99
}
```

---

### CURL Examples

```bash
# Create Customer
curl -X POST http://localhost:3001/stripe/customers \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "email": "test@example.com",
    "name": "Test User"
  }'

# Create Payment Intent
curl -X POST http://localhost:3001/stripe/payment-intents \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "amount": 99.99,
    "currency": "usd",
    "stripeCustomerId": "cus_xxxxx"
  }'

# Confirm Payment
curl -X POST http://localhost:3001/stripe/payment-intents/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_xxxxx",
    "paymentMethodId": "pm_card_visa"
  }'
```

---

## Webhook Testing

### Method 1: Stripe CLI (Recommended)

#### 1. Forward Webhooks to Local Server

```bash
# Forward webhooks to your local payments-service
stripe listen --forward-to localhost:3001/stripe/webhooks

# Output will show:
# > Ready! Your webhook signing secret is whsec_xxxxx
# Copy this secret to your .env.local as STRIPE_WEBHOOK_SECRET
```

#### 2. Trigger Test Webhooks

Open a new terminal and trigger test events:

```bash
# Test payment_intent.succeeded
stripe trigger payment_intent.succeeded

# Test payment_intent.payment_failed
stripe trigger payment_intent.payment_failed

# Test charge.refunded
stripe trigger charge.refunded

# Test customer.created
stripe trigger customer.created

# Test payment_method.attached
stripe trigger payment_method.attached
```

#### 3. Verify Webhook Processing

Check logs in your payments-service terminal:
```
[StripeWebhookController] Received Stripe webhook event
[StripeWebhookController] Processing webhook event: payment_intent.succeeded, ID: evt_xxxxx
[StripeWebhookController] Transaction updated to SUCCEEDED: txn_xxxxx
```

### Method 2: Stripe Dashboard

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. URL: `http://localhost:3001/stripe/webhooks`
4. Select events to listen to
5. Click "Send test webhook"

### Method 3: Manual Webhook Simulation

```bash
# Create a test webhook payload
curl -X POST http://localhost:3001/stripe/webhooks \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test_signature" \
  -d @webhook-payload.json
```

**webhook-payload.json**:
```json
{
  "id": "evt_test_webhook",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxxxx",
      "amount": 9999,
      "currency": "usd",
      "status": "succeeded"
    }
  }
}
```

---

## Event-Driven Flow Testing

### Test Complete Payment Flow with Events

#### Setup

1. Ensure all services are running:
   - payments-service
   - identity-service
   - outbox-processor

2. Enable debug logging to see event flow

#### Test Flow 1: Customer Creation Event

```bash
# Step 1: Create customer
curl -X POST http://localhost:3001/stripe/customers \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_test_001",
    "email": "eventtest@example.com",
    "name": "Event Test User"
  }'

# Step 2: Check outbox table
# Query: SELECT * FROM outbox_messages WHERE aggregate_id = 'user_test_001' ORDER BY created_at DESC;

# Step 3: Wait for outbox processor (processes every 5 seconds)
# Watch logs for: [OutboxProcessor] Processing 1 outbox messages

# Step 4: Check RabbitMQ Management UI
# http://localhost:15672 -> Queues -> identity-service.stripe-customer-created
# Should show message was delivered

# Step 5: Check identity-service logs
# Should see: [StripeCustomerCreatedEventHandler] Received StripeCustomerCreatedEvent for user: user_test_001
# Should see: [StripeCustomerCreatedEventHandler] User user_test_001 updated with Stripe customer ID: cus_xxxxx

# Step 6: Verify database
# Query identity-service database:
# SELECT id, email, stripe_customer_id FROM users WHERE id = 'user_test_001';
```

#### Test Flow 2: Payment Success Event

```bash
# Step 1: Create payment intent
PAYMENT_RESPONSE=$(curl -X POST http://localhost:3001/stripe/payment-intents \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_test_001",
    "amount": 50.00,
    "currency": "usd",
    "stripeCustomerId": "cus_xxxxx",
    "orderId": "order_test_001"
  }')

echo $PAYMENT_RESPONSE

# Extract paymentIntentId from response
# PAYMENT_INTENT_ID="pi_xxxxx"

# Step 2: Trigger webhook with Stripe CLI
stripe trigger payment_intent.succeeded

# OR manually confirm payment
curl -X POST http://localhost:3001/stripe/payment-intents/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "'"$PAYMENT_INTENT_ID"'",
    "paymentMethodId": "pm_card_visa"
  }'

# Step 3: Check webhook processing logs
# Should see: [StripeWebhookController] Payment intent succeeded: pi_xxxxx
# Should see: [StripeWebhookController] Transaction updated to SUCCEEDED: txn_xxxxx

# Step 4: Check outbox for PaymentSucceeded event
# Query: SELECT * FROM outbox_messages WHERE event_type = 'PaymentSucceeded' ORDER BY created_at DESC LIMIT 1;

# Step 5: Create consumer in another service to test
# Example: orders-service should receive payment.succeeded event
```

#### Test Flow 3: Payment Failure Event

```bash
# Use a test card that will fail
curl -X POST http://localhost:3001/stripe/payment-intents/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_xxxxx",
    "paymentMethodId": "pm_card_chargeDeclined"
  }'

# Or trigger webhook
stripe trigger payment_intent.payment_failed

# Verify PaymentFailed event in outbox
```

### Monitor Event Flow

#### Check Outbox Messages

```sql
-- All outbox messages
SELECT
  id,
  aggregate_type,
  aggregate_id,
  event_type,
  exchange,
  routing_key,
  processed,
  processed_at,
  created_at
FROM outbox_messages
ORDER BY created_at DESC
LIMIT 10;

-- Pending messages
SELECT * FROM outbox_messages WHERE processed = false;

-- Failed messages
SELECT * FROM outbox_messages WHERE processed = false AND retry_count > 3;
```

#### Check RabbitMQ

```bash
# List queues
docker exec rabbitmq rabbitmqctl list_queues

# List exchanges
docker exec rabbitmq rabbitmqctl list_exchanges

# List bindings
docker exec rabbitmq rabbitmqctl list_bindings
```

Or use Management UI: http://localhost:15672

---

## Automated Testing

### Unit Tests

Create test file: `apps/payments-service/src/application/commands/stripe/handlers/__tests__/CreateStripeCustomer.command.handler.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CreateStripeCustomerHandler } from '../CreateStripeCustomer.command.handler';
import { StripeService } from '../../../../../infrastructure/services/stripe.service';
import { OutboxService } from '@app/outbox';
import { CreateStripeCustomerCommand } from '../../CreateStripeCustomer.command';

describe('CreateStripeCustomerHandler', () => {
  let handler: CreateStripeCustomerHandler;
  let stripeService: jest.Mocked<StripeService>;
  let outboxService: jest.Mocked<OutboxService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateStripeCustomerHandler,
        {
          provide: StripeService,
          useValue: {
            createCustomer: jest.fn(),
          },
        },
        {
          provide: OutboxService,
          useValue: {
            createOutboxMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateStripeCustomerHandler>(CreateStripeCustomerHandler);
    stripeService = module.get(StripeService);
    outboxService = module.get(OutboxService);
  });

  it('should create Stripe customer and publish event', async () => {
    const mockCustomer = {
      id: 'cus_test123',
      email: 'test@example.com',
      name: 'Test User',
    };

    stripeService.createCustomer.mockResolvedValue(mockCustomer as any);

    const command = new CreateStripeCustomerCommand({
      userId: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
    });

    const result = await handler.execute(command);

    expect(result.stripeCustomerId).toBe('cus_test123');
    expect(stripeService.createCustomer).toHaveBeenCalledWith(
      'test@example.com',
      'Test User',
      undefined,
      expect.any(Object),
    );
    expect(outboxService.createOutboxMessage).toHaveBeenCalled();
  });

  it('should handle Stripe API errors', async () => {
    stripeService.createCustomer.mockRejectedValue(
      new Error('Stripe API error'),
    );

    const command = new CreateStripeCustomerCommand({
      userId: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
    });

    await expect(handler.execute(command)).rejects.toThrow('Stripe API error');
  });
});
```

Run tests:
```bash
yarn test CreateStripeCustomer.command.handler
```

### Integration Tests

Create test file: `apps/payments-service/test/stripe-integration.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PaymentsServiceModule } from '../src/app.module';

describe('Stripe Integration (e2e)', () => {
  let app: INestApplication;
  let createdCustomerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PaymentsServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/stripe/customers (POST)', () => {
    it('should create a Stripe customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/stripe/customers')
        .send({
          userId: 'user_e2e_test',
          email: 'e2e@test.com',
          name: 'E2E Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('stripeCustomerId');
      expect(response.body.email).toBe('e2e@test.com');

      createdCustomerId = response.body.stripeCustomerId;
    });
  });

  describe('/stripe/payment-intents (POST)', () => {
    it('should create a payment intent', async () => {
      const response = await request(app.getHttpServer())
        .post('/stripe/payment-intents')
        .send({
          userId: 'user_e2e_test',
          amount: 99.99,
          currency: 'usd',
          stripeCustomerId: createdCustomerId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('paymentIntentId');
      expect(response.body).toHaveProperty('clientSecret');
      expect(response.body.amount).toBe(99.99);
    });
  });
});
```

Run integration tests:
```bash
yarn test:e2e
```

---

## Common Test Scenarios

### Scenario 1: Complete Payment Flow

```bash
# 1. Create user in identity-service (if not exists)
# 2. Create Stripe customer
# 3. Create payment intent
# 4. Attach payment method
# 5. Confirm payment
# 6. Verify transaction status
# 7. Verify events published
```

### Scenario 2: Failed Payment Handling

```bash
# Use test card: 4000 0000 0000 0002 (decline)
# Verify payment fails
# Verify PaymentFailed event published
# Verify transaction status updated to FAILED
```

### Scenario 3: Refund Flow

```bash
# 1. Create successful payment
# 2. Create refund
# 3. Verify refund in Stripe
# 4. Verify transaction status
# 5. Verify PaymentRefunded event
```

### Scenario 4: Webhook Retry Logic

```bash
# 1. Stop identity-service
# 2. Create customer (event will fail to process)
# 3. Check RabbitMQ DLQ
# 4. Restart identity-service
# 5. Requeue message
# 6. Verify processing
```

### Scenario 5: Idempotency Testing

```bash
# 1. Create payment intent
# 2. Send same webhook event twice
# 3. Verify transaction updated only once
# 4. Verify no duplicate events
```

---

## Test Data

### Test Credit Cards

```
Success:
- 4242 4242 4242 4242 (Visa)
- 5555 5555 5555 4444 (Mastercard)
- 3782 822463 10005 (Amex)

Decline:
- 4000 0000 0000 0002

Insufficient Funds:
- 4000 0000 0000 9995

Expired Card:
- 4000 0000 0000 0069

Processing Error:
- 4000 0000 0000 0119

CVC Check Fails:
- 4000 0000 0000 0127
```

Use any future expiry date and any 3-digit CVC for Visa/Mastercard or 4-digit for Amex.

### Test Amounts

```
Minimum charge: $0.50
Maximum charge: No limit in test mode
Amounts ending in 00: Usually succeed
Amounts ending in 02: Usually decline
```

---

## Troubleshooting

### Issue: Webhook signature verification fails

**Solution**:
1. Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
2. Use `stripe listen --forward-to` to get correct secret
3. Check webhook secret in Stripe Dashboard matches env variable

### Issue: Events not being processed

**Solution**:
1. Check outbox-processor is running
2. Verify RabbitMQ is connected
3. Check outbox_messages table for pending messages
4. Verify AppRabbitMQModule imported in consumer service

### Issue: Database constraint violations

**Solution**:
1. Ensure user exists in identity-service before creating customer
2. Check foreign key relationships
3. Verify transaction IDs are unique

### Issue: Stripe API errors

**Solution**:
1. Verify STRIPE_API_KEY is correct and starts with `sk_test_`
2. Check Stripe API status: https://status.stripe.com
3. Review Stripe Dashboard > Developers > Logs
4. Check rate limits

### Issue: Payment methods not attaching

**Solution**:
1. Ensure customer exists first
2. Use valid test payment method ID
3. Check payment method type matches

---

## Testing Checklist

### Before Testing
- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] All services started
- [ ] RabbitMQ running and accessible
- [ ] Stripe CLI installed and logged in

### API Endpoints
- [ ] Create Stripe customer
- [ ] Create payment intent
- [ ] Confirm payment intent
- [ ] Attach payment method
- [ ] Create refund

### Webhooks
- [ ] payment_intent.succeeded
- [ ] payment_intent.payment_failed
- [ ] payment_intent.canceled
- [ ] charge.refunded
- [ ] customer.created
- [ ] payment_method.attached

### Event-Driven Flows
- [ ] StripeCustomerCreated event
- [ ] PaymentIntentCreated event
- [ ] PaymentSucceeded event
- [ ] PaymentFailed event
- [ ] PaymentRefunded event
- [ ] PaymentMethodAttached event

### Database Verification
- [ ] payment_transactions table updated
- [ ] payment_methods table populated
- [ ] outbox_messages created
- [ ] identity-service users.stripe_customer_id updated

### Error Handling
- [ ] Invalid API key
- [ ] Invalid payment method
- [ ] Declined card
- [ ] Insufficient funds
- [ ] Webhook signature mismatch
- [ ] Duplicate webhook events

---

## Performance Testing

### Load Test with Artillery

Install Artillery:
```bash
npm install -g artillery
```

Create `artillery-test.yml`:
```yaml
config:
  target: "http://localhost:3001"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"

scenarios:
  - name: "Create payment intent"
    flow:
      - post:
          url: "/stripe/payment-intents"
          json:
            userId: "user_load_test"
            amount: 99.99
            currency: "usd"
            stripeCustomerId: "cus_test"
```

Run load test:
```bash
artillery run artillery-test.yml
```

---

## Monitoring During Testing

### Watch Logs

```bash
# Payment service logs
tail -f logs/payments-service.log

# Identity service logs
tail -f logs/identity-service.log

# Outbox processor logs
tail -f logs/outbox-processor.log
```

### Monitor RabbitMQ

Access http://localhost:15672 to monitor:
- Queue depths
- Message rates
- Consumer connections
- Failed messages in DLQ

### Monitor Database

```sql
-- Active transactions
SELECT COUNT(*) FROM payment_transactions WHERE created_at > NOW() - INTERVAL '1 hour';

-- Pending outbox messages
SELECT COUNT(*) FROM outbox_messages WHERE processed = false;

-- Recent events by type
SELECT event_type, COUNT(*)
FROM outbox_messages
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY event_type;
```

---

## Next Steps

After testing, consider:
1. Setting up CI/CD pipelines with automated tests
2. Implementing monitoring and alerting
3. Creating staging environment for pre-production testing
4. Setting up error tracking (Sentry, etc.)
5. Implementing rate limiting
6. Adding payment analytics dashboard

---

## Additional Resources

- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
