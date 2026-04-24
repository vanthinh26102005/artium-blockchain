import { apiFetch, apiPost } from '@shared/services/apiClient'

// --- Request Types ---

export type OrderItemRequest = {
  artworkId: string
  quantity: number
  price: number
}

export type ShippingAddressRequest = {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type CreateOrderRequest = {
  sellerId: string
  items: OrderItemRequest[]
  shippingAddress?: ShippingAddressRequest
  notes?: string
}

// --- Response Types ---

export type OrderItemResponse = {
  id: string
  orderId: string
  artworkId: string
  sellerId: string
  priceAtPurchase: number
  quantity: number
  currency: string
  artworkTitle: string
  artworkImageUrl?: string | null
  artworkDescription?: string | null
  platformFee?: string | null
  sellerPayoutAmount?: string | null
  payoutStatus: string
  payoutAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type OrderResponse = {
  id: string
  collectorId?: string | null
  orderNumber: string
  status: string
  subtotal: number
  shippingCost: number
  taxAmount: number
  discountAmount?: number | null
  totalAmount: number
  currency: string
  promoCode?: string | null
  shippingMethod?: string | null
  trackingNumber?: string | null
  carrier?: string | null
  estimatedDeliveryDate?: string | null
  paymentStatus: string
  paymentMethod?: string | null
  paymentIntentId?: string | null
  paymentTransactionId?: string | null
  shippingAddress?: Record<string, unknown> | null
  billingAddress?: Record<string, unknown> | null
  customerNotes: string | null
  internalNotes?: string | null
  cancelledReason?: string | null
  cancelledAt?: string | null
  confirmedAt?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
  onChainOrderId?: string | null
  contractAddress?: string | null
  escrowState?: number | null
  txHash?: string | null
  sellerWallet?: string | null
  buyerWallet?: string | null
  bidAmountWei?: string | null
  disputeReason?: string | null
  disputeOpenedAt?: string | null
  disputeResolvedAt?: string | null
  disputeResolutionNotes?: string | null
  createdAt: string
  updatedAt?: string
}

export type OrdersListResponse = {
  data: OrderResponse[]
  total: number
}

// --- API Functions ---

const orderApis = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    return apiPost<OrderResponse>('/orders', data)
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${id}`)
  },

  getOrderByOnChainId: async (onChainOrderId: string): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/on-chain/${onChainOrderId}`)
  },

  getMyOrders: async (): Promise<OrdersListResponse> => {
    return apiFetch<OrdersListResponse>('/orders')
  },

  getOrderItems: async (orderId: string): Promise<OrderItemResponse[]> => {
    return apiFetch<OrderItemResponse[]>(`/orders/${orderId}/items`)
  },

  cancelOrder: async (id: string, reason?: string): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    })
  },
}

export default orderApis
