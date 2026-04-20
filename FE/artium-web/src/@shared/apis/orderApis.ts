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
  payoutStatus: string
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
  paymentIntentId: string | null
  paymentTransactionId: string | null
  shippingAddress: ShippingAddressRequest | null
  customerNotes: string | null
  createdAt: string
  updatedAt: string
}

// --- API Functions ---

const orderApis = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    return apiPost<OrderResponse>('/orders', data)
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${id}`)
  },

  getMyOrders: async (): Promise<OrderResponse[]> => {
    return apiFetch<OrderResponse[]>('/orders')
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
