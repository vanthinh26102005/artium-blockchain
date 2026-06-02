import type { UpdateArtworkInput } from '@shared/apis/artworkApis'
import type { InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'

const LOCKED_EDIT_LIFECYCLE_STATUSES = new Set([
  'pending_start',
  'auction_active',
  'retry_available',
])

const HIDDEN_AUCTION_HANDOFF_STATUSES = new Set(['pending_start', 'auction_active'])
const PUBLISH_TOGGLE_STATUSES = new Set<InventoryArtwork['status']>([
  'ACTIVE',
  'DRAFT',
  'INACTIVE',
])

export const isArtworkEditLocked = (artwork: InventoryArtwork) => {
  const lifecycle = artwork.auctionLifecycle

  if (!lifecycle?.status) {
    return false
  }

  if (lifecycle.status === 'start_failed') {
    return lifecycle.editAllowed !== true
  }

  return LOCKED_EDIT_LIFECYCLE_STATUSES.has(lifecycle.status)
}

export const isArtworkPublished = (artwork: InventoryArtwork) =>
  artwork.status === 'ACTIVE' && artwork.isPublished === true

export const getProfileVisibilityLabel = (artwork: InventoryArtwork) =>
  isArtworkPublished(artwork) ? 'Unpublish Artwork' : 'Publish Artwork'

export const canToggleProfileVisibility = (artwork: InventoryArtwork) =>
  PUBLISH_TOGGLE_STATUSES.has(artwork.status) && !isArtworkEditLocked(artwork)

export const getProfileVisibilityPatch = (artwork: InventoryArtwork): UpdateArtworkInput => {
  if (isArtworkPublished(artwork)) {
    return {
      status: 'INACTIVE',
      isPublished: false,
    }
  }

  return {
    status: 'ACTIVE',
    isPublished: true,
  }
}

export const getEditArtworkHref = (artwork: InventoryArtwork) => ({
  pathname: '/artworks/edit/[artworkId]',
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
