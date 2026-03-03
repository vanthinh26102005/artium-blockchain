# Payments Service Entities

This document describes all entities in the payments-service and their relationships.

## Entities Overview

### 1. PaymentTransaction
**Purpose:** Records all payment transactions (orders, invoices, refunds, payouts)

**Fields:**
- `id` (PK) - Unique identifier
- `type` - Transaction type (PAYMENT, REFUND, PAYOUT)
- `status` - Transaction status (PENDING, SUCCEEDED, FAILED)
- `provider` - Payment provider (STRIPE, PAYPAL)
- **Parties:**
  - `userId` - Reference to identity-service User (payer/buyer)
  - `sellerId` - Reference to identity-service SellerProfile (payee/seller)
- **Related Entities:**
  - `orderId` - Reference to orders-service Order
  - `invoiceId` - Reference to Invoice (same service)
- **Amounts:**
  - `amount` - Gross transaction amount
  - `currency` - Currency code (USD, EUR, etc.)
  - `platformFee` - Platform commission
  - `netAmount` - Amount after fees
- **Provider-specific IDs:**
  - `stripePaymentIntentId` - Stripe payment intent ID
  - `stripeChargeId` - Stripe charge ID
  - `paypalOrderId` - PayPal order ID
  - `paypalCaptureId` - PayPal capture ID
- **Payment Method:**
  - `paymentMethodId` - Reference to PaymentMethod (same service)
  - `paymentMethodType` - Type of payment method (card, paypal)
  - `paymentMethodLastFour` - Last 4 digits of card
- **Metadata:**
  - `description` - Transaction description
  - `metadata` - Additional provider data (JSONB)
  - `failureReason` - Human-readable failure reason
  - `failureCode` - Provider error code
- **Refunds:**
  - `refundAmount` - Total refunded
  - `refundReason` - Refund reason
  - `refundedAt` - Refund timestamp
- **Timestamps:**
  - `processedAt` - When processed by provider
  - `completedAt` - When reached final state

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference
- **→ Order** (Cross-service): Via `orderId` UUID reference
- **→ Invoice** (Same-service): Via `invoiceId`
- **→ PaymentMethod** (Same-service): Via `paymentMethodId`

**Indexes:**
- Composite: `(userId, createdAt)`, `(sellerId, createdAt)`, `(status, provider)`
- Single: `orderId`, `invoiceId`

**State Machine:**
```
PENDING → PROCESSING → SUCCEEDED
   ↓                      ↓
FAILED                REFUNDED
```

---

### 2. Invoice
**Purpose:** Invoices sent by sellers to collectors for artwork purchases

**Fields:**
- `id` (PK) - Unique identifier
- **Parties:**
  - `sellerId` - Reference to identity-service SellerProfile (issuer)
  - `collectorId` - Reference to identity-service User (buyer)
  - `customerEmail` - Email for delivery
- `invoiceNumber` - Unique invoice number (e.g., INV-2025-0001)
- `status` - Invoice status (DRAFT, SENT, PAID, CANCELLED)
- `orderId` - Reference to orders-service Order (optional)
- **Amounts:**
  - `subtotal` - Sum of items
  - `taxAmount` - Tax amount
  - `discountAmount` - Discount
  - `totalAmount` - Final total
  - `currency` - Currency code
- **Payment:**
  - `paymentTransactionId` - Reference to PaymentTransaction (same service)
  - `paidAt` - Payment timestamp
- **Dates:**
  - `issueDate` - When invoice issued
  - `dueDate` - Payment due date
  - `sentAt` - When sent to customer
  - `cancelledAt` - When cancelled
- **Notes:**
  - `notes` - Additional notes
  - `termsAndConditions` - Terms text
- **Line Items:**
  - `items` - InvoiceItem[] (One-to-Many relationship)

**Relationships:**
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference
- **→ User** (Cross-service): Via `collectorId` UUID reference
- **→ Order** (Cross-service): Via `orderId` UUID reference
- **→ PaymentTransaction** (Same-service): Via `paymentTransactionId`
- **← InvoiceItem[]** (One-to-Many): Line items in invoice

**Indexes:**
- Composite: `(sellerId, status)`, `(collectorId, status)`, `(status, dueDate)`
- Unique: `invoiceNumber`

**Invoice Flow:**
```
DRAFT → SENT → PAID
   ↓      ↓
CANCELLED
```

---

### 3. InvoiceItem
**Purpose:** Line items within an invoice

**Fields:**
- `id` (PK) - Unique identifier
- `invoiceId` - Reference to Invoice (same service)
- `description` - Item description
- `quantity` - Quantity
- `unitPrice` - Price per unit
- `amount` - Total (quantity × unitPrice)
- `taxRate` - Tax rate percentage
- `taxAmount` - Tax amount
- Additional metadata fields

