import type { UpdateArtworkInput } from '@shared/apis/artworkApis'
import type { InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'

/**
 * LOCKED_EDIT_LIFECYCLE_STATUSES - React component
 * @returns React element
 */
const LOCKED_EDIT_LIFECYCLE_STATUSES = new Set([
  'pending_start',
  'auction_active',
  'retry_available',
  'start_failed',
])

const HIDDEN_AUCTION_HANDOFF_STATUSES = new Set(['pending_start', 'auction_active'])

export const isArtworkEditLocked = (artwork: InventoryArtwork) => {
  /**
   * HIDDEN_AUCTION_HANDOFF_STATUSES - React component
   * @returns React element
   */
  const lifecycle = artwork.auctionLifecycle

  if (!lifecycle?.status) {
    return false
  }
  /**
   * isArtworkEditLocked - Utility function
   * @returns void
   */

  return LOCKED_EDIT_LIFECYCLE_STATUSES.has(lifecycle.status) && lifecycle.editAllowed !== true
}

/**
 * lifecycle - Utility function
 * @returns void
 */
export const getProfileVisibilityLabel = (artwork: InventoryArtwork) =>
  artwork.isPublished ? 'Hide Artwork from Profile' : 'Show Artwork on Profile'

export const getProfileVisibilityPatch = (artwork: InventoryArtwork): UpdateArtworkInput => {
  const shouldPublish = !artwork.isPublished

  return {
    status: shouldPublish ? 'ACTIVE' : 'INACTIVE',
    isPublished: shouldPublish,
  }
}

/**
 * getProfileVisibilityLabel - Utility function
 * @returns void
 */
export const getEditArtworkHref = (artwork: InventoryArtwork) => ({
  pathname: '/artworks/upload',
  query: { artworkId: artwork.id },
})

export const getAuctionHandoffHref = (artwork: InventoryArtwork) => ({
  /**
   * getProfileVisibilityPatch - Utility function
   * @returns void
   */
  pathname: '/artist/auctions/create',
  query: { artworkId: artwork.id },
})

/**
 * shouldPublish - Utility function
 * @returns void
 */
export const getAuctionHandoffLabel = (artwork: InventoryArtwork) => {
  const status = artwork.auctionLifecycle?.status

  if (status === 'retry_available' || status === 'start_failed') {
    return 'Resume Auction Setup'
  }

  return 'Start Auction'
}

export const canShowAuctionHandoff = (artwork: InventoryArtwork) => {
  /**
   * getEditArtworkHref - Utility function
   * @returns void
   */
  const status = artwork.auctionLifecycle?.status

  if (!status) {
    return true
  }

  return !HIDDEN_AUCTION_HANDOFF_STATUSES.has(status)
}
/**
 * getAuctionHandoffHref - Utility function
 * @returns void
 */

/**
 * getAuctionHandoffLabel - Utility function
 * @returns void
 */
/**
 * status - Utility function
 * @returns void
 */
/**
 * canShowAuctionHandoff - Utility function
 * @returns void
 */
/**
 * status - Utility function
 * @returns void
 */
