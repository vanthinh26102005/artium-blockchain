// react
import { useState, useCallback } from 'react'

// @domains - discover
import { ProfileCard } from '@domains/discover/components/cards/ProfileCard'
import { ProfileSkeleton } from '@domains/discover/components/skeletons/DiscoverSkeletons'
import { mapSellerProfileToDiscover } from '@domains/discover/utils/discoverMappers'

// @shared
import profileApis from '@shared/apis/profileApis'
import { useApiInfiniteScroll } from '@shared/hooks/useApiInfiniteScroll'
import { InfiniteScrollSentinel } from '@shared/components/ui/InfiniteScrollSentinel'

type ProfilesGridProps = {
  searchQuery?: string
}

const DISCOVER_CLIENT_CACHE_OPTIONS = {
  auth: false,
  dedupe: true,
  clientCacheTtlMs: 30000,
}

export const ProfilesGrid = ({ searchQuery = '' }: ProfilesGridProps) => {
  // -- state --
  const [followingById, setFollowingById] = useState<Record<string, boolean>>({})

  const fetchPage = useCallback(
    async (skip: number, take: number, signal?: AbortSignal) => {
      const result = await profileApis.searchSellerProfiles(
        searchQuery,
        { skip, take },
        {
          ...DISCOVER_CLIENT_CACHE_OPTIONS,
          signal,
        },
      )
      return {
        data: result.items.map(mapSellerProfileToDiscover),
        hasMore: result.hasMore,
      }
    },
    [searchQuery],
  )

  const { displayedItems, isLoading, hasMore, loadMore, error } = useApiInfiniteScroll({
    fetchPage,
    pageSize: 8,
    searchQuery,
  })

  // -- handlers --
  const handleToggleFollow = (profileId: string) => {
    setFollowingById((prev) => ({
      ...prev,
      [profileId]: !prev[profileId],
    }))
  }

  // -- render --
  if (error) {
    return (
      <div className="mt-10 text-center text-sm text-red-500">
        Failed to load profiles. Please try again later.
      </div>
    )
  }

  if (!isLoading && displayedItems.length === 0) {
    return (
      <div className="mt-10 text-center text-sm text-slate-500">
        No profiles found.
      </div>
    )
  }

  return (
    <section className="mt-10">
      {/* grid */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedItems.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isFollowing={Boolean(followingById[profile.id])}
            onToggleFollow={() => handleToggleFollow(profile.id)}
          />
        ))}
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <ProfileSkeleton key={`skeleton-${i}`} />)}
      </div>

      {/* sentinel */}
      <InfiniteScrollSentinel onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading} />
    </section>
  )
}
