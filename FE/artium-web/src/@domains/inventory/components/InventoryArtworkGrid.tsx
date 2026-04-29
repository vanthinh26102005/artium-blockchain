// third-party
import { ImageIcon } from 'lucide-react'

// @domains - inventory
import { DraggableArtworkItem } from '@domains/inventory/components/DraggableArtworkItem'
import { type InventoryArtwork } from '@domains/inventory/types/inventoryArtwork'

type InventoryArtworkGridProps = {
  artworks: InventoryArtwork[]
  onEdit: (artwork: InventoryArtwork) => void
  onDelete: (artwork: InventoryArtwork) => void
  onMove: (artwork: InventoryArtwork) => void
  onOpenDetails: (artwork: InventoryArtwork) => void
  onToggleProfileVisibility: (artwork: InventoryArtwork) => void
  onStartAuction: (artwork: InventoryArtwork) => void
  emptyMessage?: string
}

export const InventoryArtworkGrid = ({
  artworks,
  onEdit,
  onDelete,
  onMove,
  onOpenDetails,
  onToggleProfileVisibility,
  onStartAuction,
  emptyMessage = 'No artworks found',
}: InventoryArtworkGridProps) => {
  // -- render --
  if (artworks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <ImageIcon className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">{emptyMessage}</h3>
        <p className="mt-1 text-sm text-slate-500">
          Upload your first artwork or adjust your filters
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {artworks.map((artwork) => (
        <DraggableArtworkItem
          key={artwork.id}
          artwork={artwork}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
          onOpenDetails={onOpenDetails}
          onToggleProfileVisibility={onToggleProfileVisibility}
          onStartAuction={onStartAuction}
        />
      ))}
    </div>
  )
}
