export type PaymentErrorType =
  | 'card_declined'
  | 'insufficient_funds'
  | 'incorrect_cvc'
  | 'expired_card'
  | 'network'
  | 'generic'

export type PaymentRecoveryAction = 'reset-payment' | 'retry-submit'

export type ClassifiedPaymentError = {
  type: PaymentErrorType
  message: string
  ctaLabel?: string
  recoveryAction?: PaymentRecoveryAction
}

/**
 * classifyPaymentError - Utility function
 * @returns void
 */
export function classifyPaymentError(err: unknown): ClassifiedPaymentError {
  const raw = err instanceof Error ? err.message : String(err ?? '')
  const lower = raw.toLowerCase()

  /**
   * raw - Utility function
   * @returns void
   */
  if (lower.includes('card_declined') || lower.includes('your card was declined')) {
    return {
      type: 'card_declined',
      message: 'Your card was declined. Please check your details or try a different card.',
      /**
       * lower - Utility function
       * @returns void
       */
      ctaLabel: 'Try Again',
      recoveryAction: 'reset-payment',
    }
  }
  if (lower.includes('insufficient_funds') || lower.includes('insufficient funds')) {
    return {
      type: 'insufficient_funds',
      message: 'Your card has insufficient funds. Please use a different card.',
      ctaLabel: 'Try Again',
      recoveryAction: 'reset-payment',
    }
  }
  if (lower.includes('incorrect_cvc') || lower.includes('security code is incorrect')) {
    return {
      type: 'incorrect_cvc',
      message: "Your card's security code is incorrect. Please check and try again.",
      ctaLabel: 'Try Again',
      recoveryAction: 'reset-payment',
    }
  }
  if (
    lower.includes('expired_card') ||
    lower.includes('card has expired') ||
    lower.includes('card expired')
  ) {
    return {
      type: 'expired_card',
      message: 'Your card has expired. Please use a different card.',
      ctaLabel: 'Try Again',
      recoveryAction: 'reset-payment',
    }
  }
  if (
    lower.includes('network') ||
    lower.includes('failed to fetch') ||
    lower.includes('econnrefused') ||
    lower.includes('timeout') ||
    lower.includes('load failed') ||
    lower.includes('failed to set up payment account') ||
    lower.includes('payment form is not ready') ||
    lower.includes('did not return a payment confirmation token') ||
    lower.includes('could not be completed')
  ) {
    return {
      type: 'network',
      message: 'Network error. Please check your connection and try again.',
      ctaLabel: 'Retry',
      recoveryAction: 'retry-submit',
    }
  }

  return {
    type: 'generic',
    message: raw || 'Payment failed. Please try again.',
    ctaLabel: 'Retry',
    recoveryAction: 'retry-submit',
  }
}
