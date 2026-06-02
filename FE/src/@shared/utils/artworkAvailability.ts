type ArtworkAvailabilityInput = {
  status?: string | null
  isPublished?: boolean | null
  isSold?: boolean | null
  onChainAuctionId?: string | null
  auctionLifecycle?: {
    status?: string | null
  } | null
}

const AUCTION_READ_ONLY_LIFECYCLE_STATUSES = new Set(['pending_start', 'auction_active'])

export const isArtworkInAuctionReadOnlyState = (artwork: ArtworkAvailabilityInput) =>
  artwork.status === 'IN_AUCTION' ||
  Boolean(artwork.onChainAuctionId?.trim()) ||
  AUCTION_READ_ONLY_LIFECYCLE_STATUSES.has(artwork.auctionLifecycle?.status ?? '')

export const isArtworkPurchasable = (artwork: ArtworkAvailabilityInput) =>
  artwork.status === 'ACTIVE' &&
  artwork.isPublished === true &&
  artwork.isSold !== true &&
  !isArtworkInAuctionReadOnlyState(artwork)

export const getArtworkPurchaseUnavailableMessage = (artwork: ArtworkAvailabilityInput) => {
  if (isArtworkInAuctionReadOnlyState(artwork)) {
    return 'This artwork is part of an auction and is not available for direct purchase.'
  }

  if (artwork.status === 'SOLD' || artwork.isSold === true) {
    return 'This artwork is temporarily out of stock.'
  }

  if (artwork.status !== 'ACTIVE' || artwork.isPublished !== true) {
    return 'This artwork is not currently available for direct purchase.'
  }

  return null
}
