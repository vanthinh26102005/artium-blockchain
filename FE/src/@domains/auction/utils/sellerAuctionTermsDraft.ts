import type { SellerAuctionTermsFormValues } from '../validations/sellerAuctionTerms.schema'
import { DEFAULT_SELLER_AUCTION_TERMS } from '../validations/sellerAuctionTerms.schema'

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
    typeof candidate.customDurationValue === 'string' &&
    (candidate.customDurationUnit === 'days' ||
      candidate.customDurationUnit === 'hours' ||
      candidate.customDurationUnit === 'minutes') &&
    typeof candidate.shippingDisclosure === 'string' &&
    typeof candidate.paymentDisclosure === 'string' &&
    typeof candidate.economicsLockedAcknowledged === 'boolean'
  )
}

const migrateSellerAuctionTermsDraft = (
  value: unknown,
): SellerAuctionTermsFormValues | null => {
  if (isSellerAuctionTermsDraft(value)) {
    return value
  }

  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Record<string, unknown>
  if (
    (candidate.reservePolicy !== 'none' && candidate.reservePolicy !== 'set') ||
    typeof candidate.reservePriceEth !== 'string' ||
    typeof candidate.minBidIncrementEth !== 'string' ||
    (candidate.durationPreset !== '24h' &&
      candidate.durationPreset !== '3d' &&
      candidate.durationPreset !== '7d' &&
      candidate.durationPreset !== 'custom') ||
    typeof candidate.shippingDisclosure !== 'string' ||
    typeof candidate.paymentDisclosure !== 'string' ||
    typeof candidate.economicsLockedAcknowledged !== 'boolean'
  ) {
    return null
  }

  return {
    ...DEFAULT_SELLER_AUCTION_TERMS,
    reservePolicy: candidate.reservePolicy,
    reservePriceEth: candidate.reservePriceEth,
    minBidIncrementEth: candidate.minBidIncrementEth,
    durationPreset: candidate.durationPreset,
    customDurationValue:
      typeof candidate.customDurationHours === 'string' ? candidate.customDurationHours : '',
    customDurationUnit: 'hours',
    shippingDisclosure: candidate.shippingDisclosure,
    paymentDisclosure: candidate.paymentDisclosure,
    economicsLockedAcknowledged: candidate.economicsLockedAcknowledged,
  }
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
    return migrateSellerAuctionTermsDraft(parsedDraft)
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
