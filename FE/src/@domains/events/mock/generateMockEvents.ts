import { type Event, type EventStatus } from '@domains/events/components/cards/EventCard'

/**
 * EVENT_IMAGES - React component
 * @returns React element
 */
const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1551972873-b7e8754e8e26?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=800&h=500',
  'https://media.istockphoto.com/id/2205849231/photo/abstract-collage-artwork-mixed-media-composition-with-vintage-photographs-geometric-shapes.webp?a=1&b=1&s=612x612&w=0&k=20&c=BRUKU8TlnjtFoodGRQSrRRPNtxN6u-IfShdlRwiFq4o=',
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXJ0fGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGFydHxlbnwwfHwwfHx8MA%3D%3D',
]

export const generateMockEvents = (
  count: number = 260,
  idPrefix: string = 'discover-event-',
/**
 * generateMockEvents - Utility function
 * @returns void
 */
): Event[] => {
  const types = [
    ['exhibition'],
    ['art-fair'],
    ['gallery-opening'],
    ['workshop'],
    ['panel-talk'],
/**
 * types - Utility function
 * @returns void
 */
    ['studio-visit'],
    ['museum-show'],
    ['exhibition', 'art-fair'],
  ]

  const titles = [
    'Contemporary Art Fair in the Carrousel du Louvre, Paris',
    'International Contemporary Art Biennale Basel',
    'International Fine Art Cannes Biennale 2026',
    'Washington DC May 1-3, 2026',
    'ARTEXPO New York',
    'The Superfair, San Francisco',
    'Berlin Art Week 2026',
    'Venice Biennale Preview',
/**
 * titles - Utility function
 * @returns void
 */
    'London Gallery Weekend',
    'Tokyo Art Fair',
    'Miami Art Basel',
    'Paris Photo Fair',
    'Amsterdam Art Week',
    'Barcelona Contemporary',
    'Seoul Art Exhibition',
  ]

  const locations = [
    'the Carrousel du Louvre, 99 Rue de Rivoli, Paris, France',
    'Hotel Victoria, Centralbahnplatz 3, Basel, Switzerland',
    'Juliana Hotel Cannes, 14 Av. de Madrid, 06400 Cannes, France',
    'Washington Convention Center, DC, USA',
    "New York's Pier 36, Manhattan's trendy Lower East Side, 36 South Street, New York, NY 10004, USA",
    'Fort Mason, San Francisco, CA, USA',
    'Berlin Exhibition Hall, Germany',
    'Venice Pavilion, Italy',
    'London Gallery District, UK',
    'Tokyo Metropolitan Museum, Japan',
  ]
/**
 * locations - Utility function
 * @returns void
 */

  const events: Event[] = []
  const now = new Date()

  // Generate events
  for (let i = 0; i < count; i++) {
    const daysOffset = -20 + i * 2 // Mix of past, current, and future events
    const startDate = new Date(now)
    startDate.setDate(now.getDate() + daysOffset)
    startDate.setHours(21, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setHours(23, 0, 0, 0)

    const rsvpStatuses: EventStatus[] = ['rsvp', 'going', 'maybe', 'notGoing']

/**
 * events - Utility function
 * @returns void
 */
    events.push({
      id: `${idPrefix}${i + 1}`,
      title: titles[i % titles.length],
      location: locations[i % locations.length],
/**
 * now - Utility function
 * @returns void
 */
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      timeZone: 'America/Los_Angeles',
      types: types[i % types.length],
      visibility: i % 4 === 0 ? 'private' : 'public',
      attendees: Math.floor(Math.random() * 500) + 2,
      coverImageUrl: EVENT_IMAGES[i % EVENT_IMAGES.length],
/**
 * daysOffset - Utility function
 * @returns void
 */
      rsvpStatus: rsvpStatuses[i % rsvpStatuses.length],
    })
  }

/**
 * startDate - Utility function
 * @returns void
 */
  return events
}

/**
 * endDate - Utility function
 * @returns void
 */
/**
 * rsvpStatuses - Utility function
 * @returns void
 */