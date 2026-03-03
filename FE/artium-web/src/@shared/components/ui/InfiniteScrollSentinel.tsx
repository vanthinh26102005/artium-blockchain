import { useEffect, useRef } from 'react'

interface InfiniteScrollSentinelProps {
    onLoadMore: () => void
    hasMore: boolean
    isLoading: boolean
    rootMargin?: string
}

export const InfiniteScrollSentinel = ({
    onLoadMore,
    hasMore,
    isLoading,
    rootMargin = '100px',
}: InfiniteScrollSentinelProps) => {
    const sentinelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    onLoadMore()
                }
            },
            {
                rootMargin,
            }
        )

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current)
        }

        return () => {
            observer.disconnect()
        }
    }, [hasMore, isLoading, onLoadMore, rootMargin])

    if (!hasMore) return null

    return <div ref={sentinelRef} className="h-4 w-full" />
}
