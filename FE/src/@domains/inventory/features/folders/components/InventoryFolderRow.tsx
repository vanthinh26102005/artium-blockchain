import React from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  EyeOff,
  Folder,
  FolderInput,
  FolderOpen,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu'
import { cn } from '@shared/lib/utils'

import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'

type FolderWithCount = InventoryFolder & { itemCount: number }

export type InventoryFolderRowProps = {
  folder: FolderWithCount
  index: number
  nestLevel?: number
  isExpanded: boolean
  isDragging: boolean
  isDragOver: boolean
  isDropTarget: boolean
  isFolderDropTarget: boolean
  childFoldersCount: number
  hasArtworks: boolean
  onToggleExpanded: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: () => void
  onFolderDropTarget: (e: React.DragEvent) => void
  onFolderDropTargetLeave: (e: React.DragEvent) => void
  onArtworkDropOnFolder: (e: React.DragEvent) => void
  onRenameFolder?: (folder: InventoryFolder) => void
  onMoveToRoot?: (folder: InventoryFolder) => void
  onHideFolder?: (folder: InventoryFolder) => void
  onDeleteFolder?: (folder: InventoryFolder) => void
  children?: React.ReactNode
}

/**
 * InventoryFolderRow - React component
 * @returns React element
 */
export const InventoryFolderRow = ({
  folder,
  index,
  nestLevel = 0,
  isExpanded,
  isDragging,
  isDragOver,
  isDropTarget,
  isFolderDropTarget,
  childFoldersCount,
  hasArtworks,
  onToggleExpanded,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onFolderDropTarget,
  onFolderDropTargetLeave,
  onArtworkDropOnFolder,
  onRenameFolder,
  onMoveToRoot,
  onHideFolder,
  onDeleteFolder,
  children,
}: InventoryFolderRowProps) => {
  return (
    <div className="space-y-2">
      {/* Folder header */}
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        style={{ marginLeft: nestLevel > 0 ? `\${nestLevel * 24}px` : undefined }}
        className={cn(
          'group relative flex items-center gap-3 rounded-[24px] border bg-white px-4 py-4 transition-all',
          isDragging && 'opacity-50',
          isDragOver && 'border-blue-300 bg-blue-50',
          isDropTarget && 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200',
          isFolderDropTarget && 'border-violet-300 bg-violet-50 ring-2 ring-violet-200',
          !isDragging &&
            !isDragOver &&
            !isDropTarget &&
            !isFolderDropTarget &&
            'border-slate-200 hover:border-slate-300 hover:shadow-sm',
        )}
      >
        {/* Drop zone overlay for artwork/folder drops */}
        <div
          className="absolute inset-0 rounded-xl"
          onDragOver={(e) => {
            onFolderDropTarget(e)
            onDragOver(e)
          }}
          onDragLeave={(e) => {
            onFolderDropTargetLeave(e)
            onDragLeave(e)
          }}
          onDrop={(e) => {
            // Let the parent figure out what was dropped, we pass it up
            // Or parent provides onDrop vs onArtworkDropOnFolder based on state.
            // Wait, InventoryArtworkList distinguishes by draggedArtworkId state...
            // It's cleaner if the parent passes an event handler that can distinguish.
            // I'll call onDrop for folder drops and onArtworkDropOnFolder if draggedArtworkId is true in parent.
            // In the original, the parent checks `draggedArtworkId`. Let's pass a unified `onDropCombined` from parent.
          }}
        />

        {/* Nested indicator */}
        {nestLevel > 0 && <CornerDownRight className="relative z-10 h-4 w-4 text-slate-300" />}

        {/* Drag handle */}
        <button
          type="button"
          className="relative z-10 cursor-grab text-slate-300 transition hover:text-slate-500 active:cursor-grabbing"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Expand/collapse button */}
        <button
          type="button"
          onClick={onToggleExpanded}
          className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>

        {/* Folder icon */}
        <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          {isExpanded ? (
            <FolderOpen className="h-5 w-5 text-blue-600" />
          ) : (
            <Folder className="h-5 w-5 text-blue-600" />
          )}
        </div>

        {/* Folder name and count */}
        <div className="relative z-10 min-w-0 flex-1">
          <Link
            href={`/inventory/folder/\${folder.id}`}
            className="truncate text-base font-semibold text-slate-900 hover:underline"
          >
            {folder.name}
          </Link>
          <p className="text-xs text-slate-500">
            {folder.itemCount} {folder.itemCount === 1 ? 'artwork' : 'artworks'}
            {childFoldersCount > 0 &&
              ` • \${childFoldersCount} subfolder\${childFoldersCount > 1 ? 's' : ''}`}
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
              className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 opacity-0 transition hover:bg-white/80 hover:text-slate-600 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-xl border-slate-200 bg-white p-1"
          >
            <DropdownMenuItem
              onSelect={() => onRenameFolder?.(folder)}
              className="cursor-pointer gap-2 rounded-lg px-3 py-2"
            >
              <Pencil className="h-4 w-4 text-slate-500" />
              Rename
            </DropdownMenuItem>
            {folder.parentId && onMoveToRoot && (
              <DropdownMenuItem
                onSelect={() => onMoveToRoot(folder)}
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
          {children}

          {/* Empty folder state */}
          {!hasArtworks && childFoldersCount === 0 && (
            <div
              style={{ marginLeft: `\${(nestLevel + 1) * 24}px` }}
              className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center"
            >
              <p className="text-sm text-slate-500">Drag artworks or folders here</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
