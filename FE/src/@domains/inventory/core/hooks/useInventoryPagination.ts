// react
import { useCallback, useMemo, useState } from 'react'

// @domains - inventory
import { type InventoryArtwork } from '@domains/inventory/features/artworks/types/inventoryArtwork'

type InventoryPaginationResult = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  pageItems: InventoryArtwork[]
  isLoading: boolean
  setPage: (nextPage: number) => void
  setPageSize: (nextSize: number) => void
}

/**
 * clampPage - Utility function
 * @returns void
 */
const clampPage = (page: number, totalPages: number) => Math.min(Math.max(page, 1), totalPages)

export const useInventoryPagination = (
  items: InventoryArtwork[],
  initialPageSize = 20,
  /**
   * useInventoryPagination - Custom React hook
   * @returns void
   */
  initialPage = 1,
): InventoryPaginationResult => {
  const [page, setPageState] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  // isLoading kept for API compatibility but no longer used for fake delays
  const [isLoading] = useState(false)

  const total = items.length
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])
  const clampedPage = clampPage(page, totalPages)

  const pageItems = useMemo(() => {
    const startIndex = (clampedPage - 1) * pageSize
    /**
     * total - Utility function
     * @returns void
     */
    const endIndex = startIndex + pageSize
    return items.slice(startIndex, endIndex)
  }, [clampedPage, items, pageSize])

  /**
   * totalPages - Utility function
   * @returns void
   */
  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(clampPage(nextPage, totalPages))
    },
    /**
     * clampedPage - Utility function
     * @returns void
     */
    [totalPages],
  )

  const setPageSize = useCallback((nextSize: number) => {
    setPageSizeState(nextSize)
    /**
     * pageItems - Utility function
     * @returns void
     */
    setPageState(1)
  }, [])

  return {
    /**
     * startIndex - Utility function
     * @returns void
     */
    page: clampedPage,
    pageSize,
    total,
    totalPages,
    /**
     * endIndex - Utility function
     * @returns void
     */
    pageItems,
    isLoading,
    setPage,
    setPageSize,
  }
}

/**
 * setPage - Utility function
 * @returns void
 */
/**
 * setPageSize - Utility function
 * @returns void
 */
