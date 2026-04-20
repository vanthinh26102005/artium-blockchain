import { apiFetch, apiPost } from '@shared/services/apiClient'

// --- Request Types ---

export type CreatePaymentIntentRequest = {
  amount: number
  currency: string
  orderId?: string
  sellerId?: string
  description?: string
  stripePaymentMethodId?: string
  metadata?: Record<string, string>
}

export type ConfirmPaymentIntentRequest = {
  paymentIntentId: string
  stripePaymentMethodId?: string
  returnUrl?: string
}

export type CreateStripeCustomerRequest = {
  email: string
}

// --- Response Types ---

export type PaymentIntentResponse = {
  id: string
  type: string
  status: string
  provider: string
  userId: string
  sellerId: string | null
  orderId: string | null
  invoiceId: string | null
  amount: number
  currency: string
  platformFee: number
  netAmount: number
  stripePaymentIntentId: string
  description: string | null
  createdAt: string
}

export type ConfirmPaymentIntentResponse = {
  id: string
  status: string
  stripePaymentIntentId: string
  stripeChargeId: string | null
}

export type StripeCustomerResponse = {
  id: string
  userId: string
  stripeId: string
  email: string
}

export type PaymentTransactionResponse = {
  id: string
  type: string
  status: string
  provider: string
  amount: number
  currency: string
  stripePaymentIntentId: string | null
  createdAt: string
}

// --- API Functions ---

const paymentApis = {
  createPaymentIntent: async (
    data: CreatePaymentIntentRequest,
  ): Promise<PaymentIntentResponse> => {
    return apiPost<PaymentIntentResponse>('/payments/stripe/payment-intent', data)
  },

  confirmPaymentIntent: async (
    data: ConfirmPaymentIntentRequest,
  ): Promise<ConfirmPaymentIntentResponse> => {
    return apiPost<ConfirmPaymentIntentResponse>(
      '/payments/stripe/payment-intent/confirm',
      data,
    )
  },

  createStripeCustomer: async (
    data: CreateStripeCustomerRequest,
  ): Promise<StripeCustomerResponse> => {
    return apiPost<StripeCustomerResponse>('/payments/stripe/customers', data)
  },

  getMyTransactions: async (): Promise<PaymentTransactionResponse[]> => {
    return apiFetch<PaymentTransactionResponse[]>('/payments/transactions')
  },

  getTransactionById: async (
    id: string,
  ): Promise<PaymentTransactionResponse> => {
    return apiFetch<PaymentTransactionResponse>(`/payments/transactions/${id}`)
  },
}

export default paymentApis
