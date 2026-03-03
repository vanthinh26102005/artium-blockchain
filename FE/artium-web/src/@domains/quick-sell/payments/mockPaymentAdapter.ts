// Quick Sell Mock Payment Adapter
// Simulates Payment Provider behavior (like Stripe) without real backend

import type { QuickSellPaymentAdapter } from './paymentAdapter'
import type {
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  ConfirmPaymentInput,
  ConfirmPaymentResult,
} from './types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockPaymentAdapter: QuickSellPaymentAdapter = {
  createPaymentIntent: async (
    input: CreatePaymentIntentInput,
  ): Promise<CreatePaymentIntentResult> => {
    // Simulate API call delay
    await delay(1000)

    console.log('[Mock Adapter] Creating PaymentIntent for:', input)

    return {
      clientSecret: `mock_secret_${Date.now()}_${input.invoiceCode}`,
      paymentIntentId: `pi_mock_${Date.now()}`,
    }
  },

  confirmPayment: async (input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> => {
    // Simulate processing time
    await delay(1500)

    console.log('[Mock Adapter] Confirming Payment:', input)

    // Simulate redirect logic handling
    if (input.returnUrl) {
      const url = new URL(input.returnUrl)
      url.searchParams.set('payment_intent', 'pi_mock_confirmed')
      url.searchParams.set('payment_intent_client_secret', input.clientSecret)
      url.searchParams.set('redirect_status', 'succeeded')
      url.searchParams.set('pending', 'true') // Signal to frontend to poll/simulate processing

      console.log('[Mock Adapter] Redirecting to:', url.toString())

      // In real scenario, Stripe redirects the top window
      window.location.href = url.toString()

      // Return a promise that never resolves to simulate navigation (optional, but keeps flow clean)
      return new Promise(() => {})
    }

    return {
      paymentIntent: { status: 'succeeded' },
    }
  },
}
