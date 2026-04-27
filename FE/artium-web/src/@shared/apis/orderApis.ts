import { apiFetch, apiPost } from '@shared/services/apiClient'

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

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      return
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString.length > 0 ? `?${queryString}` : ''
}

// --- API Functions ---

const orderApis = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    return apiPost<OrderResponse>('/orders', data)
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${id}`)
  },

  getMyOrders: async ({ scope, status, skip, take }: GetMyOrdersInput): Promise<PaginatedOrdersResponse> => {
    const query = buildQueryString({ scope, status, skip, take })
    return apiFetch<PaginatedOrdersResponse>(`/orders${query}`)
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

  markShipped: async (id: string, data: MarkShippedRequest): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${id}/ship`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  confirmDelivery: async (id: string, data: ConfirmDeliveryRequest): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${id}/confirm-delivery`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  openDispute: async (id: string, data: OpenDisputeRequest): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${id}/dispute`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
}

export default orderApis
