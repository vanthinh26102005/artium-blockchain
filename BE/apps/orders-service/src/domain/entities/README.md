# Orders Service Entities

This document describes all entities in the orders-service and their relationships.

## Entities Overview

### 1. Order
**Purpose:** Customer orders for artwork purchases

**Fields:**
- `id` (PK) - Unique identifier
- `collectorId` - Reference to identity-service User (buyer)
- `status` - Order status (PENDING, PAID, SHIPPED, FULFILLED, CANCELLED)
- `orderNumber` - Unique order number (e.g., ORD-20250110-0001)
- **Amounts:**
  - `subtotal` - Sum of all items
  - `shippingCost` - Shipping cost
  - `taxAmount` - Tax amount
  - `discountAmount` - Discount applied
  - `totalAmount` - Final total
  - `currency` - Currency code (USD, EUR, etc.)
- `promoCode` - Promotional code applied
- **Addresses (JSONB):**
  - `shippingAddress` - Delivery address
  - `billingAddress` - Billing address
- **Shipping:**
  - `shippingMethod` - Shipping method chosen
  - `trackingNumber` - Shipment tracking number
  - `carrier` - Shipping carrier (FedEx, UPS, etc.)
  - `estimatedDeliveryDate` - Expected delivery date
- **Payment:**
  - `paymentTransactionId` - Reference to payments-service PaymentTransaction
  - `paymentMethod` - Payment method used
  - `paymentStatus` - Payment status (UNPAID, PAID, REFUNDED)
  - `paymentIntentId` - Legacy Stripe payment intent ID
- **Notes:**
  - `customerNotes` - Customer instructions
  - `internalNotes` - Internal seller notes
- **Cancellation:**
  - `cancelledReason` - Cancellation reason
  - `cancelledAt` - When cancelled
- **Lifecycle Timestamps:**
  - `confirmedAt` - When order confirmed
  - `shippedAt` - When order shipped
  - `deliveredAt` - When order delivered

**Relationships:**
- **→ User** (Cross-service): Via `collectorId` UUID reference (buyer)
- **→ PaymentTransaction** (Cross-service): Via `paymentTransactionId` UUID reference
- **← OrderItem[]** (One-to-Many): Items in this order
- **Referenced by:**
  - payments-service: PaymentTransaction, Invoice (orderId)
  - identity-service: SellerProfile metrics updated when order fulfilled

**Indexes:**
- Composite: `(collectorId, status)`
- Single: `createdAt`
- Unique: `orderNumber`

**State Machine:**
```
PENDING → PAID → SHIPPED → FULFILLED
   ↓
CANCELLED (can happen at any stage before SHIPPED)
```

---

### 2. OrderItem
**Purpose:** Individual line items within an order (snapshot of artwork at purchase time)

**Fields:**
- `id` (PK) - Unique identifier
- `orderId` - Reference to Order (same service)
- `artworkId` - Reference to artwork-service Artwork
- `sellerId` - Reference to identity-service SellerProfile
- **Snapshot Fields (Immutable):**
  - `priceAtPurchase` - Price at time of purchase (never changes)
  - `artworkTitle` - Artwork title at purchase time
  - `artworkImageUrl` - Artwork image at purchase time
  - `artworkDescription` - Artwork description at purchase time
- `quantity` - Quantity purchased
- `currency` - Currency code
- **Platform Fees:**
  - `platformFee` - Fee collected by platform
  - `sellerPayoutAmount` - Amount paid to seller
- **Payout:**
  - `payoutStatus` - Status of seller payout (PENDING, PAID)
  - `payoutAt` - When seller was paid

**Relationships:**
- **→ Order** (Same-service): Via `orderId`
- **→ Artwork** (Cross-service): Via `artworkId` UUID reference
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference

**Indexes:**
- Composite: None specified, but typically indexed on `orderId`, `artworkId`, `sellerId`

**Snapshot Pattern:**
- OrderItem preserves historical data at purchase time
- Even if artwork is deleted or price changes, order history remains accurate
- Snapshot fields are **immutable** - never updated after order creation
- This is a legal and accounting requirement

---

### 3. CartItem
**Purpose:** Individual items in a shopping cart (real-time data fetching)

**Fields:**
- `id` (PK) - Unique identifier
- `cartId` - Reference to ShoppingCart (same service)
- `artworkId` - Reference to artwork-service Artwork
- `sellerId` - Reference to identity-service SellerProfile
- `quantity` - Quantity in cart
- `addedAt` - When added to cart

**Relationships:**
- **→ ShoppingCart** (Same-service): Via `cartId`
- **→ Artwork** (Cross-service): Via `artworkId` UUID reference
- **→ SellerProfile** (Cross-service): Via `sellerId` UUID reference

**Indexes:**
- Unique: `(cartId, artworkId)` - Same artwork can't be added twice
- Single: `cartId`, `artworkId`

**Data Fetching Strategy:**
- **NO cached data** - CartItem only stores IDs
- Artwork details (title, image, price, availability) fetched in real-time from artwork-service
- This ensures cart always shows current data
- Unlike OrderItem which preserves snapshots, CartItem is ephemeral

**Migration Note:**
- Removed cached fields: `artworkTitle`, `artworkImageUrl`, `price`, `isAvailable`, `availabilityNote`
- Now uses API calls to fetch fresh data when loading cart

---

### 4. ShoppingCart
**Purpose:** User's shopping cart (one cart per user)

