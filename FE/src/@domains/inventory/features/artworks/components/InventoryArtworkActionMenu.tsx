// third-party
import {
  Eye,
  EyeOff,
  Folder,
  Gavel,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'

// @shared - components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'

// @domains - inventory
import { type InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'
import {
  canShowAuctionHandoff,
  getAuctionHandoffLabel,
  getProfileVisibilityLabel,
  isArtworkEditLocked,
} from '@domains/inventory/features/artworks/utils/inventoryArtworkActions'

type InventoryArtworkActionMenuProps = {
  artwork: InventoryArtwork
  onOpenDetails: (artwork: InventoryArtwork) => void
  onEdit: (artwork: InventoryArtwork) => void
  onToggleProfileVisibility: (artwork: InventoryArtwork) => void
  onMove: (artwork: InventoryArtwork) => void
  onStartAuction: (artwork: InventoryArtwork) => void
  onDelete: (artwork: InventoryArtwork) => void
  triggerClassName?: string
  contentClassName?: string
}

export const InventoryArtworkActionMenu = ({
  artwork,
  onOpenDetails,
  onEdit,
  onToggleProfileVisibility,
  onMove,
  onStartAuction,
  onDelete,
  triggerClassName,
  contentClassName,
}: InventoryArtworkActionMenuProps) => {
  // -- derived --
  const isEditLocked = isArtworkEditLocked(artwork)
  const profileVisibilityLabel =
    getProfileVisibilityLabel(artwork) === 'Hide Artwork from Profile'
      ? 'Hide Artwork from Profile'
      : 'Show Artwork on Profile'
  const auctionHandoffLabel =
    getAuctionHandoffLabel(artwork) === 'Resume Auction Setup'
      ? 'Resume Auction Setup'
      : 'Start Auction'
  const showAuctionHandoff = canShowAuctionHandoff(artwork)

  // -- render --
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          className={triggerClassName}
          aria-label={`Actions for ${artwork.title}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        className={contentClassName}
      >
        <DropdownMenuItem
          onSelect={() => onOpenDetails(artwork)}
          className="cursor-pointer gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-900"
        >
          <Eye className="h-4 w-4 text-slate-600" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isEditLocked}
          onSelect={() => onEdit(artwork)}
          className="cursor-pointer gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-900 data-[disabled]:cursor-not-allowed data-[disabled]:text-slate-400"
        >
          <Pencil className="h-4 w-4 text-slate-600" />
          Edit Artwork
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onToggleProfileVisibility(artwork)}
          className="cursor-pointer gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-900"
        >
          {artwork.isPublished ? (
            <EyeOff className="h-4 w-4 text-slate-600" />
          ) : (
            <Eye className="h-4 w-4 text-slate-600" />
          )}
          {profileVisibilityLabel}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onMove(artwork)}
          className="cursor-pointer gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-900"
        >
          <Folder className="h-4 w-4 text-slate-600" />
          Move to Folder
        </DropdownMenuItem>
        {showAuctionHandoff ? (
          <DropdownMenuItem
            onSelect={() => onStartAuction(artwork)}
            className="cursor-pointer gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-900"
          >
            <Gavel className="h-4 w-4 text-slate-600" />
            {auctionHandoffLabel}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator className="my-1 bg-black/5" />
        <DropdownMenuItem
          onSelect={() => onDelete(artwork)}
          className="cursor-pointer gap-3 rounded-xl px-4 py-3 text-base font-medium text-rose-600 focus:text-rose-600"
        >
          <Trash2 className="h-4 w-4 text-rose-500" />
          Delete Artwork
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
