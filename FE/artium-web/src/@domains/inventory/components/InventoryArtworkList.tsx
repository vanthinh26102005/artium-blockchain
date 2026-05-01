// react
import { useMemo, useState } from 'react'

// next
import Link from 'next/link'
import Image from 'next/image'

// third-party
import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  EyeOff,
  Folder,
  FolderInput,
  FolderOpen,
  GripVertical,
  ImageIcon,
  MoreHorizontal,
  Move,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react'

// @shared - components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'
import { Checkbox } from '@shared/components/ui/checkbox'
import { cn } from '@shared/lib/utils'

// @domains - inventory
import { useInventorySelectionStore } from '@domains/inventory/stores/useInventorySelectionStore'
import { type InventoryArtwork } from '@domains/inventory/types/inventoryArtwork'
import { type InventoryFolder } from '@domains/inventory/types/inventoryFolder'

type FolderWithCount = InventoryFolder & { itemCount: number }

type InventoryArtworkListProps = {
  artworks: InventoryArtwork[]
  folders?: FolderWithCount[]
  forceFlatList?: boolean
  onEdit: (artwork: InventoryArtwork) => void
  onDelete: (artwork: InventoryArtwork) => void
  onMove: (artwork: InventoryArtwork) => void
  onOpenDetails: (artwork: InventoryArtwork) => void
  onRenameFolder?: (folder: InventoryFolder) => void
  onDeleteFolder?: (folder: InventoryFolder) => void
  onHideFolder?: (folder: InventoryFolder) => void
  onReorderFolders?: (oldIndex: number, newIndex: number) => void
  onMoveArtworkToFolder?: (artworkId: string, folderId: string | null) => void
  onMoveFolderToFolder?: (folderId: string, newParentId: string | null) => void
}

