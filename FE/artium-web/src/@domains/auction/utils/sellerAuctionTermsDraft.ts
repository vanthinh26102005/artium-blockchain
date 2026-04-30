import type { SellerAuctionTermsFormValues } from '../validations/sellerAuctionTerms.schema'

export const SELLER_AUCTION_TERMS_DRAFT_STORAGE_PREFIX = 'artium:seller-auction-terms:'
export const SELLER_AUCTION_TERMS_DRAFT_EVENT = 'seller-auction-terms-draft-updated'

export const getSellerAuctionTermsDraftKey = (artworkId: string): string =>
  `${SELLER_AUCTION_TERMS_DRAFT_STORAGE_PREFIX}${artworkId}`

const isSellerAuctionTermsDraft = (
  value: unknown,
): value is SellerAuctionTermsFormValues => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

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
    return isSellerAuctionTermsDraft(parsedDraft) ? parsedDraft : null
  } catch {
    return null
  }
}

export const hasSellerAuctionTermsDraft = (artworkId: string): boolean =>
  Boolean(loadSellerAuctionTermsDraft(artworkId))

const emitSellerAuctionTermsDraftEvent = (artworkId: string) => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(SELLER_AUCTION_TERMS_DRAFT_EVENT, { detail: { artworkId } }),
  )
}

export const saveSellerAuctionTermsDraft = (
  artworkId: string,
  values: SellerAuctionTermsFormValues,
): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getSellerAuctionTermsDraftKey(artworkId), JSON.stringify(values))
  emitSellerAuctionTermsDraftEvent(artworkId)
}

export const clearSellerAuctionTermsDraft = (artworkId: string): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(getSellerAuctionTermsDraftKey(artworkId))
  emitSellerAuctionTermsDraftEvent(artworkId)
}
