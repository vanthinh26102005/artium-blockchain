// Quick Sell Invoice APIs
// Based on blueprint: 06_QUICK_SELL_API_CONTRACT.md

import { apiFetch, apiPost } from '@shared/services/apiClient'

// --- Configuration ---
// Set NEXT_PUBLIC_USE_MOCK_API=true to force mock responses
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

// --- Request Types ---

export type CreateInvoiceArtworkItem = {
  id: string
  price: number
  quantity?: number
  discountPercent: number
  artworkName?: string
  artworkImageUrl?: string
}

export type CreateInvoiceCustomItem = {
  title: string
  price: number
  quantity?: number
  discountPercent: number
}

export type CreateInvoiceCollector = {
  name: string
  email: string
  phone?: string
  message?: string
}

export type CreateInvoiceRequest = {
  artworks: CreateInvoiceArtworkItem[]
  customItems: CreateInvoiceCustomItem[]
  collector: CreateInvoiceCollector
  isQuickSell: boolean
  isApplySalesTax?: boolean
  taxZipcode?: string
  taxPercent?: number
  shippingFee?: number
  isArtistHandlesShipping?: boolean
  invoiceNumber?: string
  currency?: string
}

// --- Response Types ---

export type InvoiceItemResponse = {
  id: string
  type: 'Artium-artwork' | 'custom-item'
  salePrice: number
  quantity: number
  discountPercentage: number
  artworkId?: string
  artworkName?: string
  artworkImageUrl?: string
  description?: string
}

export type CreateInvoiceResponse = {
  id: string
  invoiceCode: string
  totalAmount: number
  invoiceItems: InvoiceItemResponse[]
}

export type InvoiceResponse = {
  id: string
  invoiceCode: string
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
  subtotal: number
  discountAmount: number
  taxAmount: number
  taxPercent?: number
  totalAmount: number
  currency: string
  collector?: CreateInvoiceCollector
  items: InvoiceItemResponse[]
  createdAt?: string
  updatedAt?: string
}

export type UpdateInvoiceRequest = {
  customerEmail?: string
  notes?: string
  items?: Array<{
    artworkId?: string
    artworkTitle?: string
    artworkImageUrl?: string
    description: string
    quantity: number
    unitPrice: number
    taxRate?: number
    discountAmount?: number
    notes?: string
  }>
}

export type SendInvoiceRequest = {
  name?: string
  email: string
  message?: string
  invoiceUrl?: string
}

export type CreateInvoicePaymentIntentRequest = {
  email?: string
  name?: string
}

export type CreateInvoicePaymentIntentResponse = {
  transactionId: string
  paymentIntentId: string
  clientSecret: string
  amount: number
  currency: string
}

// --- Mock Helpers ---

const generateMockInvoiceCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `INV-${timestamp}-${random}`
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// --- Mock Implementations ---

const mockCreateQuickSellInvoice = async (
  payload: CreateInvoiceRequest,
): Promise<CreateInvoiceResponse> => {
  // Simulate network delay
  await delay(800)

  console.log('[Mock API] Creating invoice with payload:', payload)

  // Calculate total from items
  const artworkTotal = payload.artworks.reduce((sum, item) => {
    const qty = item.quantity || 1
    const lineTotal = item.price * qty
    const discounted = lineTotal * (1 - item.discountPercent / 100)
    return sum + discounted
  }, 0)

  const customTotal = payload.customItems.reduce((sum, item) => {
    const qty = item.quantity || 1
    const lineTotal = item.price * qty
    const discounted = lineTotal * (1 - item.discountPercent / 100)
    return sum + discounted
  }, 0)

  const subtotal = artworkTotal + customTotal
  const tax = payload.isApplySalesTax ? subtotal * ((payload.taxPercent || 0) / 100) : 0
  const totalAmount = Math.round((subtotal + tax) * 100) / 100

  // Generate mock response
  const response: CreateInvoiceResponse = {
    id: `mock-invoice-${Date.now()}`,
    invoiceCode: generateMockInvoiceCode(),
    totalAmount,
    invoiceItems: [
      ...payload.artworks.map((item, i) => ({
        id: `item-artwork-${i}`,
        type: 'Artium-artwork' as const,
        salePrice: item.price,
        quantity: item.quantity || 1,
        discountPercentage: item.discountPercent,
        artworkId: item.id,
        artworkName: item.artworkName,
        artworkImageUrl: item.artworkImageUrl,
      })),
      ...payload.customItems.map((item, i) => ({
        id: `item-custom-${i}`,
        type: 'custom-item' as const,
        salePrice: item.price,
        quantity: item.quantity || 1,
        discountPercentage: item.discountPercent,
        artworkName: item.title,
      })),
    ],
  }

  console.log('[Mock API] Invoice created:', response)

  return response
}

