// react
import { useState, useEffect, useCallback, useMemo } from 'react'

// @domains - discover
import { MomentCard } from '@domains/discover/components/cards/MomentCard'
import type { DiscoverMoment } from '@domains/discover/mock/mockMoments'
import { MomentSkeleton } from '@domains/discover/components/skeletons/DiscoverSkeletons'
import { MomentViewModal } from '@domains/discover/components/modals/MomentViewModal'
import { mapMomentToDiscover } from '@domains/discover/utils/discoverMappers'

// @shared
import profileApis from '@shared/apis/profileApis'
import { InfiniteScrollSentinel } from '@shared/components/ui/InfiniteScrollSentinel'

const PAGE_SIZE = 12
const DISCOVER_CLIENT_CACHE_OPTIONS = {
  auth: false,
  dedupe: true,
  clientCacheTtlMs: 30000,
}

type MomentsGridProps = {
  searchQuery?: string
}

export const MomentsGrid = ({ searchQuery = '' }: MomentsGridProps) => {
  // -- state --
  const [allMoments, setAllMoments] = useState<DiscoverMoment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const [selectedMoment, setSelectedMoment] = useState<DiscoverMoment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch moments from featured seller profiles (no global discover endpoint)
  useEffect(() => {
    let cancelled = false
    const abortController = new AbortController()
    setIsLoading(true)
    setError(null)

    const fetchMoments = async () => {
      // Get seller profiles to discover their moments
      const profiles = await profileApis.searchSellerProfiles(
        '',
        { skip: 0, take: 20 },
        {
          ...DISCOVER_CLIENT_CACHE_OPTIONS,
          signal: abortController.signal,
        },
      )

      // Build user-info lookup
      const userInfoMap = new Map(
        profiles.items.map((p) => [
          p.userId,
          {
            username: p.displayName.toLowerCase().replace(/\s+/g, ''),
            fullName: p.displayName,
            avatarUrl: p.profileImageUrl || '/images/default-avatar.png',
            isVerified: p.isVerified,
          },
        ]),
      )

      // Fetch moments per user in parallel (limit to first 10 profiles)
      const userIds = profiles.items.slice(0, 10).map((p) => p.userId)
      const momentArrays = await Promise.all(
        userIds.map((uid) =>
          profileApis
            .listUserMoments(
              uid,
              { skip: 0, take: 5 },
              {
                ...DISCOVER_CLIENT_CACHE_OPTIONS,
                signal: abortController.signal,
              },
            )
            .catch(() => []),
        ),
      )

      // Flatten, enrich with user info, and shuffle
      const moments = momentArrays
        .flat()
        .map((m) => mapMomentToDiscover(m, userInfoMap.get(m.userId)))

      return moments
    }

    fetchMoments()
      .then((moments) => {
        if (!cancelled) setAllMoments(moments)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Failed to fetch moments'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
      abortController.abort()
    }
  }, [])

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!searchQuery) return allMoments
    const q = searchQuery.toLowerCase()
    return allMoments.filter(
      (m) =>
        m.caption.toLowerCase().includes(q) ||
        m.user.fullName.toLowerCase().includes(q) ||
        m.user.username.toLowerCase().includes(q),
    )
  }, [allMoments, searchQuery])

  // Reset pagination when search changes
  useEffect(() => {
    setDisplayCount(PAGE_SIZE)
  }, [searchQuery])

  const displayedItems = filtered.slice(0, displayCount)
  const hasMore = displayCount < filtered.length

  // -- handlers --
  const loadMore = useCallback(() => {
    setDisplayCount((prev) => prev + PAGE_SIZE)
  }, [])

  const handleMomentClick = (moment: DiscoverMoment) => {
    setSelectedMoment(moment)
    setIsModalOpen(true)
  }

  // -- render --
  if (error) {
    return (
      <div className="mt-6 text-center text-sm text-red-500">
        Failed to load moments. Please try again later.
      </div>
    )
  }

  if (!isLoading && displayedItems.length === 0) {
    return (
      <div className="mt-6 text-center text-sm text-slate-500">
        No moments found.
      </div>
    )
  }

  return (
    <section className="mt-6">
      {/* grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {displayedItems.map((moment) => (
          <MomentCard key={moment.id} moment={moment} onClick={handleMomentClick} />
        ))}
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <MomentSkeleton key={`skeleton-${i}`} />)}
      </div>

      {/* sentinel */}
      <InfiniteScrollSentinel onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading} />

      {/* modal */}
      <MomentViewModal
        moment={selectedMoment}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </section>
  )
}
