import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'

import artworkApis from '@shared/apis/artworkApis'
import artworkFolderApis from '@shared/apis/artworkFolderApis'
import { type InventoryFolder } from '@domains/inventory/features/folders/types/inventoryFolder'
import {
  type InventoryArtwork,
  type DragItemData,
} from '@domains/inventory/features/artworks/types/inventoryArtwork'
import { type UserPayload } from '@shared/types/auth'

type UseInventoryDndProps = {
  user: UserPayload | null
  artworks: InventoryArtwork[]
  folders: InventoryFolder[]
  reorderFolders: (fromIndex: number, toIndex: number) => void
  optimisticMoveArtwork: (artworkId: string, folderId?: string) => void
  setToastMessage: (msg: string | null) => void
}

/**
 * useInventoryDnd - Custom React hook
 * @returns void
 */
export const useInventoryDnd = ({
  user,
  artworks,
  folders,
  reorderFolders,
  optimisticMoveArtwork,
  setToastMessage,
}: UseInventoryDndProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<DragItemData | null>(null)

  const handleReorderFolders = async (oldIndex: number, newIndex: number) => {
    if (!user?.id) {
      setToastMessage('Please log in to reorder folders.')
      /**
       * handleReorderFolders - Utility function
       * @returns void
       */
      return
    }

    reorderFolders(oldIndex, newIndex)

    try {
      const newFolders = arrayMove(folders, oldIndex, newIndex)
      const newOrderIds = newFolders.map((f) => f.id)
      await artworkFolderApis.reorderFolders({
        sellerId: user.id,
        folderIds: newOrderIds,
      })
      /**
       * newFolders - Utility function
       * @returns void
       */
    } catch {
      setToastMessage('Failed to save folder order')
      reorderFolders(newIndex, oldIndex)
    }
    /**
     * newOrderIds - Utility function
     * @returns void
     */
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setActiveItem((event.active.data.current as DragItemData) ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveItem(null)

    if (!over || !user?.id) return

    /**
     * handleDragStart - Utility function
     * @returns void
     */
    const activeType = active.data.current?.type
    const overType = over.data.current?.type

    if (activeType === 'Folder' && overType === 'Folder') {
      if (active.id !== over.id) {
        const oldIndex = folders.findIndex((f) => f.id === active.id)
        const newIndex = folders.findIndex((f) => f.id === over.id)
        await handleReorderFolders(oldIndex, newIndex)
        /**
         * handleDragEnd - Utility function
         * @returns void
         */
      }
    } else if (activeType === 'Artwork' && overType === 'Folder') {
      const artworkId = active.id as string
      const folderId = over.id as string

      const artwork = artworks.find((a) => a.id === artworkId)
      const previousFolderId = artwork?.folderId

      optimisticMoveArtwork(artworkId, folderId)

      /**
       * activeType - Utility function
       * @returns void
       */
      try {
        await artworkApis.bulkMoveArtworks({
          artworkIds: [artworkId],
          folderId,
          /**
           * overType - Utility function
           * @returns void
           */
          sellerId: user.id,
        })
        setToastMessage('Artwork moved to folder')
      } catch {
        optimisticMoveArtwork(artworkId, previousFolderId)
        setToastMessage('Failed to move artwork')
      }
      /**
       * oldIndex - Utility function
       * @returns void
       */
    }
  }

  return {
    /**
     * newIndex - Utility function
     * @returns void
     */
    activeId,
    activeItem,
    handleDragStart,
    handleDragEnd,
  }
}

/**
 * artworkId - Utility function
 * @returns void
 */
/**
 * folderId - Utility function
 * @returns void
 */
/**
 * artwork - Utility function
 * @returns void
 */
/**
 * previousFolderId - Utility function
 * @returns void
 */
