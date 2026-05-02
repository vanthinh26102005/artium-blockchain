import { useState, useEffect } from 'react'

import artworkFolderApis from '@shared/apis/artworkFolderApis'
import { mapArtworkToInventory } from '@domains/inventory/core/utils/inventoryApiMapper'
import { type InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'

export const useInventoryFolderArtworks = (
  folderId: string,
  userId: string | undefined,
  setMany: (ids: string[]) => void,
) => {
  const [folderArtworks, setFolderArtworks] = useState<InventoryArtwork[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!folderId || !userId) {
      setFolderArtworks([])
      setIsFetching(false)
      return
    }

    let isActive = true
    setIsFetching(true)
    setFetchError(null)
    setFolderArtworks([])

    const loadFolderArtworks = async () => {
      try {
        const response = await artworkFolderApis.getArtworksInFolder(folderId)
        const mapped = response.map(mapArtworkToInventory)

        if (!isActive) {
          return
        }

        setFolderArtworks(mapped)
        setMany([])
      } catch (error) {
        if (!isActive) {
          return
        }

        setFolderArtworks([])
        setFetchError(error instanceof Error ? error.message : 'Failed to load artworks.')
      } finally {
        if (isActive) {
          setIsFetching(false)
        }
      }
    }

    void loadFolderArtworks()

    return () => {
      isActive = false
    }
  }, [folderId, setMany, userId])

  return {
    folderArtworks,
    setFolderArtworks,
    isFetching,
    fetchError,
  }
}
