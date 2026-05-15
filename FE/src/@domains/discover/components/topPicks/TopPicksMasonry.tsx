// react
import { useCallback } from 'react'

// third-party
import { Masonry } from 'masonic'

// @domains - discover
import { ArtworkThumbnailCard } from '@domains/discover/components/cards/ArtworkThumbnailCard'
import type { TopPicksArtwork } from '@domains/discover/mock/mockTopPicksArtworks'
import { TopPickSkeleton } from '@domains/discover/components/skeletons/DiscoverSkeletons'
import { mapArtworkToTopPick } from '@domains/discover/utils/discoverMappers'

// @shared
import artworkApis from '@shared/apis/artworkApis'
import { useApiInfiniteScroll } from '@shared/hooks/useApiInfiniteScroll'
import { InfiniteScrollSentinel } from '@shared/components/ui/InfiniteScrollSentinel'

type TopPicksMasonryProps = {
  searchQuery?: string
}

const DISCOVER_CLIENT_CACHE_OPTIONS = {
  auth: false,
  dedupe: true,
  clientCacheTtlMs: 30000,
}

const MasonryCard = ({ data }: { data: TopPicksArtwork }) => {
  return <ArtworkThumbnailCard artwork={data} />
}

export const TopPicksMasonry = ({ searchQuery = '' }: TopPicksMasonryProps) => {
  // -- fetch (sorted by most liked) --
  const fetchPage = useCallback(
    async (skip: number, take: number, signal?: AbortSignal) => {
      const result = await artworkApis.listArtworksPaginated(
        {
          skip,
          take,
          q: searchQuery || undefined,
          status: 'ACTIVE',
          sortBy: 'likeCount',
          sortOrder: 'desc',
        },
        {
          ...DISCOVER_CLIENT_CACHE_OPTIONS,
          signal,
        },
      )
      return {
        data: result.data.map(mapArtworkToTopPick),
        hasMore: result.pagination.hasNext,
      }
    },
    [searchQuery],
  )

  const { displayedItems, isLoading, hasMore, loadMore, error } = useApiInfiniteScroll({
    fetchPage,
    pageSize: 18,
    searchQuery,
  })

  // -- render --
  if (error) {
    return (
      <div className="mt-6 text-center text-sm text-red-500">
        Failed to load top picks. Please try again later.
      </div>
    )
  }

  if (!isLoading && displayedItems.length === 0) {
    return (
      <div className="mt-6 text-center text-sm text-slate-500">
        No top picks found.
      </div>
    )
  }

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