export const InventoryArtworkList = ({
  artworks,
  folders = [],
  forceFlatList = false,
  onEdit,
  onDelete,
  onMove,
  onOpenDetails,
  onRenameFolder,
  onDeleteFolder,
  onHideFolder,
  onReorderFolders,
  onMoveArtworkToFolder,
  onMoveFolderToFolder,
}: InventoryArtworkListProps) => {
  // -- state --
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [draggedFolderIndex, setDraggedFolderIndex] = useState<number | null>(null)
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null)
  const [dragOverFolderIndex, setDragOverFolderIndex] = useState<number | null>(null)
  const [draggedArtworkId, setDraggedArtworkId] = useState<string | null>(null)
  const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(null)
  const [folderDropTargetId, setFolderDropTargetId] = useState<string | null>(null)

  const selectedIds = useInventorySelectionStore((state) => state.selectedIds)
  const toggle = useInventorySelectionStore((state) => state.toggle)

  // -- derived --
  // Build folder tree structure
  const { rootFolders, childFoldersMap } = useMemo(() => {
    const childMap = new Map<string | null, FolderWithCount[]>()

    folders.forEach((folder) => {
      const parentId = folder.parentId || null
      const existing = childMap.get(parentId) || []
      childMap.set(parentId, [...existing, folder])
    })

    return {
      rootFolders: childMap.get(null) || [],
      childFoldersMap: childMap,
    }
  }, [folders])

  // Group artworks by folder
  const artworksByFolder = useMemo(() => {
    const grouped = new Map<string | null, InventoryArtwork[]>()

    artworks.forEach((artwork) => {
      const folderId = artwork.folderId || null
      const existing = grouped.get(folderId) || []
      grouped.set(folderId, [...existing, artwork])
    })

    return grouped
  }, [artworks])

  // Artworks without folder (root level)
  const rootArtworks = useMemo(() => {
    return artworksByFolder.get(null) || []
  }, [artworksByFolder])

  // -- handlers --
  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  // Check if folder can be dropped into another (prevent circular references)
  const canDropFolderInto = (draggedId: string, targetId: string): boolean => {
    if (draggedId === targetId) return false

    // Check if target is a descendant of dragged folder
    const checkDescendant = (folderId: string): boolean => {
      const children = childFoldersMap.get(folderId) || []
      for (const child of children) {
        if (child.id === targetId) return true
        if (checkDescendant(child.id)) return true
      }
      return false
    }

    return !checkDescendant(draggedId)
  }

  // Folder drag handlers for reordering
  const handleFolderDragStart = (index: number, folderId: string) => (e: React.DragEvent) => {
    setDraggedFolderIndex(index)
    setDraggedFolderId(folderId)
    setDraggedArtworkId(null)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('type', 'folder')
    e.dataTransfer.setData('folderId', folderId)
  }

  const handleFolderDragOver = (index: number, folderId: string) => (e: React.DragEvent) => {
    e.preventDefault()

    // Check if dragging a folder
    if (draggedFolderId) {
      // If dragging over a different folder, show as drop target for nesting
      if (draggedFolderId !== folderId && canDropFolderInto(draggedFolderId, folderId)) {
        e.dataTransfer.dropEffect = 'move'
        setFolderDropTargetId(folderId)
        setDragOverFolderIndex(null)
      } else if (draggedFolderIndex !== null && draggedFolderIndex !== index) {
        // Same level reordering
        e.dataTransfer.dropEffect = 'move'
        setDragOverFolderIndex(index)
        setFolderDropTargetId(null)
      }
    }
  }

  const handleFolderDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the folder entirely
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverFolderIndex(null)
      setFolderDropTargetId(null)
    }
  }

  const handleFolderDrop = (index: number, targetFolderId: string) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFolderId = e.dataTransfer.getData('folderId')

    if (droppedFolderId && droppedFolderId !== targetFolderId) {
      // Move folder into another folder
      if (folderDropTargetId === targetFolderId && canDropFolderInto(droppedFolderId, targetFolderId)) {
        onMoveFolderToFolder?.(droppedFolderId, targetFolderId)
      } else if (draggedFolderIndex !== null && draggedFolderIndex !== index) {
        // Reorder folders at same level
        onReorderFolders?.(draggedFolderIndex, index)
      }
    }

    setDraggedFolderIndex(null)
    setDraggedFolderId(null)
    setDragOverFolderIndex(null)
    setFolderDropTargetId(null)
  }

  const handleFolderDragEnd = () => {
    setDraggedFolderIndex(null)
    setDraggedFolderId(null)
    setDragOverFolderIndex(null)
    setFolderDropTargetId(null)
  }

  // Artwork drag handlers
  const handleArtworkDragStart = (artworkId: string) => (e: React.DragEvent) => {
    setDraggedArtworkId(artworkId)
    setDraggedFolderIndex(null)
    setDraggedFolderId(null)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('artworkId', artworkId)
  }

  const handleArtworkDragEnd = () => {
    setDraggedArtworkId(null)
    setDropTargetFolderId(null)
  }

  // Folder as drop target for artworks
  const handleFolderDropTarget = (folderId: string) => (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedArtworkId) {
      e.dataTransfer.dropEffect = 'move'
      setDropTargetFolderId(folderId)
    }
  }

  const handleFolderDropTargetLeave = () => {
    setDropTargetFolderId(null)
  }

  const handleArtworkDropOnFolder = (folderId: string) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const artworkId = e.dataTransfer.getData('artworkId')
    if (artworkId && onMoveArtworkToFolder) {
      onMoveArtworkToFolder(artworkId, folderId)
    }
    setDropTargetFolderId(null)
    setDraggedArtworkId(null)
  }

  // Move folder to root
  const handleMoveToRoot = (folder: InventoryFolder) => {
    if (folder.parentId) {
      onMoveFolderToFolder?.(folder.id, null)
    }
  }

  // -- render helpers --
  const renderArtworkRow = (artwork: InventoryArtwork, nestLevel = 0) => {
    const isSelected = selectedIds.includes(artwork.id)
    const isDragging = draggedArtworkId === artwork.id

    return (
      <div
        key={artwork.id}
        draggable
        onDragStart={handleArtworkDragStart(artwork.id)}
        onDragEnd={handleArtworkDragEnd}
        style={{ marginLeft: nestLevel > 0 ? `${nestLevel * 24}px` : undefined }}
        className={cn(
          'group flex items-center gap-4 rounded-xl border bg-white px-4 py-3 transition-all',
          isSelected ? 'border-primary/30 bg-primary/5' : 'border-slate-100 hover:border-slate-200',
          isDragging && 'opacity-50 shadow-lg',
        )}
      >
        {/* Drag handle */}
        <button
          type="button"
          className="cursor-grab text-slate-300 transition hover:text-slate-500 active:cursor-grabbing"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggle(artwork.id)}
          className="h-5 w-5"
        />

        {/* Thumbnail */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {artwork.thumbnailUrl ? (
            <Image
              src={artwork.thumbnailUrl}
              alt={artwork.title}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-6 w-6 text-slate-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900">{artwork.title}</h3>
          <p className="truncate text-xs text-slate-500">
            {artwork.creatorName || 'Unknown Artist'}
            {artwork.price && ` • $${artwork.price.toLocaleString()}`}
          </p>
        </div>

        {/* Status badge */}
        <div
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium',
            artwork.status === 'Draft' && 'bg-amber-50 text-amber-700',
            artwork.status === 'Hidden' && 'bg-slate-100 text-slate-600',
          )}
        >
          {artwork.status}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 bg-white p-1">
            <DropdownMenuItem
              onSelect={() => onOpenDetails(artwork)}
              className="cursor-pointer gap-2 rounded-lg px-3 py-2"
            >
              <Eye className="h-4 w-4 text-slate-500" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onEdit(artwork)}
              className="cursor-pointer gap-2 rounded-lg px-3 py-2"
            >
              <Pencil className="h-4 w-4 text-slate-500" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onMove(artwork)}
              className="cursor-pointer gap-2 rounded-lg px-3 py-2"
            >
              <Move className="h-4 w-4 text-slate-500" />
              Move to Folder
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onDelete(artwork)}
              className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  const renderFolderRow = (folder: FolderWithCount, index: number, nestLevel = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const folderArtworks = artworksByFolder.get(folder.id) || []
    const childFolders = childFoldersMap.get(folder.id) || []
    const isDragging = draggedFolderId === folder.id
    const isDragOver = dragOverFolderIndex === index && nestLevel === 0
    const isDropTarget = dropTargetFolderId === folder.id
    const isFolderDropTarget = folderDropTargetId === folder.id

    return (
      <div key={folder.id} className="space-y-2">
        {/* Folder header */}
        <div
          draggable
          onDragStart={handleFolderDragStart(index, folder.id)}
          onDragOver={handleFolderDragOver(index, folder.id)}
          onDragLeave={handleFolderDragLeave}
          onDrop={handleFolderDrop(index, folder.id)}
          onDragEnd={handleFolderDragEnd}
          style={{ marginLeft: nestLevel > 0 ? `${nestLevel * 24}px` : undefined }}
          className={cn(
            'group relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all',
            isDragging && 'opacity-50',
            isDragOver && 'border-blue-400 bg-blue-50',
            isDropTarget && 'border-green-400 bg-green-50 ring-2 ring-green-200',
            isFolderDropTarget && 'border-violet-400 bg-violet-50 ring-2 ring-violet-200',
            !isDragging && !isDragOver && !isDropTarget && !isFolderDropTarget &&
            (nestLevel > 0
              ? 'border-black bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100'
              : 'border-black bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100'),
          )}
        >
          {/* Drop zone overlay for artwork/folder drops */}
          <div
            className="absolute inset-0 rounded-xl"
            onDragOver={(e) => {
              handleFolderDropTarget(folder.id)(e)
              handleFolderDragOver(index, folder.id)(e)
            }}
            onDragLeave={(e) => {
              handleFolderDropTargetLeave()
              handleFolderDragLeave(e)
            }}
            onDrop={(e) => {
              if (draggedArtworkId) {
                handleArtworkDropOnFolder(folder.id)(e)
              } else {
                handleFolderDrop(index, folder.id)(e)
              }
            }}
          />

          {/* Nested indicator */}
          {nestLevel > 0 && (
            <CornerDownRight className="relative z-10 h-4 w-4 text-orange-400" />
          )}

          {/* Drag handle */}
          <button
            type="button"
            className={cn(
              "relative z-10 cursor-grab transition active:cursor-grabbing",
              nestLevel > 0 ? 'text-orange-400 hover:text-orange-600' : 'text-amber-400 hover:text-amber-600'
            )}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Expand/collapse button */}
          <button
            type="button"
            onClick={() => toggleFolderExpanded(folder.id)}
            className={cn(
              "relative z-10 flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-amber-200/50",
              nestLevel > 0 ? 'text-orange-600' : 'text-amber-600'
            )}
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>

          {/* Folder icon */}
          <div className={cn(
            "relative z-10 flex h-10 w-10 items-center justify-center rounded-xl",
            nestLevel > 0 ? 'bg-orange-100' : 'bg-amber-100'
          )}>
            {isExpanded ? (
              <FolderOpen className={cn("h-5 w-5", nestLevel > 0 ? 'text-orange-600' : 'text-amber-600')} />
            ) : (
              <Folder className={cn("h-5 w-5", nestLevel > 0 ? 'text-orange-600' : 'text-amber-600')} />
            )}
          </div>

          {/* Folder name and count */}
          <div className="relative z-10 min-w-0 flex-1">
            <Link
              href={`/inventory/folder/${folder.id}`}
              className="truncate text-base font-semibold text-slate-900 hover:underline"
            >
              {folder.name}
            </Link>
            <p className="text-xs text-slate-500">
              {folder.itemCount} {folder.itemCount === 1 ? 'artwork' : 'artworks'}
              {childFolders.length > 0 && ` • ${childFolders.length} subfolder${childFolders.length > 1 ? 's' : ''}`}
              {folder.isHidden && ' • Hidden'}
            </p>
          </div>

          {/* Drop hint when dragging */}
          {isDropTarget && (
            <div className="relative z-10 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
              Drop artwork
            </div>
          )}
          {isFolderDropTarget && (
            <div className="relative z-10 rounded-full bg-violet-500 px-3 py-1 text-xs font-medium text-white">
              Move folder here
            </div>
          )}

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-white/80 hover:text-slate-600"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 bg-white p-1">
              <DropdownMenuItem
                onSelect={() => onRenameFolder?.(folder)}
                className="cursor-pointer gap-2 rounded-lg px-3 py-2"
              >
                <Pencil className="h-4 w-4 text-slate-500" />
                Rename
              </DropdownMenuItem>
              {folder.parentId && (
                <DropdownMenuItem
                  onSelect={() => handleMoveToRoot(folder)}
                  className="cursor-pointer gap-2 rounded-lg px-3 py-2"
                >
                  <FolderInput className="h-4 w-4 text-slate-500" />
                  Move to Root
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onSelect={() => onHideFolder?.(folder)}
                className="cursor-pointer gap-2 rounded-lg px-3 py-2"
              >
                <EyeOff className="h-4 w-4 text-slate-500" />
                {folder.isHidden ? 'Show on profile' : 'Hide from profile'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDeleteFolder?.(folder)}
                className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Folder contents */}
        {isExpanded && (
          <div className="space-y-2">
            {/* Child folders */}
            {childFolders.map((childFolder, childIndex) =>
              renderFolderRow(childFolder, childIndex, nestLevel + 1)
            )}

            {/* Artworks in folder */}
            {folderArtworks.length > 0 && (
              <div className="space-y-2">
                {folderArtworks.map((artwork) => renderArtworkRow(artwork, nestLevel + 1))}
              </div>
            )}

            {/* Empty folder state */}
            {folderArtworks.length === 0 && childFolders.length === 0 && (
              <div
                style={{ marginLeft: `${(nestLevel + 1) * 24}px` }}
                className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center"
              >
                <p className="text-sm text-slate-500">
                  Drag artworks or folders here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // -- render --
  // When forceFlatList is true, render all artworks as a flat list without folder grouping
  if (forceFlatList) {
    return (
      <div className="space-y-3">
        {artworks.map((artwork) => renderArtworkRow(artwork, 0))}

        {/* Empty state */}
        {artworks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <ImageIcon className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No artworks in this folder</h3>
            <p className="mt-1 text-sm text-slate-500">
              Move artworks here or upload new ones
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Root Folders */}
      {rootFolders.map((folder, index) => renderFolderRow(folder, index, 0))}

      {/* Separator if both folders and root artworks exist */}
      {rootFolders.length > 0 && rootArtworks.length > 0 && (
        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">Uncategorized</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
      )}

      {/* Root level artworks (not in any folder) */}
      {rootArtworks.map((artwork) => renderArtworkRow(artwork, 0))}

      {/* Empty state */}
      {rootFolders.length === 0 && artworks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <ImageIcon className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No artworks yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Upload your first artwork to get started
          </p>
        </div>
      )}
    </div>
  )
}
