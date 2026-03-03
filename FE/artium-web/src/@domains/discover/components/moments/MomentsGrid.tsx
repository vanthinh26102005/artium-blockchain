// react
import { useState } from 'react'

// @domains - discover
import { MomentCard } from '@domains/discover/components/cards/MomentCard'
import { mockMoments, DiscoverMoment } from '@domains/discover/mock/mockMoments'
import { MomentSkeleton } from '@domains/discover/components/skeletons/DiscoverSkeletons'
import { MomentViewModal } from '@domains/discover/components/modals/MomentViewModal'

// @shared
import { useMockInfiniteScroll } from '@shared/hooks/useMockInfiniteScroll'
import { InfiniteScrollSentinel } from '@shared/components/ui/InfiniteScrollSentinel'

export const MomentsGrid = () => {
  // -- state --
  const { displayedItems, isLoading, hasMore, loadMore } = useMockInfiniteScroll({
    allItems: mockMoments,
    initialCount: 12,
    loadMoreCount: 12,
  })

  const [selectedMoment, setSelectedMoment] = useState<DiscoverMoment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // -- derived --

  // -- handlers --
  const handleMomentClick = (moment: DiscoverMoment) => {
    setSelectedMoment(moment)
    setIsModalOpen(true)
  }

  // -- render --
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

