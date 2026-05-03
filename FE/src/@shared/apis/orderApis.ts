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
  artworkDescription?: string | null
  platformFee?: string | null
  sellerPayoutAmount?: string | null
  payoutStatus: string
  payoutAt?: string | null
  createdAt?: string
  updatedAt?: string
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
  shippingAddress?: ShippingAddressRequest | null
  billingAddress?: ShippingAddressRequest | null
  customerNotes: string | null
  internalNotes?: string | null
  cancelledReason?: string | null
  cancelledAt?: string | null
  confirmedAt?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
  onChainOrderId?: string | null
  contractAddress?: string | null
  chainId?: string | null
  escrowState?: number | null
  txHash?: string | null
  sellerWallet?: string | null
  buyerWallet?: string | null
  bidAmountWei?: string | null
  disputeReason?: string | null
  disputeOpenedAt?: string | null
  disputeResolvedAt?: string | null
  sellerAuctionLifecycle?: SellerAuctionStartStatusResponse | null
  disputeResolutionNotes?: string | null
  items?: OrderItemResponse[]
  createdAt: string
  updatedAt?: string
}

export type OrdersListResponse = {
  data: OrderResponse[]
  total: number
}

export type OrderInvoiceAddressResponse = {
  name?: string | null
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
  phone?: string | null
}

export type OrderInvoicePartyResponse = {
  id: string
  name?: string | null
  email?: string | null
}

export type OrderInvoicePaymentResponse = {
  paymentStatus: string
  paymentMethod?: string | null
  paymentTransactionId?: string | null
  paymentIntentId?: string | null
  txHash?: string | null
  onChainOrderId?: string | null
}

export type OrderInvoiceItemResponse = {
  id: string
  artworkId?: string | null
  sellerId?: string | null
  artworkTitle?: string | null
  artworkImageUrl?: string | null
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number
  taxAmount: number
  discountAmount: number
}

export type OrderInvoiceResponse = {
  id: string
  invoiceNumber: string
  status: string
  orderId: string
  orderNumber: string
  issueDate?: string | null
  dueDate?: string | null
  paidAt?: string | null
  currency: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  shippingAmount: number
  totalAmount: number
  buyer: OrderInvoicePartyResponse
  seller: OrderInvoicePartyResponse
  shippingAddress?: OrderInvoiceAddressResponse | Record<string, unknown> | null
  billingAddress?: OrderInvoiceAddressResponse | Record<string, unknown> | null
  payment: OrderInvoicePaymentResponse
  items: OrderInvoiceItemResponse[]
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

/**
 * orderApis - Utility function
 * @returns void
 */
const orderApis = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    return apiPost<OrderResponse>('/orders', data)
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/${encodePathSegment(id)}`)
  },

  getOrderInvoice: async (id: string): Promise<OrderInvoiceResponse> => {
    return apiFetch<OrderInvoiceResponse>(`/orders/${encodePathSegment(id)}/invoice`)
  },

  getMyOrders: async ({
    scope,
    status,
    skip,
    take,
  }: GetMyOrdersInput): Promise<PaginatedOrdersResponse> => {
    return apiFetch<PaginatedOrdersResponse>(withQuery('/orders', { scope, status, skip, take }))
  },

  getOrderByOnChainId: async (onChainOrderId: string): Promise<OrderResponse> => {
    return apiFetch<OrderResponse>(`/orders/on-chain/${encodeURIComponent(onChainOrderId)}`)
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
