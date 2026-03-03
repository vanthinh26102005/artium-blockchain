# Stripe Integration - Quick Start

## Setup

1. **Install dependencies** (already done):
   ```bash
   yarn add stripe @nestjs/swagger -W
   ```

2. **Configure environment variables**:

   Create `apps/payments-service/.env.local`:
   ```env
   PORT=3005

   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=postgres
   DB_NAME=artium_payments

   STRIPE_API_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

   CORS_ORIGIN=*
   ```

3. **Start the service**:
   ```bash
   yarn workspace @backend/payments-service start:dev
   ```

4. **Access API documentation**:
   - Swagger UI: http://localhost:3005/api
   - GraphQL Playground: http://localhost:3005/graphql

## Quick Test

### Create a Payment Intent

```bash
curl -X POST http://localhost:3005/stripe/payment-intents \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "currency": "usd",
    "userId": "user-123",
    "description": "Test payment"
  }'
```

### Create a Customer

```bash
curl -X POST http://localhost:3005/stripe/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userId": "user-123",
    "name": "Test User"
  }'
```

## Features Implemented

### REST API Endpoints
- ✅ `POST /stripe/payment-intents` - Create payment intent
- ✅ `POST /stripe/payment-intents/confirm` - Confirm payment
- ✅ `POST /stripe/customers` - Create customer
- ✅ `POST /stripe/refunds` - Process refund
- ✅ `POST /stripe/payment-methods/attach` - Attach payment method
- ✅ `POST /stripe/webhooks` - Handle Stripe webhooks

### CQRS Commands
- ✅ CreateStripePaymentIntentCommand
- ✅ ConfirmStripePaymentIntentCommand
- ✅ CreateStripeCustomerCommand
- ✅ CreateStripeRefundCommand
- ✅ AttachStripePaymentMethodCommand

### Infrastructure
- ✅ StripeService - Comprehensive Stripe SDK wrapper
- ✅ Webhook verification and event handling
- ✅ Transaction status synchronization
- ✅ Platform fee calculation (5%)

### Database
- ✅ Stripe fields in PaymentTransaction entity
- ✅ Stripe fields in PaymentMethod entity
- ✅ Repository methods for Stripe operations

### Documentation
- ✅ Swagger/OpenAPI integration
- ✅ Request/response DTOs with validation
- ✅ Comprehensive API documentation
- ✅ Integration guide

## Architecture

```
apps/payments-service/src/
├── application/
│   └── commands/
│       └── stripe/
│           ├── CreateStripePaymentIntent.command.ts
│           ├── ConfirmStripePaymentIntent.command.ts
│           ├── CreateStripeCustomer.command.ts
│           ├── CreateStripeRefund.command.ts
│           ├── AttachStripePaymentMethod.command.ts
│           └── handlers/
│               ├── CreateStripePaymentIntent.command.handler.ts
│               ├── ConfirmStripePaymentIntent.command.handler.ts
│               ├── CreateStripeCustomer.command.handler.ts
│               ├── CreateStripeRefund.command.handler.ts
│               └── AttachStripePaymentMethod.command.handler.ts
├── domain/
│   ├── dtos/
│   │   └── stripe/
│   │       ├── create-payment-intent.dto.ts
│   │       ├── confirm-payment-intent.dto.ts
│   │       ├── create-customer.dto.ts
│   │       ├── create-refund.dto.ts
│   │       └── attach-payment-method.dto.ts
│   └── entities/
│       ├── payment-transaction.entity.ts (existing - updated)
│       └── payment-method.entity.ts (existing - updated)
├── infrastructure/
│   ├── services/
│   │   └── stripe.service.ts
│   └── repositories/
│       └── payment-transaction.repository.ts (existing - updated)
└── presentation/
    └── http/
        └── controllers/
            ├── stripe.controller.ts
            └── stripe-webhook.controller.ts
```

## Stripe Test Cards

```
Success:           4242 4242 4242 4242
Decline:           4000 0000 0000 0002
Requires Auth:     4000 0025 0000 3155
Insufficient:      4000 0000 0000 9995

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

## Webhook Testing

### Using Stripe CLI

```bash
stripe listen --forward-to localhost:3005/stripe/webhooks
stripe trigger payment_intent.succeeded
```

### Webhook Events Handled
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.refunded`
- `customer.created`
- `payment_method.attached`

## Next Steps

1. **Set up Stripe account** and get API keys
2. **Configure webhook endpoint** in Stripe Dashboard
3. **Test payment flow** with test cards
4. **Monitor logs** for transaction tracking
5. **Review platform fee** calculation logic

## Support

For detailed documentation, see `STRIPE_INTEGRATION.md`
