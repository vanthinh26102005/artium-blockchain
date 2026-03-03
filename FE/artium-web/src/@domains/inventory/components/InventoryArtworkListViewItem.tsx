// third-party
import {
  Copy,
  Eye,
  EyeOff,
  Folder,
  Info,
  Link2,
  MoreHorizontal,
  Pencil,
  Repeat2,
  Trash2,
} from 'lucide-react'

// @shared - components
import { Checkbox } from '@shared/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'

// @domains - inventory
import { type InventoryArtwork } from '@domains/inventory/types/inventoryArtwork'
import { useInventorySelectionStore } from '@domains/inventory/stores/useInventorySelectionStore'

type InventoryArtworkListViewItemProps = {
  artwork: InventoryArtwork
  onEdit: (artwork: InventoryArtwork) => void
  onDelete: (artwork: InventoryArtwork) => void
  onMove: (artwork: InventoryArtwork) => void
  onOpenDetails: (artwork: InventoryArtwork) => void
}

const DIMENSIONS_PLACEHOLDER = '36 × 24 × 1.9 in'

export const InventoryArtworkListViewItem = ({
  artwork,
  onEdit,
  onDelete,
  onMove,
  onOpenDetails,
}: InventoryArtworkListViewItemProps) => {
  // -- state --
  const selectedIds = useInventorySelectionStore((state) => state.selectedIds)
  const toggle = useInventorySelectionStore((state) => state.toggle)

  // -- derived --
  const isSelected = selectedIds.includes(artwork.id)
  const priceLabel =
    typeof artwork.price === 'number' ? `US$${artwork.price.toLocaleString('en-US')}` : ''
  const subtitleParts = [priceLabel, artwork.creatorName].filter(Boolean)
  const subtitleLabel = subtitleParts.join(' • ')
  const visibilityLabel = artwork.status === 'Hidden' ? 'Hidden in profile' : 'Draft'

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
    if (typeof window !== 'undefined') {
      window.alert(`Duplicate "${artwork.title}" (stub)`)
    }
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      window.alert(`Copy link for "${artwork.title}" (stub)`)
    }
  }

  const handleChangeToDraft = () => {
    if (typeof window !== 'undefined') {
      window.alert(`Change "${artwork.title}" to Draft (stub)`)
    }
  }

  const handleToggleVisibility = () => {
    if (typeof window !== 'undefined') {
      window.alert(`Show "${artwork.title}" on profile (stub)`)
    }
  }

  // -- render --
  return (
    <div
      className={`cursor-pointer rounded-2xl border border-black/10 bg-white px-4 py-4 ${
        isSelected ? 'ring-1 ring-blue-200' : ''
      }`}
      onClick={handleOpenDetails}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleToggleSelection}
            aria-label={`Select ${artwork.title}`}
            className="mt-1 border-black/30 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
          />
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F5]">
            <img
              src={artwork.thumbnailUrl}
              alt={artwork.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900">{artwork.title}</p>
            {subtitleLabel ? (
              <p className="truncate text-base text-slate-500">{subtitleLabel}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {artwork.status === 'Hidden' && <EyeOff className="h-4 w-4 text-slate-400" />}
            <span className="text-sm font-semibold text-slate-500 uppercase">
              {visibilityLabel}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-slate-500 transition hover:text-slate-700"
                aria-label="Artwork actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              className="w-64 rounded-2xl border-black/10 bg-white p-2 shadow-lg"
            >
              <DropdownMenuItem
                onSelect={handleEdit}
                className="gap-2 px-3 py-2 text-base font-semibold text-slate-900"
              >
                <Pencil className="h-4 w-4 text-slate-600" />
                Edit Artwork
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleChangeToDraft}
                className="gap-2 px-3 py-2 text-base font-semibold text-slate-900"
              >
                <Repeat2 className="h-4 w-4 text-slate-600" />
                Change to Draft
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleMove}
                className="gap-2 px-3 py-2 text-base font-semibold text-slate-900"
              >
                <Folder className="h-4 w-4 text-slate-600" />
                Move to folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleDuplicate}
                className="gap-2 px-3 py-2 text-base font-semibold text-slate-900"
              >
                <Copy className="h-4 w-4 text-slate-600" />
                Duplicate artwork
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleCopyLink}
                className="gap-2 px-3 py-2 text-base font-semibold text-slate-900"
              >
                <Link2 className="h-4 w-4 text-slate-600" />
                Copy link to this artwork
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleToggleVisibility}
                className="gap-2 px-3 py-2 text-base font-semibold text-slate-900"
              >
                <Eye className="h-4 w-4 text-slate-600" />
                Show Artwork on Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleDelete}
                className="gap-2 px-3 py-2 text-base font-semibold text-rose-600"
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
                Delete Artwork
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-3 ml-[2rem] flex items-start gap-8 text-base">
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
