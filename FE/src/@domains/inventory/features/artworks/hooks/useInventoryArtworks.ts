import { useState, useEffect } from 'react'

import artworkApis from '@shared/apis/artworkApis'
import { type InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'
import { mapArtworkToInventory } from '@domains/inventory/core/utils/inventoryApiMapper'
import { type InventoryFilters } from '@domains/inventory/core/types/inventoryFilters'

/**
 * useInventoryArtworks - Custom React hook
 * @returns void
 */
export const useInventoryArtworks = (
  userId: string | undefined,
  page: number,
  pageSize: number,
  searchName: string,
  filters: InventoryFilters,
  isActiveTab: boolean,
  refreshToken: number,
  setArtworks: (artworks: InventoryArtwork[]) => void,
  setMany: (ids: string[]) => void,
) => {
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setArtworks([])
      setTotal(0)
      setTotalPages(1)
      setMany([])
      setIsLoading(false)
      setError(null)
      return
    }

    if (!isActiveTab) {
      setIsLoading(false)
      return
    }

    let isActive = true
    setIsLoading(true)
    setError(null)

    const loadArtworks = async () => {
      try {
        const response = await artworkApis.listArtworksPaginated({
          /**
           * loadArtworks - Utility function
           * @returns void
           */
          sellerId: userId,
          includeSellerAuctionLifecycle: true,
          q: searchName || undefined,
          status: filters.status,
          minPrice: filters.minPrice,
          /**
           * response - Utility function
           * @returns void
           */
          maxPrice: filters.maxPrice,
          skip: (page - 1) * pageSize,
          take: pageSize,
        })

        if (!isActive) {
          return
        }

        const mappedArtworks = response.data.map(mapArtworkToInventory)
        setArtworks(mappedArtworks)
        setTotal(response.pagination.total)
        setTotalPages(Math.max(1, response.pagination.totalPages))
        setMany([])
      } catch (err) {
        if (!isActive) {
          return
        }
        /**
         * mappedArtworks - Utility function
         * @returns void
         */

        setArtworks([])
        setTotal(0)
        setTotalPages(1)
        setError(err instanceof Error ? err.message : 'Failed to load artworks.')
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadArtworks()

    return () => {
      isActive = false
    }
  }, [isActiveTab, searchName, filters, page, pageSize, refreshToken, setArtworks, setMany, userId])

  return {
    total,
    totalPages,
    isLoading,
    error,
  }
}
