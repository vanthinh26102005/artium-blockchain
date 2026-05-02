// react
import { useCallback, useMemo, useState } from 'react'

// @domains - inventory
import { type InventoryArtwork } from '@domains/inventory/types/inventoryArtwork'

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

const clampPage = (page: number, totalPages: number) => Math.min(Math.max(page, 1), totalPages)

export const useInventoryPagination = (
  items: InventoryArtwork[],
  initialPageSize = 20,
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
    const endIndex = startIndex + pageSize
    return items.slice(startIndex, endIndex)
  }, [clampedPage, items, pageSize])

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(clampPage(nextPage, totalPages))
    },
    [totalPages],
  )

  const setPageSize = useCallback((nextSize: number) => {
    setPageSizeState(nextSize)
    setPageState(1)
  }, [])

  return {
    page: clampedPage,
    pageSize,
    total,
    totalPages,
    pageItems,
    isLoading,
    setPage,
    setPageSize,
  }
}
