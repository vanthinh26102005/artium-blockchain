import { useState, useEffect, useCallback, useRef } from 'react'

interface UseApiInfiniteScrollProps<T> {
  fetchPage: (
    skip: number,
    take: number,
    signal?: AbortSignal,
  ) => Promise<{ data: T[]; hasMore: boolean }>
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
  const requestSeqRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(
    async (skip: number, append: boolean) => {
      if (isFetchingRef.current) return
      const requestSeq = requestSeqRef.current + 1
      requestSeqRef.current = requestSeq
      abortControllerRef.current?.abort()
      const abortController = new AbortController()
      abortControllerRef.current = abortController
      isFetchingRef.current = true
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchPage(skip, pageSize, abortController.signal)

        if (abortController.signal.aborted || requestSeq !== requestSeqRef.current) {
          return
        }

        setDisplayedItems((prev) => (append ? [...prev, ...result.data] : result.data))
        setHasMore(result.hasMore)
        skipRef.current = skip + result.data.length
      } catch (err) {
        if (abortController.signal.aborted || requestSeq !== requestSeqRef.current) {
          return
        }
        setError(err instanceof Error ? err : new Error('Failed to fetch'))
      } finally {
        if (requestSeq === requestSeqRef.current) {
          setIsLoading(false)
          isFetchingRef.current = false
          if (abortControllerRef.current === abortController) {
            abortControllerRef.current = null
          }
        }
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

  useEffect(() => {
    skipRef.current = 0
    isFetchingRef.current = false
    setDisplayedItems([])
    setHasMore(true)
    setError(null)
    fetchData(0, false)
    return () => {
      requestSeqRef.current += 1
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
      isFetchingRef.current = false
    }
  }, [fetchData, searchQuery])

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return
    fetchData(skipRef.current, true)
  }, [isLoading, hasMore, fetchData])

  return { displayedItems, isLoading, hasMore, loadMore, error, reset }
}
