# Stripe Integration Documentation

## Overview

This payments service integrates Stripe for payment processing, customer management, and refund handling. The implementation follows Clean Architecture principles with CQRS pattern.

## Architecture

### Layers

1. **Domain Layer** (`src/domain/`)
   - DTOs with validation and Swagger decorators
   - Entity interfaces
   - Repository interfaces

2. **Application Layer** (`src/application/`)
   - Commands and Command Handlers
   - Business logic orchestration

3. **Infrastructure Layer** (`src/infrastructure/`)
   - StripeService - wrapper for Stripe SDK
   - Repository implementations

4. **Presentation Layer** (`src/presentation/`)
   - REST Controllers with Swagger documentation
   - Webhook endpoints

## Environment Configuration

Create `.env.local` file in `apps/payments-service/` with:

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

### Getting Stripe Keys

1. **API Key**:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy the "Secret key" (starts with `sk_test_`)

2. **Webhook Secret**:
   - Go to https://dashboard.stripe.com/test/webhooks
   - Create endpoint pointing to: `http://your-domain/stripe/webhooks`
   - Copy the "Signing secret" (starts with `whsec_`)

## API Endpoints

### Payment Intents

#### Create Payment Intent
```http
POST /stripe/payment-intents
Content-Type: application/json

{
  "amount": 99.99,
  "currency": "usd",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "sellerId": "123e4567-e89b-12d3-a456-426614174001",
  "orderId": "123e4567-e89b-12d3-a456-426614174002",
  "description": "Payment for artwork purchase",
  "metadata": {
    "artworkId": "art_123"
  }
}
```

**Response**: PaymentTransaction entity with `stripePaymentIntentId`

#### Confirm Payment Intent
```http
POST /stripe/payment-intents/confirm
Content-Type: application/json

{
  "paymentIntentId": "pi_1234567890",
  "stripePaymentMethodId": "pm_1234567890"
}
```

### Customer Management

#### Create Customer
```http
POST /stripe/customers
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "metadata": {
    "userType": "collector"
  }
}
```

**Response**:
```json
{
  "stripeCustomerId": "cus_1234567890",
  "email": "john.doe@example.com",
  "name": "John Doe"
}
```

### Refunds

#### Create Refund
```http
POST /stripe/refunds
Content-Type: application/json

{
  "paymentIntentId": "pi_1234567890",
  "transactionId": "123e4567-e89b-12d3-a456-426614174000",
  "amount": 50.00,
  "reason": "requested_by_customer",
  "metadata": {
    "ticketId": "SUP-12345"
  }
}
```

**Response**: Updated PaymentTransaction with refund details

### Payment Methods

#### Attach Payment Method
```http
POST /stripe/payment-methods/attach
Content-Type: application/json

{
  "paymentMethodId": "pm_1234567890",
  "stripeCustomerId": "cus_1234567890",
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response**: PaymentMethod entity

### Webhooks

Stripe webhooks are handled at:
```
POST /stripe/webhooks
```

**Supported Events**:
- `payment_intent.succeeded` - Updates transaction to SUCCEEDED
- `payment_intent.payment_failed` - Updates transaction to FAILED
- `payment_intent.canceled` - Updates transaction to CANCELLED
- `charge.refunded` - Updates transaction to REFUNDED/PARTIALLY_REFUNDED
- `customer.created` - Logged
- `payment_method.attached` - Logged

## Swagger Documentation

Access interactive API documentation at:
```
http://localhost:3005/api
```

## Database Schema

### PaymentTransaction Entity

Key Stripe-related fields:
- `stripePaymentIntentId` - Stripe Payment Intent ID
- `stripeChargeId` - Stripe Charge ID
- `status` - Transaction status (PENDING, PROCESSING, SUCCEEDED, FAILED, etc.)
- `amount` - Payment amount
- `currency` - Currency code
- `platformFee` - Calculated platform fee (5%)
- `netAmount` - Amount after platform fee
- `metadata` - Additional data as JSONB 

### PaymentMethod Entity

Key Stripe-related fields:
- `stripePaymentMethodId` - Stripe Payment Method ID
- `type` - CARD, BANK_ACCOUNT, PAYPAL_ACCOUNT
- `provider` - STRIPE, PAYPAL
- `lastFour` - Last 4 digits
- `brand` - Card brand (Visa, Mastercard, etc.)
- `expiryMonth`, `expiryYear` - Card expiration

## Testing

### Test Mode

Use Stripe test keys (starting with `sk_test_`) for development.

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Auth: 4000 0025 0000 3155

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Testing Webhooks Locally

1. Install Stripe CLI:
   ```bash
   stripe login
   ```

2. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3005/stripe/webhooks
   ```

3. Trigger events:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common error codes:
- `400` - Invalid input data
- `404` - Resource not found
- `500` - Internal server error (Stripe API error)

## Security

1. **API Keys**: Never commit real Stripe keys to version control
2. **Webhook Signatures**: Always verify webhook signatures
3. **HTTPS**: Use HTTPS in production for webhook endpoints
4. **Idempotency**: Stripe automatically handles idempotency with request IDs
5. **Amount Validation**: Amounts are validated before processing

## Logging

All operations are logged with:
- Request ID for tracing
- Operation type
- User/transaction identifiers
- Success/failure status

Example log:
```
[StripeController] [ReqID: abc-123] - Creating payment intent for user: user-123
[StripeController] [ReqID: abc-123] - Payment intent created successfully: pi_123
```

## Platform Fee

Default platform fee is 5% of transaction amount:
```typescript
platformFee = amount * 0.05
netAmount = amount - platformFee
```

To modify, update `CreateStripePaymentIntentHandler`.

## Future Enhancements

Potential additions:
- Subscription management
- Payment Links
- Product catalog
- Payout automation
- Dispute handling
- Invoice generation
- Multi-currency support
- Fraud detection
- Analytics dashboard

## Support Resources

- Stripe API Docs: https://stripe.com/docs/api
- Stripe Testing: https://stripe.com/docs/testing
- Stripe CLI: https://stripe.com/docs/stripe-cli
- NestJS: https://docs.nestjs.com
