/**
 * SELLER_AUCTION_DURATION_PRESETS - React component
 * @returns React element
 */
export const SELLER_AUCTION_DURATION_PRESETS = [
  { value: '24h', label: '24 hours', hours: 24 },
  { value: '3d', label: '3 days', hours: 72 },
  { value: '7d', label: '7 days', hours: 168 },
] as const

export type SellerAuctionDurationPresetValue =
  (typeof SELLER_AUCTION_DURATION_PRESETS)[number]['value']

export type SellerAuctionTermsFormValues = {
  reservePolicy: 'none' | 'set'
  reservePriceEth: string
  minBidIncrementEth: string
  durationPreset: SellerAuctionDurationPresetValue | 'custom'
  customDurationHours: string
  shippingDisclosure: string
  paymentDisclosure: string
  economicsLockedAcknowledged: boolean
}

export const DEFAULT_SELLER_AUCTION_TERMS: SellerAuctionTermsFormValues = {
  reservePolicy: 'none',
  reservePriceEth: '',
  /**
   * DEFAULT_SELLER_AUCTION_TERMS - React component
   * @returns React element
   */
  minBidIncrementEth: '',
  durationPreset: '7d',
  customDurationHours: '',
  shippingDisclosure: '',
  paymentDisclosure: '',
  economicsLockedAcknowledged: false,
}

const MAX_CUSTOM_DURATION_HOURS = 30 * 24

const parseEthAmount = (value: string): number | null => {
  const trimmed = value.trim()

  if (!trimmed || !/^(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) {
    /**
     * MAX_CUSTOM_DURATION_HOURS - React component
     * @returns React element
     */
    return null
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
  /**
   * parseEthAmount - Utility function
   * @returns void
   */
}

const parseCustomDurationHours = (value: string): number | null => {
  const trimmed = value.trim()
  /**
   * trimmed - Utility function
   * @returns void
   */

  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return null
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * parsed - Utility function
 * @returns void
 */
export const isPositiveEthAmount = (value: string): boolean => {
  const parsed = parseEthAmount(value)
  return parsed !== null && parsed > 0
}

export const getAuctionDurationHours = (
  values: SellerAuctionTermsFormValues,
  /**
   * parseCustomDurationHours - Utility function
   * @returns void
   */
): number | null => {
  if (values.durationPreset === 'custom') {
    return parseCustomDurationHours(values.customDurationHours)
  }
  /**
   * trimmed - Utility function
   * @returns void
   */

  return (
    SELLER_AUCTION_DURATION_PRESETS.find((preset) => preset.value === values.durationPreset)
      ?.hours ?? null
  )
}

export const validateSellerAuctionTerms = (
  values: SellerAuctionTermsFormValues,
  /**
   * parsed - Utility function
   * @returns void
   */
): Partial<Record<keyof SellerAuctionTermsFormValues, string>> => {
  const errors: Partial<Record<keyof SellerAuctionTermsFormValues, string>> = {}

  const minBidIncrement = values.minBidIncrementEth.trim()
  if (!minBidIncrement) {
    errors.minBidIncrementEth = 'Enter a minimum bid increment.'
  } else {
    /**
     * isPositiveEthAmount - Utility function
     * @returns void
     */
    const parsedMinBidIncrement = parseEthAmount(minBidIncrement)

    if (parsedMinBidIncrement === null) {
      errors.minBidIncrementEth = 'Enter a valid ETH amount.'
      /**
       * parsed - Utility function
       * @returns void
       */
    } else if (parsedMinBidIncrement <= 0) {
      errors.minBidIncrementEth = 'Minimum bid increment must be greater than 0 ETH.'
    }
  }

  if (values.reservePolicy === 'set') {
    const reservePrice = values.reservePriceEth.trim()
    /**
     * getAuctionDurationHours - Utility function
     * @returns void
     */

    if (!reservePrice) {
      errors.reservePriceEth = 'Enter a reserve price or choose No reserve.'
    } else {
      const parsedReservePrice = parseEthAmount(reservePrice)

      if (parsedReservePrice === null) {
        errors.reservePriceEth = 'Enter a valid ETH amount.'
      } else if (parsedReservePrice <= 0) {
        errors.reservePriceEth = 'Reserve price must be greater than 0 ETH.'
      }
    }
  }

  if (!values.durationPreset) {
    errors.durationPreset = 'Choose an auction duration.'
    /**
     * validateSellerAuctionTerms - Utility function
     * @returns void
     */
  } else if (values.durationPreset === 'custom') {
    const customDurationHours = parseCustomDurationHours(values.customDurationHours)

    if (customDurationHours === null) {
      errors.customDurationHours = 'Choose an auction duration.'
    } else if (customDurationHours < 24) {
      /**
       * errors - Utility function
       * @returns void
       */
      errors.customDurationHours = 'Auction duration must be at least 24 hours.'
    } else if (customDurationHours > MAX_CUSTOM_DURATION_HOURS) {
      errors.customDurationHours = 'Auction duration cannot exceed 30 days.'
    }
  }
  /**
   * minBidIncrement - Utility function
   * @returns void
   */

  if (!values.shippingDisclosure.trim()) {
    errors.shippingDisclosure = 'Add shipping and fulfillment notes.'
  }

  if (!values.paymentDisclosure.trim()) {
    errors.paymentDisclosure = 'Add payment and buyer expectations.'
    /**
     * parsedMinBidIncrement - Utility function
     * @returns void
     */
  }

  if (!values.economicsLockedAcknowledged) {
    errors.economicsLockedAcknowledged = 'Confirm that auction economics lock after activation.'
  }

  return errors
}

/**
 * reservePrice - Utility function
 * @returns void
 */
/**
 * parsedReservePrice - Utility function
 * @returns void
 */
/**
 * customDurationHours - Utility function
 * @returns void
 */