**Relationships:**
- **→ Invoice** (Same-service): Via `invoiceId`, TypeORM relationship allowed

**Note:** InvoiceItem is managed via cascade operations from Invoice entity

---

### 4. PaymentMethod
**Purpose:** Saved payment methods for users

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User
- `type` - Payment method type (CARD, PAYPAL, BANK_ACCOUNT)
- `provider` - Provider (STRIPE, PAYPAL)
- **Card Details:**
  - `cardBrand` - Card brand (VISA, MASTERCARD, etc.)
  - `cardLastFour` - Last 4 digits
  - `cardExpMonth` - Expiration month
  - `cardExpYear` - Expiration year
- **Provider IDs:**
  - `stripePaymentMethodId` - Stripe payment method ID
  - `paypalPayerId` - PayPal payer ID
- **Billing:**
  - `billingDetails` - Billing information (JSONB)
- **Status:**
  - `isDefault` - Default payment method flag
  - `isExpired` - Expiration status

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference
- **← PaymentTransaction[]** (One-to-Many): Transactions using this method

---

### 5. Payout
**Purpose:** Seller payout tracking

**Fields:**
- `id` (PK) - Unique identifier
- `sellerId` - Reference to identity-service SellerProfile
- `amount` - Payout amount
- `currency` - Currency code
- `status` - Payout status (PENDING, PROCESSING, PAID, FAILED)
- `method` - Payout method (STRIPE_TRANSFER, PAYPAL_PAYOUT, BANK_TRANSFER)
- **Provider IDs:**
  - `stripeTransferId` - Stripe transfer ID
  - `paypalPayoutBatchId` - PayPal batch ID
- **Timing:**
  - `requestedAt` - When requested
  - `processedAt` - When processed
  - `expectedAt` - Expected arrival date
- `failureReason` - Failure reason if failed

**Relationships:**
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference
- Can be linked to multiple OrderItems that contributed to this payout

---

## Cross-Service References

**This service references:**

| External Service | Entity | Field | Purpose |
|------------------|--------|-------|---------|
| identity-service | User | `userId` | Payer/buyer |
| identity-service | SellerProfile | `sellerId` | Payee/seller |
| orders-service | Order | `orderId` | Payment for order |

**This service is referenced by:**

| Service | Entity | Field | Purpose |
|---------|--------|-------|---------|
| orders-service | Order | `paymentTransactionId` | Order payment |

---

## Payment Flows

### 1. Order Payment Flow

```typescript
// Step 1: Create payment transaction
const transaction = await createPaymentTransaction({
  type: TransactionType.PAYMENT,
  provider: PaymentProvider.STRIPE,
  userId: order.collectorId,
  sellerId: orderItem.sellerId,
  orderId: order.id,
  amount: order.totalAmount,
  currency: order.currency
});

// Step 2: Process with provider
const paymentIntent = await stripe.paymentIntents.create({
  amount: transaction.amount * 100, // cents
  currency: transaction.currency,
  customer: user.stripeCustomerId
});

transaction.stripePaymentIntentId = paymentIntent.id;
transaction.status = TransactionStatus.PROCESSING;

// Step 3: Handle webhook from provider
// When payment succeeds
transaction.status = TransactionStatus.SUCCEEDED;
transaction.completedAt = new Date();
order.paymentStatus = 'PAID';
order.status = OrderStatus.PAID;

// Step 4: Calculate platform fee and seller payout
const platformFee = calculatePlatformFee(transaction.amount);
transaction.platformFee = platformFee;
transaction.netAmount = transaction.amount - platformFee;
```

### 2. Refund Flow

```typescript
// Step 1: Create refund transaction
const refund = await createPaymentTransaction({
  type: TransactionType.REFUND,
  provider: originalTransaction.provider,
  userId: originalTransaction.userId,
  sellerId: originalTransaction.sellerId,
  orderId: order.id,
  amount: refundAmount,
  currency: originalTransaction.currency
});

// Step 2: Process refund with provider
const stripeRefund = await stripe.refunds.create({
  payment_intent: originalTransaction.stripePaymentIntentId,
  amount: refundAmount * 100
});

// Step 3: Update original transaction
originalTransaction.refundAmount = refundAmount;
originalTransaction.refundReason = reason;
originalTransaction.refundedAt = new Date();

// Step 4: Update order status
order.status = OrderStatus.CANCELLED;
order.cancelledReason = reason;
```

### 3. Seller Payout Flow

