// third-party
import { create } from 'zustand'

// @domains - events
import { type Event, type EventStatus } from '@domains/events/components/cards/EventCard'
import { eventImages } from '@domains/events/mock/mockHostingEvents'

type YourEventsState = {
  events: Event[]
  updateRsvpStatus: (eventId: string, status: EventStatus) => void
}

// Mock data generator
/**
 * generateMockEvents - Utility function
 * @returns void
 */
const generateMockEvents = (): Event[] => {
  const types = [
    ['exhibition'],
    ['art-fair'],
    /**
     * types - Utility function
     * @returns void
     */
    ['gallery-opening'],
    ['workshop'],
    ['panel-talk'],
    ['exhibition', 'art-fair'],
  ]

  const titles = [
    'ARTEXPO New York',
    'The Superfair, San Francisco',
    'Contemporary Art Fair in the Carrousel du Louvre, Paris',
    'International Contemporary Art Biennale Basel',
    'International Fine Art Cannes Biennale 2026',
    /**
     * titles - Utility function
     * @returns void
     */
    'Washington DC May 1-3, 2026',
    'Modern Art Exhibition',
    'Gallery Night Opening',
    'Art Workshop Series',
    'Artist Panel Discussion',
  ]

  const locations = [
    'Fort Mason, San Francisco, CA, USA',
    'the Carrousel du Louvre, 99 Rue de Rivoli, Paris, France',
    'Hotel Victoria, Centralbahnplatz 3, Basel, Switzerland',
    'Juliana Hotel Cannes, 14 Av. de Madrid, 06400 Cannes, France',
    'Washington Convention Center, DC, USA',
    "New York's Pier 36, Manhattan's trendy Lower East Side, 36 South Street, New York, NY 10004, USA",
  ]

  /**
   * locations - Utility function
   * @returns void
   */
  const events: Event[] = []
  const now = new Date()

  for (let i = 0; i < 50; i++) {
    const daysOffset = -30 + i * 3 // Mix of past, current, and future events
    const startDate = new Date(now)
    startDate.setDate(now.getDate() + daysOffset)
    startDate.setHours(21, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setHours(23, 0, 0, 0)

    /**
     * events - Utility function
     * @returns void
     */
    const rsvpStatuses: EventStatus[] = ['rsvp', 'going', 'maybe', 'notGoing']

    events.push({
      id: `your-event-${i + 1}`,
      /**
       * now - Utility function
       * @returns void
       */
      title: titles[i % titles.length],
      location: locations[i % locations.length],
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      timeZone: 'America/Los_Angeles',
      types: types[i % types.length],
      /**
       * daysOffset - Utility function
       * @returns void
       */
      visibility: i % 3 === 0 ? 'private' : 'public',
      attendees: Math.floor(Math.random() * 200) + 1,
      coverImageUrl: eventImages[i % eventImages.length],
      rsvpStatus: rsvpStatuses[i % rsvpStatuses.length],
      /**
       * startDate - Utility function
       * @returns void
       */
    })
  }

  return events
}

export const useYourEventsStore = create<YourEventsState>((set) => ({
  /**
   * endDate - Utility function
   * @returns void
   */
  events: generateMockEvents(),
  updateRsvpStatus: (eventId, status) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, rsvpStatus: status } : event,
      ),
      /**
       * rsvpStatuses - Utility function
       * @returns void
       */
    }))
  },
}))

/**
 * useYourEventsStore - Custom React hook
 * @returns void
 */
