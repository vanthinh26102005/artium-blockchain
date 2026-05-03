// third-party
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

// @domains - events
import { type Event, type EventStatus } from '@domains/events/components/cards/EventCard'
import eventsApis from '@shared/apis/eventsApis'
import { mapApiEventToEvent } from '@domains/events/utils/eventMappers'
import { mockHomeEvents } from '@domains/home/mock/mockHomeEvents'
import { generateMockEvents } from '@domains/events/mock/generateMockEvents'

type EventsState = {
  allEvents: Event[]
  isLoading: boolean
  hasLoaded: boolean
  error?: string | null
  loadDiscoverEvents: () => Promise<void>
  updateRsvpStatus: (eventId: string, status: EventStatus) => void
}

/**
 * useEventsStore - Custom React hook
 * @returns void
 */
export const useEventsStore = create<EventsState>((set) => ({
  allEvents: [
    ...generateMockEvents(),
    ...mockHomeEvents.map((e) => ({ ...e, rsvpStatus: 'rsvp' as EventStatus })),
  ],
  isLoading: false,
  hasLoaded: false,
  error: null,

  loadDiscoverEvents: async () => {
    set({ isLoading: true, error: null })
    try {
      const events = await eventsApis.getDiscoverEvents()
      set({
        allEvents: events.map((event) => mapApiEventToEvent(event)),
/**
 * events - Utility function
 * @returns void
 */
        isLoading: false,
        hasLoaded: true,
      })
    } catch (error) {
      set({
        isLoading: false,
        hasLoaded: true,
        error: error instanceof Error ? error.message : 'Failed to load events',
      })
    }
  },

  updateRsvpStatus: (eventId, status) => {
    set((state) => ({
      allEvents: state.allEvents.map((event) =>
        event.id === eventId ? { ...event, rsvpStatus: status } : event,
      ),
    }))
  },
}))

// Selectors for components to use - use useShallow to prevent infinite loops
export const useYourEvents = () =>
  useEventsStore(
    useShallow((state) => state.allEvents.filter((event) => event.rsvpStatus === 'going')),
  )

export const useDiscoverEvents = () => useEventsStore(useShallow((state) => state.allEvents))
/**
 * useYourEvents - Custom React hook
 * @returns void
 */

/**
 * useDiscoverEvents - Custom React hook
 * @returns void
 */