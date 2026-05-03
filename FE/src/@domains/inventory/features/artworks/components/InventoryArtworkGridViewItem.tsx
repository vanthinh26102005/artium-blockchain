// @shared - components
import { Checkbox } from '@shared/components/ui/checkbox'
import { OrderStatusBadge } from '@domains/orders/components/OrderStatusBadge'

// @domains - inventory
import { SellerAuctionDraftBadge } from '@domains/auction/components'
import { useSellerAuctionTermsDraftStatus } from '@domains/auction/hooks/useSellerAuctionTermsDraftStatus'
import { InventoryArtworkActionMenu } from '@domains/inventory/features/artworks/components/InventoryArtworkActionMenu'
import {
  type InventoryArtwork,
  type InventoryArtworkStatus,
} from '@domains/inventory/features/artworks/types/inventoryArtwork'
import { useInventorySelectionStore } from '@domains/inventory/core/stores/useInventorySelectionStore'

type InventoryArtworkGridViewItemProps = {
  artwork: InventoryArtwork
  onEdit: (artwork: InventoryArtwork) => void
  onDelete: (artwork: InventoryArtwork) => void
  onMove: (artwork: InventoryArtwork) => void
  onOpenDetails: (artwork: InventoryArtwork) => void
  onToggleProfileVisibility: (artwork: InventoryArtwork) => void
  onStartAuction: (artwork: InventoryArtwork) => void
}

/**
 * STATUS_CONFIG - React component
 * @returns React element
 */
const STATUS_CONFIG: Record<
  InventoryArtworkStatus,
  { icon: string; label: string; className: string }
> = {
  Draft: {
    icon: '○',
    label: 'Draft',
    className: 'text-slate-500',
  },
  Hidden: {
    icon: '◉',
    label: 'Hidden',
    className: 'text-amber-600',
  },
}

export const InventoryArtworkGridViewItem = ({
  artwork,
  onEdit,
  /**
   * InventoryArtworkGridViewItem - React component
   * @returns React element
   */
  onDelete,
  onMove,
  onOpenDetails,
  onToggleProfileVisibility,
  onStartAuction,
}: InventoryArtworkGridViewItemProps) => {
  // -- state --
  const selectedIds = useInventorySelectionStore((state) => state.selectedIds)
  const toggle = useInventorySelectionStore((state) => state.toggle)

  // -- derived --
  const statusConfig = STATUS_CONFIG[artwork.status] ?? STATUS_CONFIG.Hidden
  const hasAuctionDraft = useSellerAuctionTermsDraftStatus(artwork.id)
  /**
   * selectedIds - Utility function
   * @returns void
   */
  const priceLabel =
    typeof artwork.price === 'number' ? `US$${artwork.price.toLocaleString('en-US')}` : null
  const isSelected = selectedIds.includes(artwork.id)
  const visibilityLabel = artwork.status === 'Hidden' ? 'Hidden in profile' : 'Draft'
  /**
   * toggle - Utility function
   * @returns void
   */

  // -- handlers --
  const handleToggleSelection = () => {
    toggle(artwork.id)
  }

  /**
   * statusConfig - Utility function
   * @returns void
   */
  const handleOpenDetails = () => {
    onOpenDetails(artwork)
  }

  /**
   * hasAuctionDraft - Utility function
   * @returns void
   */
  // -- render --
  return (
    <article
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200 hover:shadow-xl ${
        /**
         * priceLabel - Utility function
         * @returns void
         */
        isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-black/5'
      }`}
      onClick={handleToggleSelection}
    >
      {/* Selection & Actions Overlay */}
      /** * isSelected - Utility function * @returns void */
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4">
        <div
          className={`transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            /**
             * visibilityLabel - Utility function
             * @returns void
             */
          }`}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleToggleSelection}
            aria-label={`Select ${artwork.title}`}
            /**
             * handleToggleSelection - Utility function
             * @returns void
             */
            className="h-5 w-5 rounded border-2 border-white bg-white shadow-md data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
          />
        </div>
        <div className="flex flex-col items-end gap-2">
          {hasAuctionDraft ? <SellerAuctionDraftBadge /> : null}
          <div
            className={`transition-opacity ${
              /**
               * handleOpenDetails - Utility function
               * @returns void
               */
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <InventoryArtworkActionMenu
              artwork={artwork}
              onOpenDetails={onOpenDetails}
              onEdit={onEdit}
              onToggleProfileVisibility={onToggleProfileVisibility}
              onMove={onMove}
              onStartAuction={onStartAuction}
              onDelete={onDelete}
              triggerClassName="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:shadow-lg"
              contentClassName="w-64 rounded-2xl border-black/5 bg-white/98 p-2 shadow-xl backdrop-blur-xl"
            />
          </div>
        </div>
      </div>
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50">
        <img
          src={artwork.thumbnailUrl}
          alt={artwork.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </div>
      {/* Info Container */}
      <div className="flex flex-col gap-3 p-4">
        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
            {/* Placeholder for user avatar - replace with actual avatar if available */}
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-sm font-bold text-white">
              {artwork.creatorName.charAt(0).toUpperCase()}
            </div>
          </div>
          <span className="text-base font-medium text-slate-600">{artwork.creatorName}</span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900">
          {artwork.title}
        </h3>

        {/* Price and lifecycle */}
        <div className="flex flex-wrap items-center gap-2">
          {priceLabel ? (
            <>
              <span className="text-xl font-bold text-blue-600">●</span>
              <span className="text-base font-semibold text-slate-900">{priceLabel}</span>
            </>
          ) : null}
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
              artwork.status === 'Hidden'
                ? 'bg-slate-100 text-slate-600'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            <span className={`text-base leading-none ${statusConfig.className}`}>
              {statusConfig.icon}
            </span>
            {visibilityLabel}
          </span>
          {artwork.auctionLifecycle ? (
            <OrderStatusBadge status={artwork.auctionLifecycle.status} />
          ) : null}
        </div>
      </div>
    </article>
  )
}
