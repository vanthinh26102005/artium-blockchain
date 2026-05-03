// @domains - discover
import { InspireCard } from '@domains/discover/components/cards/InspireCard'
import { mockInspire } from '@domains/discover/mock/mockInspire'
import { InspireSkeleton } from '@domains/discover/components/skeletons/DiscoverSkeletons'

// @shared
import { useMockInfiniteScroll } from '@shared/hooks/useMockInfiniteScroll'
import { InfiniteScrollSentinel } from '@shared/components/ui/InfiniteScrollSentinel'

/**
 * InspireGrid - React component
 * @returns React element
 */
export const InspireGrid = () => {
  // -- state --
  const { displayedItems, isLoading, hasMore, loadMore } = useMockInfiniteScroll({
    allItems: mockInspire,
    initialCount: 8,
    loadMoreCount: 8,
  })

  // -- derived --

  // -- handlers --

  // -- render --
  return (
    <section className="mt-6">
      {/* grid */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedItems.map((item) => (
          <InspireCard key={item.id} item={item} />
        ))}
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <InspireSkeleton key={`skeleton-${i}`} />)}
      </div>

      {/* sentinel */}
      <InfiniteScrollSentinel onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading} />
    </section>
  )
}

