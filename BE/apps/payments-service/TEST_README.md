# Payment Service Testing

Complete testing resources for the Stripe payment integration.

## 📚 Documentation

1. **[PAYMENT_QUICK_START.md](../../PAYMENT_QUICK_START.md)** - Start here! Quick 5-minute setup guide
2. **[PAYMENT_TESTING_GUIDE.md](../../PAYMENT_TESTING_GUIDE.md)** - Comprehensive testing documentation
3. **[PAYMENT_EVENTS.md](../../PAYMENT_EVENTS.md)** - Event-driven architecture documentation
4. **[STRIPE_INTEGRATION.md](../../STRIPE_INTEGRATION.md)** - Full Stripe integration guide

## 🚀 Quick Test Methods

### Method 1: Automated Test Script (Easiest)

**Windows (PowerShell)**:
```powershell
cd apps/payments-service
./test-payment-flow.ps1
```

**Mac/Linux (Bash)**:
```bash
cd apps/payments-service
chmod +x test-payment-flow.sh
./test-payment-flow.sh
```

This script will:
- ✅ Create a Stripe customer
- ✅ Create a payment intent
- ✅ Confirm the payment
- ✅ Optionally test refund flow
- ✅ Display results and verification commands

### Method 2: Interactive Swagger UI

1. Start the service: `yarn start:dev payments-service`
2. Open browser: http://localhost:3001/api
3. Test each endpoint interactively

### Method 3: VS Code REST Client

1. Install the "REST Client" extension in VS Code
2. Open `apps/payments-service/test-requests.http`
3. Click "Send Request" above each HTTP request

### Method 4: Manual curl Commands

See [PAYMENT_QUICK_START.md](../../PAYMENT_QUICK_START.md) for curl examples.

## 🧪 Test Files

| File | Purpose |
|------|---------|
| `test-payment-flow.ps1` | PowerShell automated test script (Windows) |
| `test-payment-flow.sh` | Bash automated test script (Mac/Linux) |
| `test-requests.http` | REST Client test collection for VS Code |

## 📋 Before You Start

### 1. Environment Setup

Ensure you have configured:

```env
# apps/payments-service/.env.local
STRIPE_API_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
RABBITMQ_URI=amqp://guest:guest@localhost:5672
DB_HOST=localhost
DB_PORT=5432
DB_NAME=artium_payments
```

### 2. Required Services Running

Start these in separate terminals:

```bash
# Terminal 1: Payments Service
yarn start:dev payments-service

# Terminal 2: Identity Service (for event testing)
yarn start:dev identity-service

# Terminal 3: Outbox Processor (for event publishing)
yarn start:dev outbox-processor
```

### 3. Optional: Stripe CLI for Webhooks

```bash
# Terminal 4: Forward webhooks to local server
stripe listen --forward-to localhost:3001/stripe/webhooks
```

## 🎯 Quick Test Scenarios

### Scenario 1: Successful Payment (2 minutes)

```bash
# Using PowerShell script
./test-payment-flow.ps1

# Or using curl
curl -X POST http://localhost:3001/stripe/customers \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","email":"test@example.com","name":"Test User"}'

# Copy stripeCustomerId, then:
curl -X POST http://localhost:3001/stripe/payment-intents \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","amount":99.99,"currency":"usd","stripeCustomerId":"cus_xxxxx"}'

# Copy paymentIntentId, then:
curl -X POST http://localhost:3001/stripe/payment-intents/confirm \
  -H "Content-Type: application/json" \
  -d '{"paymentIntentId":"pi_xxxxx","paymentMethodId":"pm_card_visa"}'
```

**Expected Result**:
- Payment status = `succeeded`
- Transaction in database with status `SUCCEEDED`
- `PaymentSucceeded` event in outbox
- User's `stripe_customer_id` updated in identity-service

### Scenario 2: Failed Payment (2 minutes)

Use the decline test card: `pm_card_chargeDeclined`

**Expected Result**:
- Payment status = `requires_payment_method`
- Transaction status = `FAILED`
- `PaymentFailed` event in outbox

### Scenario 3: Refund (3 minutes)

After successful payment:

```bash
curl -X POST http://localhost:3001/stripe/refunds \
  -H "Content-Type: application/json" \
  -d '{"transactionId":"txn_xxxxx","paymentIntentId":"pi_xxxxx","reason":"requested_by_customer"}'
```

**Expected Result**:
- Transaction status = `REFUNDED`
- `PaymentRefunded` event in outbox

## 🔍 Verification Checklist

