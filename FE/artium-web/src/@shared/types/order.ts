export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'auction_active'
  | 'escrow_held'
  | 'dispute_open'

export type OrderPaymentStatus =
  | 'UNPAID'
  | 'PAID'
  | 'ESCROW'
  | 'RELEASED'
  | 'REFUNDED'

export type OrderPaymentMethod = 'stripe' | 'blockchain'

export type EscrowState = 0 | 1 | 2 | 3 | 4 | 5

export type OrderApiItem = {
  id: string
  collectorId?: string | null
  sellerId?: string | null
  status?: OrderStatus
  paymentStatus?: OrderPaymentStatus
  paymentMethod?: OrderPaymentMethod
  onChainOrderId?: string | null
  contractAddress?: string | null
  escrowState?: EscrowState | null
  txHash?: string | null
  sellerWallet?: string | null
  buyerWallet?: string | null
  bidAmountWei?: string | null
  customerNotes?: string | null
  internalNotes?: string | null
  cancelledReason?: string | null
  createdAt?: string
  updatedAt?: string
  cancelledAt?: string | null
  confirmedAt?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
}
