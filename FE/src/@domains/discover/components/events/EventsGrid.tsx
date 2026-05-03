// react
import { useState, useEffect, useCallback, useMemo } from 'react'

// @domains - discover
import { EventCard } from '@domains/discover/components/cards/EventCard'
import type { DiscoverEvent, EventStatus } from '@domains/discover/mock/mockEvents'
import { EventSkeleton } from '@domains/discover/components/skeletons/DiscoverSkeletons'
import { mapEventToDiscover } from '@domains/discover/utils/discoverMappers'

// @shared
import eventsApis from '@shared/apis/eventsApis'
import { InfiniteScrollSentinel } from '@shared/components/ui/InfiniteScrollSentinel'

/**
 * PAGE_SIZE - React component
 * @returns React element
 */
const PAGE_SIZE = 8

type EventsGridProps = {
  searchQuery?: string
}

export const EventsGrid = ({ searchQuery = '' }: EventsGridProps) => {
  // -- state --
  const [allEvents, setAllEvents] = useState<DiscoverEvent[]>([])
/**
 * EventsGrid - React component
 * @returns React element
 */
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const [statusById, setStatusById] = useState<Record<string, EventStatus>>({})

  // Fetch all events once (flat array, no server-side pagination)
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    eventsApis
      .getDiscoverEvents()
      .then((raw) => {
        if (cancelled) return
        const mapped = raw.map(mapEventToDiscover)
        setAllEvents(mapped)
        setStatusById(
          mapped.reduce<Record<string, EventStatus>>((acc, e) => {
            acc[e.id] = e.status
            return acc
/**
 * mapped - Utility function
 * @returns void
 */
          }, {}),
        )
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error('Failed to fetch events'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!searchQuery) return allEvents
    const q = searchQuery.toLowerCase()
    return allEvents.filter(
      (e) => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q),
    )
  }, [allEvents, searchQuery])

  // Reset pagination when search changes
/**
 * filtered - Utility function
 * @returns void
 */
  useEffect(() => {
    setDisplayCount(PAGE_SIZE)
  }, [searchQuery])

  const displayedItems = filtered.slice(0, displayCount)
/**
 * q - Utility function
 * @returns void
 */
  const hasMore = displayCount < filtered.length

  // -- handlers --
  const loadMore = useCallback(() => {
    setDisplayCount((prev) => prev + PAGE_SIZE)
  }, [])

  const handleStatusChange = (eventId: string, nextStatus: EventStatus) => {
    setStatusById((prev) => ({
      ...prev,
      [eventId]: nextStatus,
    }))
  }

/**
 * displayedItems - Utility function
 * @returns void
 */
  // -- render --
  if (error) {
    return (
      <div className="mt-6 text-center text-sm text-red-500">
/**
 * hasMore - Utility function
 * @returns void
 */
        Failed to load events. Please try again later.
      </div>
    )
  }

  if (!isLoading && displayedItems.length === 0) {
/**
 * loadMore - Utility function
 * @returns void
 */
    return (
      <div className="mt-6 text-center text-sm text-slate-500">
        No events found.
      </div>
    )
  }

/**
 * handleStatusChange - Utility function
 * @returns void
 */
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