const mockGetInvoiceByCode = async (invoiceCode: string): Promise<InvoiceResponse> => {
  await delay(500)

  console.log('[Mock API] Getting invoice:', invoiceCode)

  return {
    id: 'mock-invoice-id',
    invoiceCode,
    status: 'sent',
    subtotal: 1500,
    discountAmount: 0,
    taxAmount: 0,
    taxPercent: 0,
    totalAmount: 1500,
    currency: 'USD',
    collector: {
      name: 'Mock Buyer',
      email: 'buyer@example.com',
    },
    items: [
      {
        id: 'mock-item-1',
        type: 'Artium-artwork',
        salePrice: 1500,
        quantity: 1,
        discountPercentage: 0,
        artworkName: 'Mock Artwork',
      },
    ],
    createdAt: new Date().toISOString(),
  }
}

// --- API Functions ---

const invoiceApis = {
  /**
   * Create a new Quick Sell invoice
   * POST /store/sale/invoice
   */
  createQuickSellInvoice: async (payload: CreateInvoiceRequest): Promise<CreateInvoiceResponse> => {
    if (USE_MOCK_API) {
      return mockCreateQuickSellInvoice(payload)
    }
    return apiPost<CreateInvoiceResponse>('/store/sale/invoice', payload)
  },

  /**
   * Get invoice by code (public/private)
   * GET /store/sale/invoice/code/{invoiceCode}
   */
  getInvoiceByCode: async (invoiceCode: string): Promise<InvoiceResponse> => {
    if (USE_MOCK_API) {
      return mockGetInvoiceByCode(invoiceCode)
    }
    return apiFetch<InvoiceResponse>(`/store/sale/invoice/code/${invoiceCode}`)
  },

  /**
   * Delete invoice by ID
   * DELETE /store/sale/invoice/{id}
   */
  deleteInvoice: async (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
      await delay(500)
      console.log('[Mock API] Deleted invoice:', id)
      return { success: true }
    }
    return apiFetch<{ success: boolean }>(`/store/sale/invoice/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Update invoice by ID
   * PATCH /payments/invoices/{id}
   */
  updateInvoice: async (
    id: string,
    payload: UpdateInvoiceRequest,
  ): Promise<InvoiceResponse> => {
    if (USE_MOCK_API) {
      await delay(500)
      console.log('[Mock API] Updated invoice:', id, payload)
      return mockGetInvoiceByCode(id)
    }
    return apiFetch<InvoiceResponse>(`/payments/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Send quick-sell invoice to buyer
   * POST /store/sale/invoice/code/{invoiceCode}/send
   */
  sendQuickSellInvoice: async (
    invoiceCode: string,
    payload: SendInvoiceRequest,
  ): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
      await delay(500)
      console.log('[Mock API] Sent invoice:', invoiceCode, payload)
      return { success: true }
    }
    return apiPost<{ success: boolean }>(
      `/store/sale/invoice/code/${invoiceCode}/send`,
      payload,
    )
  },

  /**
   * Create Stripe payment intent for quick-sell invoice
   * POST /store/sale/invoice/code/{invoiceCode}/payment-intent
   */
  createQuickSellPaymentIntent: async (
    invoiceCode: string,
    payload: CreateInvoicePaymentIntentRequest,
  ): Promise<CreateInvoicePaymentIntentResponse> => {
    if (USE_MOCK_API) {
      await delay(500)
      const mockId = `pi_mock_${Date.now()}`
      return {
        transactionId: `txn_${Date.now()}`,
        paymentIntentId: mockId,
        clientSecret: `${mockId}_secret_mock`,
        amount: 0,
        currency: 'usd',
      }
    }
    return apiPost<CreateInvoicePaymentIntentResponse>(
      `/store/sale/invoice/code/${invoiceCode}/payment-intent`,
      payload,
    )
  },
}

export default invoiceApis