After running tests, verify:

### ✅ Database (Payment Service)

```sql
-- Check transactions
SELECT id, user_id, amount, status, created_at
FROM payment_transactions
ORDER BY created_at DESC LIMIT 5;

-- Check outbox events
SELECT event_type, processed, created_at
FROM outbox_messages
ORDER BY created_at DESC LIMIT 10;
```

### ✅ Database (Identity Service)

```sql
-- Check user Stripe customer ID
SELECT id, email, stripe_customer_id
FROM users
WHERE stripe_customer_id IS NOT NULL;
```

### ✅ RabbitMQ

Open http://localhost:15672 (guest/guest)
- Check exchange: `payment.events.exchange`
- Check queues: Messages delivered to consumers
- Check DLQ: Should be empty

### ✅ Stripe Dashboard

Visit https://dashboard.stripe.com/test/payments
- View your test payments
- Check customer records
- Review events

### ✅ Service Logs

```bash
# Payment service
grep "Payment intent" logs/payments-service.log | tail

# Identity service (event handling)
grep "StripeCustomerCreated" logs/identity-service.log | tail

# Outbox processor
grep "Processing outbox" logs/outbox-processor.log | tail
```

## 🐛 Troubleshooting

### Script Fails with Connection Error

**Problem**: Cannot connect to http://localhost:3001

**Solution**:
```bash
# Check if service is running
curl http://localhost:3001/health

# If not running:
yarn start:dev payments-service
```

### Events Not Processing

**Problem**: Outbox messages not being published

**Solution**:
```bash
# Check outbox processor is running
yarn start:dev outbox-processor

# Check RabbitMQ is running
docker ps | grep rabbitmq
```

### Customer ID Not Syncing

**Problem**: `stripe_customer_id` not updating in users table

**Solution**:
1. Verify identity-service is running
2. Check `AppRabbitMQModule` is imported
3. Check RabbitMQ queue exists: `identity-service.stripe-customer-created`
4. Check outbox message was processed

### Webhook Signature Errors

**Problem**: Webhook signature verification failed

**Solution**:
```bash
# Use Stripe CLI to get correct secret
stripe listen --forward-to localhost:3001/stripe/webhooks

# Copy the webhook secret to .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## 📊 Test Data

### Stripe Test Cards

| Card Number | Result | Use Case |
|------------|--------|----------|
| `4242 4242 4242 4242` | ✅ Success | Normal payments |
| `4000 0000 0000 0002` | ❌ Decline | Test payment failures |
| `4000 0000 0000 9995` | ❌ Insufficient Funds | Test specific error |
| `4000 0000 0000 0069` | ❌ Expired Card | Test expired card |

All cards:
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Test Payment Methods

Pre-configured test payment method IDs:
- `pm_card_visa` - Visa success
- `pm_card_mastercard` - Mastercard success
- `pm_card_chargeDeclined` - Declined
- `pm_card_chargeDeclinedInsufficientFunds` - Insufficient funds

## 🎓 Next Steps

After completing basic tests:

1. ✅ Run automated test script
2. ✅ Test all endpoints via Swagger
3. ✅ Test webhook events with Stripe CLI
4. ✅ Verify event flow to identity-service
5. ✅ Run integration tests: `yarn test:e2e`
6. ✅ Test error scenarios
7. ✅ Load test with Artillery

## 📖 Additional Resources

- **Stripe Testing Docs**: https://stripe.com/docs/testing
- **Stripe CLI Docs**: https://stripe.com/docs/stripe-cli
- **API Reference**: http://localhost:3001/api (when running)

## 💡 Pro Tips

- **Use Swagger UI** for quick exploratory testing
- **Use REST Client** for repeatable test sequences
- **Use PowerShell/Bash scripts** for automated end-to-end tests
- **Keep Stripe CLI running** during development for webhook testing
- **Monitor RabbitMQ UI** to watch event flow in real-time
- **Check logs** to understand what's happening behind the scenes

## 🆘 Need Help?

1. Check [PAYMENT_TESTING_GUIDE.md](../../PAYMENT_TESTING_GUIDE.md) for detailed instructions
2. Review [PAYMENT_EVENTS.md](../../PAYMENT_EVENTS.md) for event documentation
3. Check service logs for error messages
4. Verify all environment variables are set correctly
5. Ensure all required services are running

---

**Ready to test?** Start with the PowerShell/Bash script for the easiest experience!

```powershell
# Windows
./test-payment-flow.ps1

# Mac/Linux
./test-payment-flow.sh
```
