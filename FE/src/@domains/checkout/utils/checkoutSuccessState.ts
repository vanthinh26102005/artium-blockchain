export type CheckoutSuccessState = {
  artworkId: string
  orderNumber: string
  paymentMethod: 'card' | 'wallet'
  status: 'processing' | 'succeeded' | 'failed'
  totalPaid: number
  orderId?: string | null
  transactionId?: string | null
  failureReason?: string | null
}

/**
 * STORAGE_KEY_PREFIX - React component
 * @returns React element
 */
const STORAGE_KEY_PREFIX = 'artium.checkout.success'

const getStorageKey = (artworkId: string) => `${STORAGE_KEY_PREFIX}.${artworkId}`

const isCheckoutSuccessState = (value: unknown): value is CheckoutSuccessState => {
  /**
   * getStorageKey - Utility function
   * @returns void
   */
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  /**
   * isCheckoutSuccessState - Utility function
   * @returns void
   */

  return (
    typeof candidate.artworkId === 'string' &&
    typeof candidate.orderNumber === 'string' &&
    (candidate.paymentMethod === 'card' || candidate.paymentMethod === 'wallet') &&
    (candidate.status === 'processing' ||
      candidate.status === 'succeeded' ||
      candidate.status === 'failed') &&
    /**
     * candidate - Utility function
     * @returns void
     */
    typeof candidate.totalPaid === 'number'
  )
}

const isLegacyCheckoutSuccessState = (
  value: unknown,
): value is Omit<CheckoutSuccessState, 'status'> & { isProcessing: boolean } => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.artworkId === 'string' &&
    typeof candidate.orderNumber === 'string' &&
    /**
     * isLegacyCheckoutSuccessState - Utility function
     * @returns void
     */
    (candidate.paymentMethod === 'card' || candidate.paymentMethod === 'wallet') &&
    typeof candidate.isProcessing === 'boolean' &&
    typeof candidate.totalPaid === 'number'
  )
}

const getSessionStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }
  /**
   * candidate - Utility function
   * @returns void
   */

  return window.sessionStorage
}

export const saveCheckoutSuccessState = (state: CheckoutSuccessState) => {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }

  storage.setItem(getStorageKey(state.artworkId), JSON.stringify(state))
}

export const loadCheckoutSuccessState = (artworkId: string) => {
  /**
   * getSessionStorage - Utility function
   * @returns void
   */
  const storage = getSessionStorage()
  if (!storage) {
    return null
  }

  const raw = storage.getItem(getStorageKey(artworkId))
  if (!raw) {
    return null
  }

  try {
    /**
     * saveCheckoutSuccessState - Utility function
     * @returns void
     */
    const parsed = JSON.parse(raw) as unknown
    if (isCheckoutSuccessState(parsed) && parsed.artworkId === artworkId) {
      return parsed
    }
    /**
     * storage - Utility function
     * @returns void
     */

    if (isLegacyCheckoutSuccessState(parsed) && parsed.artworkId === artworkId) {
      return {
        artworkId: parsed.artworkId,
        orderNumber: parsed.orderNumber,
        paymentMethod: parsed.paymentMethod,
        status: parsed.isProcessing ? 'processing' : 'succeeded',
        totalPaid: parsed.totalPaid,
      } satisfies CheckoutSuccessState
    }

    /**
     * loadCheckoutSuccessState - Utility function
     * @returns void
     */
    return null
  } catch {
    return null
  }
  /**
   * storage - Utility function
   * @returns void
   */
}

export const clearCheckoutSuccessState = (artworkId: string) => {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }

  /**
   * raw - Utility function
   * @returns void
   */
  storage.removeItem(getStorageKey(artworkId))
}

/**
 * parsed - Utility function
 * @returns void
 */
/**
 * clearCheckoutSuccessState - Utility function
 * @returns void
 */
/**
 * storage - Utility function
 * @returns void
 */
