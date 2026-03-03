# Payment Service Quick Start Guide

Quick reference for testing the Stripe payment integration.

## 🚀 Quick Setup (5 minutes)

### 1. Environment Variables

```bash
# Copy and update with your Stripe test keys
cp apps/payments-service/.env.example apps/payments-service/.env.local
```

Required variables:
```env
STRIPE_API_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
RABBITMQ_URI=amqp://guest:guest@localhost:5672
```

### 2. Start Services

```bash
# Terminal 1: Payments Service
yarn start:dev payments-service

# Terminal 2: Identity Service
yarn start:dev identity-service

# Terminal 3: Outbox Processor
yarn start:dev outbox-processor

# Terminal 4: Stripe Webhooks (Optional)
stripe listen --forward-to localhost:3001/stripe/webhooks
```

### 3. Open Swagger UI

Navigate to: http://localhost:3001/api

---

## 🧪 Test Stripe Test Cards

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Declined |
| `4000 0000 0000 9995` | ❌ Insufficient Funds |

Use any future expiry (e.g., 12/25) and any CVC (e.g., 123).

---

## 📝 Quick Test Flow

### Option 1: Using Swagger UI (Easiest)

1. Go to http://localhost:3001/api
2. Click **POST /stripe/customers** → Try it out
3. Paste JSON body → Execute
4. Copy `stripeCustomerId` from response
5. Click **POST /stripe/payment-intents** → Try it out
6. Paste JSON with `stripeCustomerId` → Execute
7. Copy `paymentIntentId` from response
8. Click **POST /stripe/payment-intents/confirm** → Try it out
9. Paste JSON with `paymentIntentId` → Execute
10. Done! Check your database and logs

### Option 2: Using VS Code REST Client

1. Open `apps/payments-service/test-requests.http`
2. Install REST Client extension
3. Click "Send Request" above each request
4. Follow the flow from top to bottom

### Option 3: Using curl (Terminal)

```bash
# 1. Create Customer
curl -X POST http://localhost:3001/stripe/customers \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","email":"test@example.com","name":"Test User"}'

# Copy stripeCustomerId from response

# 2. Create Payment Intent
curl -X POST http://localhost:3001/stripe/payment-intents \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","amount":99.99,"currency":"usd","stripeCustomerId":"cus_xxxxx"}'

# Copy paymentIntentId from response

# 3. Confirm Payment
curl -X POST http://localhost:3001/stripe/payment-intents/confirm \
  -H "Content-Type: application/json" \
  -d '{"paymentIntentId":"pi_xxxxx","paymentMethodId":"pm_card_visa"}'
```

---

## 🔍 Verify Results

### Check Database

```sql
-- View recent transactions
SELECT id, user_id, amount, currency, status, created_at
FROM payment_transactions
ORDER BY created_at DESC
LIMIT 5;

-- Check outbox messages
SELECT event_type, processed, created_at
FROM outbox_messages
ORDER BY created_at DESC
LIMIT 5;

-- Verify customer ID synced to identity service
SELECT id, email, stripe_customer_id
FROM users
WHERE stripe_customer_id IS NOT NULL
LIMIT 5;
```

### Check Logs

```bash
# Payment service
grep "Payment intent" logs/payments-service.log | tail -n 20

# Identity service (event handling)
grep "StripeCustomerCreated" logs/identity-service.log | tail -n 10

# Outbox processor
grep "Processing outbox" logs/outbox-processor.log | tail -n 10
```

### Check RabbitMQ

Open http://localhost:15672 (guest/guest)
- **Exchanges**: Look for `payment.events.exchange`
- **Queues**: Look for `identity-service.stripe-customer-created`
- **Message rates**: Should show messages flowing

### Check Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/payments
2. You should see your test payments
3. Click on any payment to see details

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Webhook signature verification failed"

```bash
# Run this and copy the secret to .env.local
stripe listen --forward-to localhost:3001/stripe/webhooks
# Output: > Your webhook signing secret is whsec_xxxxx
```

### Issue: "Events not being processed"

```bash
# Check if outbox processor is running
ps aux | grep outbox-processor

# Restart it
yarn start:dev outbox-processor
```

### Issue: "RabbitMQ connection refused"

```bash
# Start RabbitMQ with Docker
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Or restart existing container
docker restart rabbitmq
```

### Issue: "Customer ID not syncing to users table"

1. Check identity-service is running
2. Check RabbitMQ connection in identity-service logs
3. Verify `AppRabbitMQModule` is imported in identity-service
4. Check outbox_messages table - is event processed?

---

