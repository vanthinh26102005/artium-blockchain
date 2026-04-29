// react
import { CSSProperties } from 'react'

// third-party
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// @domains - inventory
import { InventoryArtworkGridViewItem } from './InventoryArtworkGridViewItem'
import { type InventoryArtwork } from '@domains/inventory/types/inventoryArtwork'

type DraggableArtworkItemProps = {
  artwork: InventoryArtwork
  onEdit: (artwork: InventoryArtwork) => void
  onDelete: (artwork: InventoryArtwork) => void
  onMove: (artwork: InventoryArtwork) => void
  onOpenDetails: (artwork: InventoryArtwork) => void
  onToggleProfileVisibility: (artwork: InventoryArtwork) => void
  onStartAuction: (artwork: InventoryArtwork) => void
}

export const DraggableArtworkItem = ({
  artwork,
  onEdit,
  onDelete,
  onMove,
  onOpenDetails,
  onToggleProfileVisibility,
  onStartAuction,
}: DraggableArtworkItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: artwork.id,
    data: { type: 'Artwork', artwork },
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
    position: 'relative',
    touchAction: 'none',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <InventoryArtworkGridViewItem
        artwork={artwork}
        onEdit={onEdit}
        onDelete={onDelete}
        onMove={onMove}
        onOpenDetails={onOpenDetails}
        onToggleProfileVisibility={onToggleProfileVisibility}
        onStartAuction={onStartAuction}
      />
    </div>
  )
}
