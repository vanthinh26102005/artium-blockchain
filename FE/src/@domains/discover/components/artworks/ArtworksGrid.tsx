// react
import { useCallback, useMemo } from 'react'

// third-party
import { Masonry } from 'masonic'

// @domains - discover
import { DiscoveryArtworkCard } from '@domains/discover/components/cards/DiscoveryArtworkCard'
import type { DiscoverArtwork } from '@domains/discover/mock/mockArtworks'
import { ArtworkSkeleton } from '@domains/discover/components/skeletons/DiscoverSkeletons'
import { mapArtworkToDiscover } from '@domains/discover/utils/discoverMappers'

// @shared
import artworkApis from '@shared/apis/artworkApis'
import { useApiInfiniteScroll } from '@shared/hooks/useApiInfiniteScroll'
import { InfiniteScrollSentinel } from '@shared/components/ui/InfiniteScrollSentinel'

type ArtworksGridProps = {
  searchQuery?: string
  isImageSearch: boolean
  onExitImageSearch: () => void
}

/**
 * MasonryCard - React component
 * @returns React element
 */
const MasonryCard = ({ data }: { data: DiscoverArtwork }) => {
  return <DiscoveryArtworkCard artwork={data} />
}

export const ArtworksGrid = ({
  searchQuery = '',
  isImageSearch,
  onExitImageSearch,
}: ArtworksGridProps) => {
  // -- fetch --
  const fetchPage = useCallback(
    /**
     * ArtworksGrid - React component
     * @returns React element
     */
    async (skip: number, take: number) => {
      const result = await artworkApis.listArtworksPaginated({
        skip,
        take,
        q: searchQuery || undefined,
        /**
         * fetchPage - Utility function
         * @returns void
         */
        status: 'ACTIVE',
      })
      return {
        data: result.data.map(mapArtworkToDiscover),
        hasMore: result.pagination.hasNext,
        /**
         * result - Utility function
         * @returns void
         */
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
  if (isImageSearch) {
    return (
      <section className="mt-6">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_6px_16px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-semibold text-slate-900">
              Image search mode (mock). Upload/choose image later.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              We will add image matching and upload flow in a future PR.
            </p>
            <button
              type="button"
              onClick={onExitImageSearch}
              className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
            >
              Exit image search
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <div className="mt-6 text-center text-sm text-red-500">
        Failed to load artworks. Please try again later.
      </div>
    )
  }

  if (!isLoading && displayedItems.length === 0) {
    return (
      <div className="mt-6 text-center text-sm text-slate-500">
        No artworks found{searchQuery ? ` for "${searchQuery}"` : ''}.
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
            <ArtworkSkeleton key={i} />
          ))}
        </div>
      )}

      {/* sentinel */}
      <InfiniteScrollSentinel onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading} />
    </div>
  )
}
