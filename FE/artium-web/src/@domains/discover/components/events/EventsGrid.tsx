// react
import { useState } from 'react'

// @domains - discover
import { EventCard } from '@domains/discover/components/cards/EventCard'
import { mockEvents, type EventStatus } from '@domains/discover/mock/mockEvents'
import { EventSkeleton } from '@domains/discover/components/skeletons/DiscoverSkeletons'

// @shared
import { useMockInfiniteScroll } from '@shared/hooks/useMockInfiniteScroll'
import { InfiniteScrollSentinel } from '@shared/components/ui/InfiniteScrollSentinel'

const buildInitialStatuses = () =>
  mockEvents.reduce<Record<string, EventStatus>>((acc, event) => {
    acc[event.id] = event.status
    return acc
  }, {})

export const EventsGrid = () => {
  // -- state --
  const [statusById, setStatusById] = useState(buildInitialStatuses)

  const { displayedItems, isLoading, hasMore, loadMore } = useMockInfiniteScroll({
    allItems: mockEvents,
    initialCount: 8,
    loadMoreCount: 8,
  })

  // -- derived --

  // -- handlers --
  const handleStatusChange = (eventId: string, nextStatus: EventStatus) => {
    setStatusById((prev) => ({
      ...prev,
      [eventId]: nextStatus,
    }))
  }

  // -- render --
  return (
    <section className="mt-6">
      {/* grid */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedItems.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            status={statusById[event.id] ?? 'rsvp'}
            onStatusChange={(nextStatus) => handleStatusChange(event.id, nextStatus)}
          />
        ))}
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <EventSkeleton key={`skeleton-${i}`} />)}
      </div>

      {/* sentinel */}
      <InfiniteScrollSentinel onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading} />
    </section>
  )
}

