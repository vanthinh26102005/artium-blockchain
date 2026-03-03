// react
import { useCallback, useEffect, useMemo, useState } from 'react'

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

const getRandomDelay = () => 200 + Math.floor(Math.random() * 150)

export const useInventoryPagination = (
  items: InventoryArtwork[],
  initialPageSize = 20,
  initialPage = 1,
): InventoryPaginationResult => {
  const [page, setPageState] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const [isLoading, setIsLoading] = useState(false)

  const total = items.length
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  const pageItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return items.slice(startIndex, endIndex)
  }, [items, page, pageSize])

  useEffect(() => {
    setPageState((current) => clampPage(current, totalPages))
  }, [totalPages, items])

  useEffect(() => {
    setIsLoading(true)
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
    }, getRandomDelay())

    return () => {
      clearTimeout(timeoutId)
    }
  }, [page, pageSize, items])

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
    page,
    pageSize,
    total,
    totalPages,
    pageItems,
    isLoading,
    setPage,
    setPageSize,
  }
}