```typescript
// Step 1: Calculate total payout for seller
const orderItems = await getUnpaidOrderItems(sellerId);
const totalPayout = orderItems.reduce((sum, item) =>
  sum + item.sellerPayoutAmount, 0
);

// Step 2: Create payout
const payout = await createPayout({
  sellerId,
  amount: totalPayout,
  currency: 'USD',
  method: PayoutMethod.STRIPE_TRANSFER
});

// Step 3: Transfer to seller's Stripe account
const transfer = await stripe.transfers.create({
  amount: payout.amount * 100,
  currency: payout.currency,
  destination: seller.stripeAccountId
});

payout.stripeTransferId = transfer.id;
payout.status = PayoutStatus.PAID;
payout.processedAt = new Date();

// Step 4: Mark order items as paid
for (const item of orderItems) {
  item.payoutStatus = 'PAID';
  item.payoutAt = new Date();
}
```

### 4. Invoice Payment Flow

```typescript
// Step 1: Create invoice
const invoice = await createInvoice({
  sellerId,
  collectorId,
  items: invoiceItems,
  status: InvoiceStatus.DRAFT
});

// Step 2: Send to customer
invoice.status = InvoiceStatus.SENT;
invoice.sentAt = new Date();
await sendInvoiceEmail(invoice);

// Step 3: Customer pays
const transaction = await createPaymentTransaction({
  type: TransactionType.PAYMENT,
  invoiceId: invoice.id,
  userId: invoice.collectorId,
  sellerId: invoice.sellerId,
  amount: invoice.totalAmount
});

// Step 4: Mark invoice as paid
invoice.status = InvoiceStatus.PAID;
invoice.paidAt = new Date();
invoice.paymentTransactionId = transaction.id;
```

---

## Provider Integration

### Stripe Integration

**Customer Setup:**
```typescript
// Create Stripe customer when user signs up
const customer = await stripe.customers.create({
  email: user.email,
  metadata: { userId: user.id }
});
user.stripeCustomerId = customer.id;
```

**Seller Setup:**
```typescript
// Create Stripe Connected Account for seller
const account = await stripe.accounts.create({
  type: 'express',
  country: 'US',
  email: seller.email
});
sellerProfile.stripeAccountId = account.id;
```

### PayPal Integration

**Order Flow:**
```typescript
const order = await paypal.orders.create({
  intent: 'CAPTURE',
  purchase_units: [{
    amount: {
      currency_code: transaction.currency,
      value: transaction.amount
    }
  }]
});
transaction.paypalOrderId = order.id;
```

---

## Webhook Handling

### Stripe Webhooks

```typescript
// payment_intent.succeeded
case 'payment_intent.succeeded':
  const transaction = await findByStripePaymentIntentId(event.data.object.id);
  transaction.status = TransactionStatus.SUCCEEDED;
  transaction.completedAt = new Date();
  // Update related order
  if (transaction.orderId) {
    const order = await ordersClient.updateOrder(transaction.orderId, {
      paymentStatus: 'PAID',
      status: OrderStatus.PAID
    });
  }
  break;

// payment_intent.payment_failed
case 'payment_intent.payment_failed':
  transaction.status = TransactionStatus.FAILED;
  transaction.failureReason = event.data.object.last_payment_error?.message;
  transaction.failureCode = event.data.object.last_payment_error?.code;
  break;
```

### PayPal Webhooks

```typescript
// PAYMENT.CAPTURE.COMPLETED
case 'PAYMENT.CAPTURE.COMPLETED':
  const transaction = await findByPaypalOrderId(event.resource.id);
  transaction.status = TransactionStatus.SUCCEEDED;
  transaction.paypalCaptureId = event.resource.id;
  transaction.completedAt = new Date();
  break;
```

---

## Key Principles

1. **Provider agnostic** - Support multiple payment providers
2. **Atomic transactions** - Payment state changes are atomic
3. **Idempotency** - Webhook handlers are idempotent
4. **Audit trail** - All payment events are logged
5. **Security** - Sensitive data (card numbers) never stored
6. **Reconciliation** - Daily reconciliation with provider data
7. **Cross-service coordination** - Payment success triggers order updates

---

## Security Considerations

1. **PCI Compliance:**
   - Never store full card numbers
   - Only store last 4 digits
   - Use provider tokens (Stripe PaymentMethod, PayPal tokens)

2. **Webhook Security:**
   - Verify webhook signatures
   - Validate event authenticity
   - Handle replay attacks

3. **Refund Authorization:**
   - Only order buyer or seller can request refund
   - Admin approval required for large refunds
   - Maintain refund audit log

4. **Payout Security:**
   - Verify seller bank account ownership
   - Implement payout limits and velocity checks
   - KYC/AML compliance for sellers
