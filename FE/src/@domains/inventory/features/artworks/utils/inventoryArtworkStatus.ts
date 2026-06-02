import type { InventoryArtwork } from '../types/inventoryArtwork'

type ArtworkStatusPresentation = {
  label: string
  tone: 'blue' | 'green' | 'amber' | 'rose' | 'slate'
}

const AUCTION_STATUS_PRESENTATION: Record<string, ArtworkStatusPresentation> = {
  pending_start: { label: 'Auction pending', tone: 'blue' },
  auction_active: { label: 'In auction', tone: 'green' },
  start_failed: { label: 'Auction failed', tone: 'rose' },
  retry_available: { label: 'Auction retry', tone: 'amber' },
}

const ARTWORK_STATUS_PRESENTATION: Record<string, ArtworkStatusPresentation> = {
  DRAFT: { label: 'Draft', tone: 'slate' },
  ACTIVE: { label: 'Active', tone: 'green' },
  SOLD: { label: 'Sold', tone: 'slate' },
  RESERVED: { label: 'Reserved', tone: 'amber' },
  INACTIVE: { label: 'Hidden', tone: 'amber' },
  DELETED: { label: 'Deleted', tone: 'rose' },
  PENDING_REVIEW: { label: 'Pending review', tone: 'blue' },
  IN_AUCTION: { label: 'In auction', tone: 'green' },
}

export const getInventoryArtworkStatus = (
  artwork: InventoryArtwork,
): ArtworkStatusPresentation => {
  const auctionStatus = artwork.auctionLifecycle?.status
  if (auctionStatus && AUCTION_STATUS_PRESENTATION[auctionStatus]) {
    return AUCTION_STATUS_PRESENTATION[auctionStatus]
  }

  return (
    ARTWORK_STATUS_PRESENTATION[artwork.status] ??
    ARTWORK_STATUS_PRESENTATION[artwork.backendStatus ?? ''] ?? {
      label: artwork.isPublished ? 'Active' : 'Hidden',
      tone: artwork.isPublished ? 'green' : 'amber',
    }
  )
}

export const getInventoryArtworkVisibilityLabel = (artwork: InventoryArtwork) => {
  if (artwork.status === 'ACTIVE' && artwork.isPublished === true) {
    return 'Published'
  }

  return 'Unpublished'
}

export const getInventoryArtworkStatusClassName = (
  tone: ArtworkStatusPresentation['tone'],
) => {
  switch (tone) {
    case 'green':
      return 'bg-emerald-50 text-emerald-700'
    case 'blue':
      return 'bg-blue-50 text-blue-700'
    case 'amber':
      return 'bg-amber-50 text-amber-700'
    case 'rose':
      return 'bg-rose-50 text-rose-700'
    case 'slate':
    default:
      return 'bg-slate-100 text-slate-600'
  }
}
