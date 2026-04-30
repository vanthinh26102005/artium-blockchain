import type { UpdateArtworkInput } from '@shared/apis/artworkApis'
import type { InventoryArtwork } from '@domains/inventory/types/inventoryArtwork'

const LOCKED_EDIT_LIFECYCLE_STATUSES = new Set([
  'pending_start',
  'auction_active',
  'retry_available',
  'start_failed',
])

const HIDDEN_AUCTION_HANDOFF_STATUSES = new Set(['pending_start', 'auction_active'])

export const isArtworkEditLocked = (artwork: InventoryArtwork) => {
  const lifecycle = artwork.auctionLifecycle

  if (!lifecycle?.status) {
    return false
  }

  return LOCKED_EDIT_LIFECYCLE_STATUSES.has(lifecycle.status) && lifecycle.editAllowed !== true
}

export const getProfileVisibilityLabel = (artwork: InventoryArtwork) =>
  artwork.isPublished ? 'Hide Artwork from Profile' : 'Show Artwork on Profile'

export const getProfileVisibilityPatch = (artwork: InventoryArtwork): UpdateArtworkInput => {
  const shouldPublish = !artwork.isPublished

  return {
    status: shouldPublish ? 'ACTIVE' : 'INACTIVE',
    isPublished: shouldPublish,
  }
}

export const getEditArtworkHref = (artwork: InventoryArtwork) => ({
  pathname: '/artworks/upload',
  query: { artworkId: artwork.id },
})

export const getAuctionHandoffHref = (artwork: InventoryArtwork) => ({
  pathname: '/artist/auctions/create',
  query: { artworkId: artwork.id },
})

export const getAuctionHandoffLabel = (artwork: InventoryArtwork) => {
  const status = artwork.auctionLifecycle?.status

  if (status === 'retry_available' || status === 'start_failed') {
    return 'Resume Auction Setup'
  }

  return 'Start Auction'
}

export const canShowAuctionHandoff = (artwork: InventoryArtwork) => {
  const status = artwork.auctionLifecycle?.status

  if (!status) {
    return true
  }

  return !HIDDEN_AUCTION_HANDOFF_STATUSES.has(status)
}
