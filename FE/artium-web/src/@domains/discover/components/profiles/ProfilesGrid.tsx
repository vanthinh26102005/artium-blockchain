// react
import { useState } from 'react'

// @domains - discover
import { ProfileCard } from '@domains/discover/components/cards/ProfileCard'
import { mockProfiles, type DiscoverProfile } from '@domains/discover/mock/mockProfiles'
import { ProfileSkeleton } from '@domains/discover/components/skeletons/DiscoverSkeletons'

// @shared
import { useMockInfiniteScroll } from '@shared/hooks/useMockInfiniteScroll'
import { InfiniteScrollSentinel } from '@shared/components/ui/InfiniteScrollSentinel'

const buildInitialFollowState = (profiles: DiscoverProfile[]) =>
  profiles.reduce<Record<string, boolean>>((acc, profile) => {
    acc[profile.id] = Boolean(profile.isFollowing)
    return acc
  }, {})

export const ProfilesGrid = () => {
  // -- state --
  const [followingById, setFollowingById] = useState(() => buildInitialFollowState(mockProfiles))

  const { displayedItems, isLoading, hasMore, loadMore } = useMockInfiniteScroll({
    allItems: mockProfiles,
    initialCount: 6,
    loadMoreCount: 6,
  })

  // -- derived --

  // -- handlers --
  const handleToggleFollow = (profileId: string) => {
    setFollowingById((prev) => ({
      ...prev,
      [profileId]: !prev[profileId],
    }))
  }

  // -- render --
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

