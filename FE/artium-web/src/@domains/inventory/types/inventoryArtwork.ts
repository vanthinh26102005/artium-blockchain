import type { InventoryFolder } from './inventoryFolder'

export type InventoryArtworkStatus = 'Draft' | 'Hidden'

export type InventoryArtwork = {
  id: string
  title: string
  creatorName: string
  status: InventoryArtworkStatus
  backendStatus?: string
  createdAt?: string
  updatedAt?: string
  price?: number
  thumbnailUrl: string
  folderId?: string
}

/** Folder type with required itemCount for UI components */
export type FolderWithCount = InventoryFolder & { itemCount: number }

/**
 * Type for drag-and-drop active item data.
 * Used by DndContext to track what is being dragged.
 */
export type DragItemData =
  | { type: 'Artwork'; artwork: InventoryArtwork }
  | { type: 'Folder'; folder: FolderWithCount }
