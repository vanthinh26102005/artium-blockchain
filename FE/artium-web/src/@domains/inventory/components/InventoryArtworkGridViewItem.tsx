// third-party
import { Copy, Eye, Folder, Link2, MoreHorizontal, Pencil, Repeat2, Trash2 } from 'lucide-react'

// @shared - components
import { Checkbox } from '@shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'

// @domains - inventory
import {
  type InventoryArtwork,
  type InventoryArtworkStatus,
} from '@domains/inventory/types/inventoryArtwork'
import { useInventorySelectionStore } from '@domains/inventory/stores/useInventorySelectionStore'

type InventoryArtworkGridViewItemProps = {
  artwork: InventoryArtwork
  onEdit: (artwork: InventoryArtwork) => void
  onDelete: (artwork: InventoryArtwork) => void
  onMove: (artwork: InventoryArtwork) => void
  onOpenDetails: (artwork: InventoryArtwork) => void
}

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
  onDelete,
  onMove,
  onOpenDetails,
}: InventoryArtworkGridViewItemProps) => {
  // -- state --
  const selectedIds = useInventorySelectionStore((state) => state.selectedIds)
  const toggle = useInventorySelectionStore((state) => state.toggle)

  // -- derived --
  const statusConfig = STATUS_CONFIG[artwork.status] ?? STATUS_CONFIG.Hidden
  const priceLabel =
    typeof artwork.price === 'number' ? `US$${artwork.price.toLocaleString('en-US')}` : null
  const isSelected = selectedIds.includes(artwork.id)

  // -- handlers --
  const handleToggleSelection = () => {
    toggle(artwork.id)
  }

  const handleEdit = () => {
    onEdit(artwork)
  }

  const handleDelete = () => {
    onDelete(artwork)
  }

  const handleMove = () => {
    onMove(artwork)
  }

  const handleOpenDetails = () => {
    onOpenDetails(artwork)
  }

  const handleDuplicate = () => {
    // Feature requires BE support - disabled for now
  }

  const handleCopyLink = async () => {
    const artworkUrl = `${window.location.origin}/artworks/${artwork.id}`
    try {
      await navigator.clipboard.writeText(artworkUrl)
      // Could show toast here if we had access to toast context
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = artworkUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }

  const handleChangeToDraft = () => {
    // Feature requires BE API - disabled for now
  }

  const handleToggleVisibility = () => {
    // Feature requires BE API - disabled for now
  }

  // -- render --
  return (
    <article
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200 hover:shadow-xl ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-black/5'
      }`}
      onClick={handleOpenDetails}
    >
      {/* Selection & Actions Overlay */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4">
        <div
          className={`transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleToggleSelection}
            aria-label={`Select ${artwork.title}`}
            className="h-5 w-5 rounded border-2 border-white bg-white shadow-md data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
          />
        </div>
        <div
          className={`transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white hover:shadow-lg"
                aria-label="Artwork actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              className="w-64 rounded-2xl border-black/5 bg-white/98 p-2 shadow-xl backdrop-blur-xl"
            >
              <DropdownMenuItem
                onSelect={handleEdit}
                className="gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-900 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4 text-slate-600" />
                Edit Artwork
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                className="gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-400 cursor-not-allowed"
              >
                <Repeat2 className="h-4 w-4 text-slate-400" />
                Change to Draft
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleMove}
                className="gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-900 hover:bg-slate-50"
              >
                <Folder className="h-4 w-4 text-slate-600" />
                Move to folder
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                className="gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-400 cursor-not-allowed"
              >
                <Copy className="h-4 w-4 text-slate-400" />
                Duplicate artwork
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleCopyLink}
                className="gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-900 hover:bg-slate-50"
              >
                <Link2 className="h-4 w-4 text-slate-600" />
                Copy link to this artwork
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled
                className="gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-400 cursor-not-allowed"
              >
                <Eye className="h-4 w-4 text-slate-400" />
                Show Artwork on Profile
              </DropdownMenuItem>
              <div className="my-1 h-px bg-black/5" />
              <DropdownMenuItem
                onSelect={handleDelete}
                className="gap-3 rounded-xl px-4 py-3 text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
                Delete Artwork
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            className="ml-auto text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-slate-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-lg leading-snug font-semibold text-slate-900">
          {artwork.title}
        </h3>

        {/* Price or Status */}
        <div className="flex items-center gap-2">
          {priceLabel ? (
            <>
              <span className="text-xl font-bold text-blue-600">●</span>
              <span className="text-base font-semibold text-slate-900">{priceLabel}</span>
            </>
          ) : (
            <>
              <span className={`text-lg ${statusConfig.className}`}>{statusConfig.icon}</span>
              <span className={`text-base font-medium ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
