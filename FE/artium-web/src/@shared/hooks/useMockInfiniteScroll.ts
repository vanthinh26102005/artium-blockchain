import { useState, useEffect, useCallback } from 'react'

interface UseMockInfiniteScrollProps<T> {
  allItems: T[]
  initialCount: number
  loadMoreCount: number
  delay?: number
}

export const useMockInfiniteScroll = <T>({
  allItems,
  initialCount,
  loadMoreCount,
  delay = 1000,
}: UseMockInfiniteScrollProps<T>) => {
  const [displayedItems, setDisplayedItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setDisplayedItems(allItems.slice(0, initialCount))
    setHasMore(allItems.length > initialCount)
  }, [allItems, initialCount])

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    setTimeout(() => {
      setDisplayedItems((prev) => {
        const nextCount = prev.length + loadMoreCount
        const nextItems = allItems.slice(0, nextCount)
        setHasMore(allItems.length > nextCount)
        return nextItems
      })
      setIsLoading(false)
    }, delay)
  }, [allItems, isLoading, hasMore, loadMoreCount, delay])

  return { displayedItems, isLoading, hasMore, loadMore }
}