**Fields:**
- `id` (PK) - Unique identifier
- `userId` - Reference to identity-service User (unique, one cart per user)
- **Denormalized Metrics:**
  - `totalItems` - Total item count
  - `subtotal` - Cart subtotal
- `currency` - Currency code
- `promoCode` - Applied promotional code
- `discountAmount` - Discount from promo code
- `lastActivityAt` - Last cart activity (for abandoned cart tracking)
- `expiresAt` - Cart expiration for abandoned cart recovery

**Relationships:**
- **→ User** (Cross-service): Via `userId` UUID reference (one-to-one)
- **← CartItem[]** (One-to-Many): Items in this cart

**Indexes:**
- Unique: `userId` - Enforces one cart per user

**Business Logic:**
- Carts can be abandoned (tracked via `lastActivityAt` and `expiresAt`)
- Abandoned cart emails can be sent to recover sales
- Metrics (`totalItems`, `subtotal`) are denormalized for quick display

---

## Cross-Service References

**This service references:**

| External Service | Entity | Field | Purpose |
|------------------|--------|-------|---------|
| identity-service | User | `collectorId` | Order buyer |
| identity-service | SellerProfile | `sellerId` | Item seller |
| artwork-service | Artwork | `artworkId` | Purchased/cart artwork |
| payments-service | PaymentTransaction | `paymentTransactionId` | Order payment |

**This service is referenced by:**

| Service | Entity | Field | Purpose |
|---------|--------|-------|---------|
| payments-service | PaymentTransaction | `orderId` | Payment for order |
| payments-service | Invoice | `orderId` | Invoice for order |
| identity-service | SellerProfile | metrics | Update sales count on fulfillment |

---

## Snapshot vs Real-Time Data

### OrderItem - Snapshot Pattern
**Purpose:** Preserve historical accuracy

```typescript
// OrderItem is IMMUTABLE after creation
{
  priceAtPurchase: 1500.00,        // Never changes
  artworkTitle: "Sunset Dreams",    // Even if artwork renamed
  artworkImageUrl: "old-image.jpg"  // Even if image updated
}
```

**Why?**
- Legal requirement - order records must be accurate to what customer saw
- Accounting - price changes shouldn't affect past orders
- Customer service - verify what was actually purchased

### CartItem - Real-Time Pattern
**Purpose:** Always show current state

```typescript
// CartItem stores only IDs
{
  artworkId: "uuid-123",  // Fetch from artwork-service
  sellerId: "uuid-456"    // Fetch from identity-service
}
```

**Why?**
- Price changes should reflect immediately in cart
- Availability changes (sold out) should be shown
- Cart is not final - user hasn't committed yet

---

## Order Lifecycle

### State Transitions

1. **Cart → Order Creation:**
   - Convert CartItems to OrderItems (create snapshots)
   - Generate unique order number
   - Calculate totals
   - Create PaymentTransaction in payments-service

2. **Payment Processing:**
   - Update `paymentStatus` when payment succeeds/fails
   - Link to `paymentTransactionId`
   - If payment fails, order stays PENDING

3. **Fulfillment:**
   - Seller marks as SHIPPED (adds tracking info)
   - Buyer confirms delivery → FULFILLED
   - Update SellerProfile metrics in identity-service

4. **Cancellation:**
   - Can cancel before SHIPPED
   - Process refund via payments-service
   - Update inventory in artwork-service

---

## Abandoned Cart Recovery

**Tracking:**
- `ShoppingCart.lastActivityAt` - Updated on any cart interaction
- `ShoppingCart.expiresAt` - Set to now + 30 days

**Recovery Process:**
1. Identify carts with `lastActivityAt` > 24 hours ago
2. Send reminder email via notifications-service
3. Send discount code email after 3 days
4. Final reminder after 7 days
5. Archive cart after 30 days

---

## Key Principles

1. **Snapshot for orders** - OrderItem preserves purchase-time data
2. **Real-time for carts** - CartItem fetches current data
3. **One cart per user** - Enforced by unique index on `userId`
4. **Cross-service coordination** - Orders trigger updates in payments, identity services
5. **Immutability** - OrderItems are immutable after creation
6. **No cached cart data** - Always fetch fresh artwork details

---

## Integration Points

### Creating an Order

```typescript
// 1. Get cart items
const cartItems = await cartService.getCartItems(userId);

// 2. Fetch artwork details (real-time)
const artworks = await artworkClient.getArtworksByIds(cartItems.map(i => i.artworkId));

// 3. Create order with snapshots
const orderItems = cartItems.map(item => {
  const artwork = artworks.find(a => a.id === item.artworkId);
  return {
    artworkId: item.artworkId,
    sellerId: artwork.sellerId,
    priceAtPurchase: artwork.price,        // Snapshot
    artworkTitle: artwork.title,           // Snapshot
    artworkImageUrl: artwork.images[0],    // Snapshot
    artworkDescription: artwork.description // Snapshot
  };
});

// 4. Create payment transaction
const transaction = await paymentsClient.createTransaction({
  orderId: order.id,
  amount: order.totalAmount
});

// 5. Clear cart
await cartService.clearCart(userId);
```

### Fulfilling an Order

```typescript
// 1. Update order status
order.status = OrderStatus.FULFILLED;
order.deliveredAt = new Date();

// 2. Update seller metrics in identity-service
await identityClient.incrementSellerStats(sellerId, {
  soldArtworkCount: +1,
  totalSales: +order.totalAmount
});

// 3. Process seller payout via payments-service
await paymentsClient.createPayout({
  sellerId,
  orderId: order.id,
  amount: orderItem.sellerPayoutAmount
});
```
