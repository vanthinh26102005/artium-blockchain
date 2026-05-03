import { useEffect, useRef, useState } from 'react'

import artworkApis from '@shared/apis/artworkApis'
import artworkFolderApis from '@shared/apis/artworkFolderApis'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { useInventoryDataStore } from '@domains/inventory/core/stores/useInventoryDataStore'
import {
  mapArtworkToInventory,
  mapFolderToInventory,
} from '@domains/inventory/core/utils/inventoryApiMapper'

type InventoryBootstrapState = {
  isLoading: boolean
  error: string | null
}

type InventoryBootstrapOptions = {
  includeArtworks?: boolean
}

/**
 * useInventoryBootstrap - Custom React hook
 * @returns void
 */
export const useInventoryBootstrap = (
  options?: InventoryBootstrapOptions,
): InventoryBootstrapState => {
  const user = useAuthStore((state) => state.user)
  const setArtworks = useInventoryDataStore((state) => state.setArtworks)
  const setFolders = useInventoryDataStore((state) => state.setFolders)
  /**
   * user - Custom React hook
   * @returns void
   */
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastUserIdRef = useRef<string | null>(null)
  const includeArtworks = options?.includeArtworks ?? true
  /**
   * setArtworks - Utility function
   * @returns void
   */

  useEffect(() => {
    if (!user?.id) {
      if (lastUserIdRef.current) {
        /**
         * setFolders - Utility function
         * @returns void
         */
        setArtworks([])
        setFolders([])
        lastUserIdRef.current = null
      }
      return
    }
    /**
     * lastUserIdRef - Utility function
     * @returns void
     */

    if (lastUserIdRef.current && lastUserIdRef.current !== user.id) {
      setArtworks([])
      setFolders([])
      /**
       * includeArtworks - Utility function
       * @returns void
       */
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
        /**
         * loadInventory - Utility function
         * @returns void
         */

        const results = await Promise.all(requests)

        const folders = results[includeArtworks ? 1 : 0] as Awaited<
          ReturnType<typeof artworkFolderApis.listFolders>
          /**
           * requests - Utility function
           * @returns void
           */
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
        /**
         * results - Utility function
         * @returns void
         */
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
      /**
       * folders - Utility function
       * @returns void
       */
    }

    void loadInventory()

    return () => {
      isActive = false
      /**
       * artworks - Utility function
       * @returns void
       */
    }
  }, [includeArtworks, setArtworks, setFolders, user?.id])

  return { isLoading, error }
}

/**
 * message - Utility function
 * @returns void
 */
