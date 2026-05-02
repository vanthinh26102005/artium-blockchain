// Quick Sell Payment Adapter Interface

import type {
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  ConfirmPaymentInput,
  ConfirmPaymentResult,
} from './types'

export interface QuickSellPaymentAdapter {
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult>
  confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult>
}
