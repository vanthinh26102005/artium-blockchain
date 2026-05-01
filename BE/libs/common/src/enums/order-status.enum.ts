export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  AUCTION_ACTIVE = 'auction_active',
  ESCROW_HELD = 'escrow_held',
  DISPUTE_OPEN = 'dispute_open',
}

export enum OrderPaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  ESCROW = 'ESCROW',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}

export enum OrderPaymentMethod {
  STRIPE = 'stripe',
  BLOCKCHAIN = 'blockchain',
}
