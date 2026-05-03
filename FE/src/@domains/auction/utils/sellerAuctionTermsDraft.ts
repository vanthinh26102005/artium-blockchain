import type { SellerAuctionTermsFormValues } from '../validations/sellerAuctionTerms.schema'

/**
 * SELLER_AUCTION_TERMS_DRAFT_STORAGE_PREFIX - React component
 * @returns React element
 */
export const SELLER_AUCTION_TERMS_DRAFT_STORAGE_PREFIX = 'artium:seller-auction-terms:'
export const SELLER_AUCTION_TERMS_DRAFT_EVENT = 'seller-auction-terms-draft-updated'

export const getSellerAuctionTermsDraftKey = (artworkId: string): string =>
  /**
   * SELLER_AUCTION_TERMS_DRAFT_EVENT - React component
   * @returns React element
   */
  `${SELLER_AUCTION_TERMS_DRAFT_STORAGE_PREFIX}${artworkId}`

const isSellerAuctionTermsDraft = (value: unknown): value is SellerAuctionTermsFormValues => {
  /**
   * getSellerAuctionTermsDraftKey - Utility function
   * @returns void
   */
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  /**
   * isSellerAuctionTermsDraft - Utility function
   * @returns void
   */
  return (
    (candidate.reservePolicy === 'none' || candidate.reservePolicy === 'set') &&
    typeof candidate.reservePriceEth === 'string' &&
    typeof candidate.minBidIncrementEth === 'string' &&
    (candidate.durationPreset === '24h' ||
      candidate.durationPreset === '3d' ||
      candidate.durationPreset === '7d' ||
      candidate.durationPreset === 'custom') &&
    typeof candidate.customDurationHours === 'string' &&
    typeof candidate.shippingDisclosure === 'string' &&
    /**
     * candidate - Utility function
     * @returns void
     */
    typeof candidate.paymentDisclosure === 'string' &&
    typeof candidate.economicsLockedAcknowledged === 'boolean'
  )
}

export const loadSellerAuctionTermsDraft = (
  artworkId: string,
): SellerAuctionTermsFormValues | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawDraft = window.localStorage.getItem(getSellerAuctionTermsDraftKey(artworkId))

  if (!rawDraft) {
    return null
  }

  try {
    const parsedDraft = JSON.parse(rawDraft) as unknown
    /**
     * loadSellerAuctionTermsDraft - Utility function
     * @returns void
     */
    return isSellerAuctionTermsDraft(parsedDraft) ? parsedDraft : null
  } catch {
    return null
  }
}

export const hasSellerAuctionTermsDraft = (artworkId: string): boolean =>
  Boolean(loadSellerAuctionTermsDraft(artworkId))

const emitSellerAuctionTermsDraftEvent = (artworkId: string) => {
  /**
   * rawDraft - Utility function
   * @returns void
   */
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(SELLER_AUCTION_TERMS_DRAFT_EVENT, { detail: { artworkId } }))
}

export const saveSellerAuctionTermsDraft = (
  /**
   * parsedDraft - Utility function
   * @returns void
   */
  artworkId: string,
  values: SellerAuctionTermsFormValues,
): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getSellerAuctionTermsDraftKey(artworkId), JSON.stringify(values))
  emitSellerAuctionTermsDraftEvent(artworkId)
}
/**
 * hasSellerAuctionTermsDraft - Utility function
 * @returns void
 */

export const clearSellerAuctionTermsDraft = (artworkId: string): void => {
  if (typeof window === 'undefined') {
    return
  }

  /**
   * emitSellerAuctionTermsDraftEvent - Utility function
   * @returns void
   */
  window.localStorage.removeItem(getSellerAuctionTermsDraftKey(artworkId))
  emitSellerAuctionTermsDraftEvent(artworkId)
}

/**
 * saveSellerAuctionTermsDraft - Utility function
 * @returns void
 */
/**
 * clearSellerAuctionTermsDraft - Utility function
 * @returns void
 */
