// Quick Sell Invoice APIs
// Based on blueprint: 06_QUICK_SELL_API_CONTRACT.md

import { apiFetch, apiPost, encodePathSegment } from '@shared/services/apiClient'
import {
  mockCreateQuickSellInvoice,
  mockCreateQuickSellPaymentIntent,
  mockDeleteInvoice,
  mockGetInvoiceByCode,
  mockSendQuickSellInvoice,
  mockUpdateInvoice,
} from './invoiceMocks'

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
    return apiFetch<InvoiceResponse>(
      `/store/sale/invoice/code/${encodePathSegment(invoiceCode)}`,
    )
  },

  /**
   * Delete invoice by ID
   * DELETE /store/sale/invoice/{id}
   */
  deleteInvoice: async (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_API) {
      return mockDeleteInvoice(id)
    }
    return apiFetch<{ success: boolean }>(`/store/sale/invoice/${encodePathSegment(id)}`, {
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
      return mockUpdateInvoice(id, payload)
    }
    return apiFetch<InvoiceResponse>(`/payments/invoices/${encodePathSegment(id)}`, {
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
      return mockSendQuickSellInvoice(invoiceCode, payload)
    }
    return apiPost<{ success: boolean }>(
      `/store/sale/invoice/code/${encodePathSegment(invoiceCode)}/send`,
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
      return mockCreateQuickSellPaymentIntent(invoiceCode, payload)
    }
    return apiPost<CreateInvoicePaymentIntentResponse>(
      `/store/sale/invoice/code/${encodePathSegment(invoiceCode)}/payment-intent`,
      payload,
    )
  },
}

export default invoiceApis
