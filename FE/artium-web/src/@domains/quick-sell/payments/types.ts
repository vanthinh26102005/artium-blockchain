// Quick Sell Payment Types

export type QuickSellPaymentProvider = 'STRIPE' | 'PAYPAL' | 'MOCK'

export type CreatePaymentIntentInput = {
  invoiceCode: string
  amount: number
  currency: string
  paymentMethodType?: string
}

export type CreatePaymentIntentResult = {
  clientSecret: string
  paymentIntentId: string
}

export type ConfirmPaymentInput = {
  clientSecret: string
  returnUrl: string
  paymentMethod?: {
    card?: any
    billing_details?: any
  }
}

export type ConfirmPaymentResult = {
  error?: {
    message: string
    type?: string
  }
  // For redirect-based flows (like Stripe), we typically don't get a success result back
  // because the page redirects. But for our adapter we might return something if needed.
  paymentIntent?: any
}
