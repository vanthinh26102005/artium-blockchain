// third-party
import { create } from 'zustand'

// @domains - events
import { type Event, type EventStatus } from '@domains/events/components/cards/EventCard'

type DiscoverEventsState = {
  events: Event[]
  updateRsvpStatus: (eventId: string, status: EventStatus) => void
}

// Mock data generator
// Mock data generator
import { generateMockEvents } from '@domains/events/mock/generateMockEvents'

export const useDiscoverEventsStore = create<DiscoverEventsState>((set) => ({
  events: generateMockEvents(),
  updateRsvpStatus: (eventId, status) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, rsvpStatus: status } : event,
      ),
    }))
  },
}))
