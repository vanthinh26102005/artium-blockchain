// third-party
import { EyeOff, Info } from 'lucide-react'

// @shared - components
import { Checkbox } from '@shared/components/ui/checkbox'

// @domains - inventory
import { SellerAuctionDraftBadge } from '@domains/auction/components'
import { useSellerAuctionTermsDraftStatus } from '@domains/auction/hooks/useSellerAuctionTermsDraftStatus'
import { InventoryArtworkActionMenu } from '@domains/inventory/features/artworks/components/InventoryArtworkActionMenu'
import { type InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'
import { useInventorySelectionStore } from '@domains/inventory/core/stores/useInventorySelectionStore'

type InventoryArtworkListViewItemProps = {
  artwork: InventoryArtwork
  onEdit: (artwork: InventoryArtwork) => void
  onDelete: (artwork: InventoryArtwork) => void
  onMove: (artwork: InventoryArtwork) => void
  onOpenDetails: (artwork: InventoryArtwork) => void
  onToggleProfileVisibility: (artwork: InventoryArtwork) => void
  onStartAuction: (artwork: InventoryArtwork) => void
}

/**
 * DIMENSIONS_PLACEHOLDER - React component
 * @returns React element
 */
const DIMENSIONS_PLACEHOLDER = '36 × 24 × 1.9 in'

export const InventoryArtworkListViewItem = ({
  artwork,
  onEdit,
  /**
   * InventoryArtworkListViewItem - React component
   * @returns React element
   */
  onDelete,
  onMove,
  onOpenDetails,
  onToggleProfileVisibility,
  onStartAuction,
}: InventoryArtworkListViewItemProps) => {
  // -- state --
  const selectedIds = useInventorySelectionStore((state) => state.selectedIds)
  const toggle = useInventorySelectionStore((state) => state.toggle)

  // -- derived --
  const isSelected = selectedIds.includes(artwork.id)
  const priceLabel =
    /**
     * selectedIds - Utility function
     * @returns void
     */
    typeof artwork.price === 'number' ? `US$${artwork.price.toLocaleString('en-US')}` : ''
  const subtitleParts = [priceLabel, artwork.creatorName].filter(Boolean)
  const subtitleLabel = subtitleParts.join(' • ')
  const visibilityLabel = artwork.status === 'Hidden' ? 'Hidden in profile' : 'Draft'
  /**
   * toggle - Utility function
   * @returns void
   */
  const hasAuctionDraft = useSellerAuctionTermsDraftStatus(artwork.id)

  // -- handlers --
  const handleToggleSelection = () => {
    toggle(artwork.id)
  }
  /**
   * isSelected - Utility function
   * @returns void
   */

  const handleOpenDetails = () => {
    onOpenDetails(artwork)
  }
  /**
   * priceLabel - Utility function
   * @returns void
   */

  // -- render --
  return (
    <div
      className={`cursor-pointer rounded-2xl border border-black/10 bg-white px-4 py-4 ${
        /**
         * subtitleParts - Utility function
         * @returns void
         */
        isSelected ? 'ring-1 ring-blue-200' : ''
      }`}
      onClick={handleOpenDetails}
    >
      /** * subtitleLabel - Utility function * @returns void */
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Checkbox
            checked={isSelected}
            /**
             * visibilityLabel - Utility function
             * @returns void
             */
            onCheckedChange={handleToggleSelection}
            aria-label={`Select ${artwork.title}`}
            className="mt-1 border-black/30 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
          />
          /** * hasAuctionDraft - Utility function * @returns void */
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F5]">
            <img
              src={artwork.thumbnailUrl}
              alt={artwork.title}
              loading="lazy"
              className="h-full w-full object-cover"
              /**
               * handleToggleSelection - Utility function
               * @returns void
               */
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900">{artwork.title}</p>
            {subtitleLabel ? (
              <p className="truncate text-base text-slate-500">{subtitleLabel}</p>
            ) : null}
            /** * handleOpenDetails - Utility function * @returns void */
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasAuctionDraft ? <SellerAuctionDraftBadge /> : null}
          <div className="flex items-center gap-2">
            {artwork.status === 'Hidden' && <EyeOff className="h-4 w-4 text-slate-400" />}
            <span className="text-sm font-semibold uppercase text-slate-500">
              {visibilityLabel}
            </span>
          </div>
          <InventoryArtworkActionMenu
            artwork={artwork}
            onOpenDetails={onOpenDetails}
            onEdit={onEdit}
            onToggleProfileVisibility={onToggleProfileVisibility}
            onMove={onMove}
            onStartAuction={onStartAuction}
            onDelete={onDelete}
            triggerClassName="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-slate-500 transition hover:text-slate-700"
            contentClassName="w-64 rounded-2xl border-black/10 bg-white p-2 shadow-lg"
          />
        </div>
      </div>
      <div className="ml-[2rem] mt-3 flex items-start gap-8 text-base">
        <div className="flex min-w-0 flex-1 gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-400">Material</span>
              <span className="text-base font-medium text-slate-900">—</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-400">Dimensions</span>
                <Info className="h-3 w-3 text-slate-400" />
              </div>
              <span className="text-base font-medium text-slate-900">{DIMENSIONS_PLACEHOLDER}</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-400">Location</span>
              <span className="text-base font-medium text-slate-900">—</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-400">Listing status</span>
              <span className="text-base font-medium text-slate-900">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
