import { apiFetch, apiPost, encodePathSegment, withQuery } from '@shared/services/apiClient'
import type { SellerAuctionStartStatusResponse } from '@shared/apis/auctionApis'

// --- Request Types ---

export type OrderItemRequest = {
  artworkId: string
  quantity: number
  price: number
  artworkTitle?: string
  artworkImageUrl?: string | null
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
  shippingCost?: number
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
  payoutStatus: string
}

export type OrderScope = 'buyer' | 'seller'

export type GetMyOrdersInput = {
  scope: OrderScope
  status?: string
  skip?: number
  take?: number
}

export type PaginatedOrdersResponse = {
  data: OrderResponse[]
  total: number
}

export type OrderResponse = {
  id: string
  collectorId: string
  orderNumber: string
  status: string
  subtotal: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  paymentStatus: string
  paymentMethod: string | null
  paymentIntentId: string | null
  paymentTransactionId: string | null
  shippingAddress: ShippingAddressRequest | null
  billingAddress?: ShippingAddressRequest | null
  shippingMethod?: string | null
  trackingNumber?: string | null
  carrier?: string | null
  customerNotes: string | null
  cancelledReason?: string | null
  confirmedAt?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
  cancelledAt?: string | null
  disputeReason?: string | null
  disputeOpenedAt?: string | null
  disputeResolvedAt?: string | null
  onChainOrderId?: string | null
  txHash?: string | null
  sellerAuctionLifecycle?: SellerAuctionStartStatusResponse | null
  items?: OrderItemResponse[]
  createdAt: string
  updatedAt: string
}

export type MarkShippedRequest = {
  carrier: string
  trackingNumber: string
  shippingMethod?: string
}

export type ConfirmDeliveryRequest = {
  notes?: string
}

export type OpenDisputeRequest = {
  reason: string
}

// --- API Functions ---

const orderApis = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    return apiPost<OrderResponse>('/orders', data)
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${encodePathSegment(id)}`)
  },

  getMyOrders: async ({ scope, status, skip, take }: GetMyOrdersInput): Promise<PaginatedOrdersResponse> => {
    return apiFetch<PaginatedOrdersResponse>(withQuery('/orders', { scope, status, skip, take }))
  },

  getOrderItems: async (orderId: string): Promise<OrderItemResponse[]> => {
    return apiFetch<OrderItemResponse[]>(`/orders/${encodePathSegment(orderId)}/items`)
  },

  cancelOrder: async (id: string, reason?: string): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${encodePathSegment(id)}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    })
  },

  markShipped: async (id: string, data: MarkShippedRequest): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${encodePathSegment(id)}/ship`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  confirmDelivery: async (id: string, data: ConfirmDeliveryRequest): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${encodePathSegment(id)}/confirm-delivery`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  openDispute: async (id: string, data: OpenDisputeRequest): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${encodePathSegment(id)}/dispute`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
}

export default orderApis
