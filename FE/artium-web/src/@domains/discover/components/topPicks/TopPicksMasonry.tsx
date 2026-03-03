// third-party
import { Masonry } from 'masonic'

// @domains - discover
import { ArtworkThumbnailCard } from '@domains/discover/components/cards/ArtworkThumbnailCard'
import {
  mockTopPicksArtworks,
  type TopPicksArtwork,
} from '@domains/discover/mock/mockTopPicksArtworks'
import { TopPickSkeleton } from '@domains/discover/components/skeletons/DiscoverSkeletons'

// @shared
import { useMockInfiniteScroll } from '@shared/hooks/useMockInfiniteScroll'
import { InfiniteScrollSentinel } from '@shared/components/ui/InfiniteScrollSentinel'

const MasonryCard = ({ data }: { data: TopPicksArtwork }) => {
  return <ArtworkThumbnailCard artwork={data} />
}

export const TopPicksMasonry = () => {
  // -- state --
  const { displayedItems, isLoading, hasMore, loadMore } = useMockInfiniteScroll({
    allItems: mockTopPicksArtworks,
    initialCount: 18,
    loadMoreCount: 12,
  })

  // -- render --
  return (
    <div className="mt-6">
      {/* masonry */}
      <Masonry
        items={displayedItems}
        columnWidth={160}
        columnGutter={16}
        rowGutter={16}
        overscanBy={2}
        maxColumnCount={6}
        scrollFps={12}
        render={MasonryCard}
        itemKey={(item) => item.id}
        className="w-full"
        ssrWidth={1200}
        ssrHeight={800}
      />

      {/* skeletons */}
      {isLoading && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TopPickSkeleton key={i} />
          ))}
        </div>
      )}

      {/* sentinel */}
      <InfiniteScrollSentinel onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading} />
    </div>
  )
}

