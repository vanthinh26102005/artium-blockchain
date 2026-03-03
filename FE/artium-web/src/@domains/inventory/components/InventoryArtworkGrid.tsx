// @domains - inventory
import { DraggableArtworkItem } from '@domains/inventory/components/DraggableArtworkItem'
import { type InventoryArtwork } from '@domains/inventory/types/inventoryArtwork'

type InventoryArtworkGridProps = {
  artworks: InventoryArtwork[]
  onEdit: (artwork: InventoryArtwork) => void
  onDelete: (artwork: InventoryArtwork) => void
  onMove: (artwork: InventoryArtwork) => void
  onOpenDetails: (artwork: InventoryArtwork) => void
}

export const InventoryArtworkGrid = ({
  artworks,
  onEdit,
  onDelete,
  onMove,
  onOpenDetails,
}: InventoryArtworkGridProps) => {
  // -- state --

  // -- derived --

  // -- handlers --

  // -- render --
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
        />
      ))}
    </div>
  )
}