## 📋 API Endpoints Cheat Sheet

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/stripe/customers` | Create Stripe customer |
| POST | `/stripe/payment-intents` | Create payment intent |
| POST | `/stripe/payment-intents/confirm` | Confirm payment |
| POST | `/stripe/payment-methods/attach` | Attach payment method |
| POST | `/stripe/refunds` | Create refund |
| POST | `/stripe/webhooks` | Stripe webhook endpoint |

---

## 🎯 Test Scenarios

### ✅ Scenario 1: Successful Payment (2 min)

```bash
# Create customer → Create payment → Confirm with success card
# Expected: Transaction status = SUCCEEDED, event published
```

### ❌ Scenario 2: Failed Payment (2 min)

```bash
# Create customer → Create payment → Confirm with decline card (4000 0000 0000 0002)
# Expected: Transaction status = FAILED, PaymentFailed event published
```

### 💰 Scenario 3: Refund (3 min)

```bash
# Complete successful payment → Create refund
# Expected: Transaction status = REFUNDED, PaymentRefunded event published
```

### 🔄 Scenario 4: Event Flow (5 min)

```bash
# Create customer → Wait 5 sec → Check identity-service DB for stripe_customer_id
# Expected: User record updated with Stripe customer ID
```

---

## 🔧 Useful Commands

### Stripe CLI

```bash
# Trigger test webhooks
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded

# View recent events
stripe events list --limit 10

# View customers
stripe customers list --limit 10

# View payment intents
stripe payment_intents list --limit 10
```

### Database Queries

```bash
# Connect to payment service database
psql -h localhost -U postgres -d artium_payments

# Connect to identity service database
psql -h localhost -U postgres -d artium_identity
```

### Docker Commands

```bash
# View running containers
docker ps

# View RabbitMQ logs
docker logs rabbitmq -f

# Restart RabbitMQ
docker restart rabbitmq

# Clean up test data
docker exec -it postgres psql -U postgres -d artium_payments -c "TRUNCATE payment_transactions CASCADE;"
```

---

## 📊 What to Monitor During Testing

### Logs to Watch

```bash
# In separate terminals
tail -f logs/payments-service.log
tail -f logs/identity-service.log
tail -f logs/outbox-processor.log
```

### Success Indicators

✅ Logs show:
- `[StripeService] Creating payment intent for user...`
- `[StripeWebhookController] Processing webhook event: payment_intent.succeeded`
- `[OutboxProcessor] Processing X outbox messages`
- `[StripeCustomerCreatedEventHandler] User updated with Stripe customer ID`

✅ Database shows:
- New rows in `payment_transactions`
- Processed rows in `outbox_messages`
- Updated `stripe_customer_id` in identity service

✅ RabbitMQ shows:
- Messages delivered to queues
- No messages stuck in DLQ

---

## 🆘 Emergency Troubleshooting

### Nuclear Option: Reset Everything

```bash
# Stop all services
pkill -f "nest start"

# Clear databases
psql -U postgres -c "DROP DATABASE artium_payments; CREATE DATABASE artium_payments;"
psql -U postgres -c "DROP DATABASE artium_identity; CREATE DATABASE artium_identity;"

# Restart RabbitMQ
docker restart rabbitmq

# Restart services
yarn start:dev payments-service
yarn start:dev identity-service
yarn start:dev outbox-processor
```

---

## 📚 Documentation Links

- **Full Testing Guide**: [PAYMENT_TESTING_GUIDE.md](./PAYMENT_TESTING_GUIDE.md)
- **Event Documentation**: [PAYMENT_EVENTS.md](./PAYMENT_EVENTS.md)
- **Integration Guide**: [STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md)
- **Stripe Docs**: https://stripe.com/docs/testing

---

## 🎓 Learning Path

1. ✅ **Start here**: Complete one successful payment using Swagger UI
2. ✅ Test a failed payment with decline card
3. ✅ Test webhook using Stripe CLI
4. ✅ Verify event flow to identity-service
5. ✅ Test refund functionality
6. ✅ Run automated tests
7. ✅ Load test with Artillery

---

## ⚡ Pro Tips

- Use Swagger UI for quick manual testing
- Use Stripe CLI for webhook testing (easier than manual setup)
- Check outbox_messages table when debugging events
- Use `stripe events list` to see what Stripe is sending
- Keep RabbitMQ Management UI open to monitor message flow
- Run `stripe listen` in a dedicated terminal during development
- Use VS Code REST Client extension for repeatable API tests

---

## 🎉 You're Ready!

Your payment service is now ready to test. Start with the Quick Test Flow above and explore from there.

**Need help?** Check the full testing guide: [PAYMENT_TESTING_GUIDE.md](./PAYMENT_TESTING_GUIDE.md)
