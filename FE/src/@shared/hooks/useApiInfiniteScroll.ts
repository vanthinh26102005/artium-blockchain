import { useState, useEffect, useCallback, useRef } from 'react'

interface UseApiInfiniteScrollProps<T> {
  fetchPage: (skip: number, take: number) => Promise<{ data: T[]; hasMore: boolean }>
  pageSize?: number
  searchQuery?: string
}

export const useApiInfiniteScroll = <T>({
  fetchPage,
  pageSize = 18,
  searchQuery = '',
}: UseApiInfiniteScrollProps<T>) => {
  const [displayedItems, setDisplayedItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const skipRef = useRef(0)
  const isFetchingRef = useRef(false)
  const searchQueryRef = useRef(searchQuery)

  const fetchData = useCallback(
    async (skip: number, append: boolean) => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchPage(skip, pageSize)

        // Discard stale responses after a reset
        if (!append && skip !== 0) {
          return
        }

        setDisplayedItems((prev) => (append ? [...prev, ...result.data] : result.data))
        setHasMore(result.hasMore)
        skipRef.current = skip + result.data.length
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch'))
      } finally {
        setIsLoading(false)
        isFetchingRef.current = false
      }
    },
    [fetchPage, pageSize],
  )

  const reset = useCallback(() => {
    skipRef.current = 0
    isFetchingRef.current = false
    setDisplayedItems([])
    setHasMore(true)
    setError(null)
    fetchData(0, false)
  }, [fetchData])

  // Initial load
  useEffect(() => {
    fetchData(0, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset when searchQuery changes
  useEffect(() => {
    if (searchQueryRef.current !== searchQuery) {
      searchQueryRef.current = searchQuery
      reset()
    }
  }, [searchQuery, reset])

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return
    fetchData(skipRef.current, true)
  }, [isLoading, hasMore, fetchData])

  return { displayedItems, isLoading, hasMore, loadMore, error, reset }
}
