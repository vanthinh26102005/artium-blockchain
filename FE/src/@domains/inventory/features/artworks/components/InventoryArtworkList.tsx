// react
import { useMemo, useState } from 'react'

// third-party
import { ImageIcon } from 'lucide-react'

// @domains - inventory
import { useInventorySelectionStore } from '@domains/inventory/core/stores/useInventorySelectionStore'
import { type InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'
import { InventoryArtworkRow } from '@domains/inventory/features/artworks/components/InventoryArtworkRow'
import { InventoryFolderRow } from '@domains/inventory/features/folders/components/InventoryFolderRow'

type FolderWithCount = InventoryFolder & { itemCount: number }

type InventoryArtworkListProps = {
  artworks: InventoryArtwork[]
  folders?: FolderWithCount[]
  forceFlatList?: boolean
  onEdit: (artwork: InventoryArtwork) => void
  onDelete: (artwork: InventoryArtwork) => void
  onMove: (artwork: InventoryArtwork) => void
  onOpenDetails: (artwork: InventoryArtwork) => void
  onToggleProfileVisibility: (artwork: InventoryArtwork) => void
  onStartAuction: (artwork: InventoryArtwork) => void
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
  onToggleProfileVisibility,
  onStartAuction,
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

  const folderNameById = useMemo(() => {
    return new Map(folders.map((folder) => [folder.id, folder.name]))
  }, [folders])

  const artworksByFolder = useMemo(() => {
    const grouped = new Map<string | null, InventoryArtwork[]>()

    artworks.forEach((artwork) => {
      const folderId = artwork.folderId || null
      const existing = grouped.get(folderId) || []
      grouped.set(folderId, [...existing, artwork])
    })

    return grouped
  }, [artworks])

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

  const canDropFolderInto = (draggedId: string, targetId: string): boolean => {
    if (draggedId === targetId) return false
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
    if (draggedFolderId) {
      if (draggedFolderId !== folderId && canDropFolderInto(draggedFolderId, folderId)) {
        e.dataTransfer.dropEffect = 'move'
        setFolderDropTargetId(folderId)
        setDragOverFolderIndex(null)
      } else if (draggedFolderIndex !== null && draggedFolderIndex !== index) {
        e.dataTransfer.dropEffect = 'move'
        setDragOverFolderIndex(index)
        setFolderDropTargetId(null)
      }
    }
  }

  const handleFolderDragLeave = (e: React.DragEvent) => {
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
      if (folderDropTargetId === targetFolderId && canDropFolderInto(droppedFolderId, targetFolderId)) {
        onMoveFolderToFolder?.(droppedFolderId, targetFolderId)
      } else if (draggedFolderIndex !== null && draggedFolderIndex !== index) {
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

  const handleMoveToRoot = (folder: InventoryFolder) => {
    if (folder.parentId) {
      onMoveFolderToFolder?.(folder.id, null)
    }
  }

  const renderArtworkRow = (artwork: InventoryArtwork, nestLevel = 0) => {
    const isSelected = selectedIds.includes(artwork.id)
    const isDragging = draggedArtworkId === artwork.id
    const folderLabel = artwork.folderId ? folderNameById.get(artwork.folderId) : 'Uncategorized'

    return (
      <InventoryArtworkRow
        key={artwork.id}
        artwork={artwork}
        nestLevel={nestLevel}
        isSelected={isSelected}
        isDragging={isDragging}
        folderLabel={folderLabel}
        onToggle={toggle}
        onOpenDetails={onOpenDetails}
        onDragStart={handleArtworkDragStart(artwork.id)}
        onDragEnd={handleArtworkDragEnd}
        onEdit={onEdit}
        onToggleProfileVisibility={onToggleProfileVisibility}
        onMove={onMove}
        onStartAuction={onStartAuction}
        onDelete={onDelete}
      />
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
      <InventoryFolderRow
        key={folder.id}
        folder={folder}
        index={index}
        nestLevel={nestLevel}
        isExpanded={isExpanded}
        isDragging={isDragging}
        isDragOver={isDragOver}
        isDropTarget={isDropTarget}
        isFolderDropTarget={isFolderDropTarget}
        childFoldersCount={childFolders.length}
        hasArtworks={folderArtworks.length > 0}
        onToggleExpanded={() => toggleFolderExpanded(folder.id)}
        onDragStart={handleFolderDragStart(index, folder.id)}
        onDragOver={handleFolderDragOver(index, folder.id)}
        onDragLeave={handleFolderDragLeave}
        onDrop={(e) => {
          if (draggedArtworkId) {
            handleArtworkDropOnFolder(folder.id)(e)
          } else {
            handleFolderDrop(index, folder.id)(e)
          }
        }}
        onDragEnd={handleFolderDragEnd}
        onFolderDropTarget={handleFolderDropTarget(folder.id)}
        onFolderDropTargetLeave={handleFolderDropTargetLeave}
        onArtworkDropOnFolder={handleArtworkDropOnFolder(folder.id)}
        onRenameFolder={onRenameFolder}
        onMoveToRoot={handleMoveToRoot}
        onHideFolder={onHideFolder}
        onDeleteFolder={onDeleteFolder}
      >
        {childFolders.map((childFolder, childIndex) =>
          renderFolderRow(childFolder, childIndex, nestLevel + 1)
        )}
        {folderArtworks.length > 0 && (
          <div className="space-y-2">
            {folderArtworks.map((artwork) => renderArtworkRow(artwork, nestLevel + 1))}
          </div>
        )}
      </InventoryFolderRow>
    )
  }

  if (forceFlatList) {
    return (
      <div className="space-y-3">
        {artworks.map((artwork) => renderArtworkRow(artwork, 0))}
        {artworks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <ImageIcon className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No artworks in this folder</h3>
            <p className="mt-1 text-sm text-slate-500">Move artworks here or upload new ones</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rootFolders.map((folder, index) => renderFolderRow(folder, index, 0))}
      {rootFolders.length > 0 && (
        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-slate-200" />
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Uncategorized
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {rootArtworks.length} artwork{rootArtworks.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
      )}
      {rootArtworks.map((artwork) => renderArtworkRow(artwork, 0))}
      {rootFolders.length > 0 && rootArtworks.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <h3 className="text-base font-semibold text-slate-900">No uncategorized artworks</h3>
          <p className="mt-1 text-sm text-slate-500">
            Artworks that are not in a folder will appear here.
          </p>
        </div>
      )}
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
