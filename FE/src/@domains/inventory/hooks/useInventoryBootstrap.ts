import { useEffect, useRef, useState } from 'react'

import artworkApis from '@shared/apis/artworkApis'
import artworkFolderApis from '@shared/apis/artworkFolderApis'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { useInventoryDataStore } from '@domains/inventory/stores/useInventoryDataStore'
import {
  mapArtworkToInventory,
  mapFolderToInventory,
} from '@domains/inventory/utils/inventoryApiMapper'

type InventoryBootstrapState = {
  isLoading: boolean
  error: string | null
}

type InventoryBootstrapOptions = {
  includeArtworks?: boolean
}

export const useInventoryBootstrap = (
  options?: InventoryBootstrapOptions,
): InventoryBootstrapState => {
  const user = useAuthStore((state) => state.user)
  const setArtworks = useInventoryDataStore((state) => state.setArtworks)
  const setFolders = useInventoryDataStore((state) => state.setFolders)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastUserIdRef = useRef<string | null>(null)
  const includeArtworks = options?.includeArtworks ?? true

  useEffect(() => {
    if (!user?.id) {
      if (lastUserIdRef.current) {
        setArtworks([])
        setFolders([])
        lastUserIdRef.current = null
      }
      return
    }

    if (lastUserIdRef.current && lastUserIdRef.current !== user.id) {
      setArtworks([])
      setFolders([])
    }

    lastUserIdRef.current = user.id

    let isActive = true
    setIsLoading(true)
    setError(null)

    const loadInventory = async () => {
      try {
        const requests: Array<Promise<unknown>> = [
          artworkFolderApis.listFolders({
            sellerId: user.id,
            includeCounts: true,
          }),
        ]

        if (includeArtworks) {
          requests.unshift(
            artworkApis.listArtworks({
              sellerId: user.id,
              take: 200,
              includeSellerAuctionLifecycle: true,
            }),
          )
        }

        const results = await Promise.all(requests)

        const folders = results[includeArtworks ? 1 : 0] as Awaited<
          ReturnType<typeof artworkFolderApis.listFolders>
        >
        const artworks = includeArtworks
          ? (results[0] as Awaited<ReturnType<typeof artworkApis.listArtworks>>)
          : []

        if (!isActive) {
          return
        }

        if (includeArtworks) {
          setArtworks(artworks.map(mapArtworkToInventory))
        }
        setFolders(folders.map(mapFolderToInventory))
      } catch (err) {
        if (!isActive) {
          return
        }

        const message = err instanceof Error ? err.message : 'Failed to load inventory.'
        setError(message)
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadInventory()

    return () => {
      isActive = false
    }
  }, [includeArtworks, setArtworks, setFolders, user?.id])

  return { isLoading, error }
}
