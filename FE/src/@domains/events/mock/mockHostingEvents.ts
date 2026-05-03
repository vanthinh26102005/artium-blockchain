export type HostingEventStatus = 'going' | 'maybe' | 'notGoing' | 'rsvp'

export type HostingEvent = {
  id: string
  title: string
  location: string
  locationType: 'in-person' | 'online'
  address?: string
  venueDetails?: string
  onlineUrl?: string
  startDateTime: string // ISO string
  endDateTime: string // ISO string
  timeZone?: string
  types: string[]
  visibility: 'public' | 'private'
  description: string
  attendees: number
  coverImageUrl?: string
  createdAt: string
}

/**
 * createEventImage - Utility function
 * @returns void
 */
const createEventImage = (primary: string, secondary: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${primary}"/><stop offset="100%" stop-color="${secondary}"/></linearGradient></defs><rect width="960" height="540" fill="url(#g)"/></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
/**
 * svg - Utility function
 * @returns void
 */

export const eventImages = [
  createEventImage('#0f172a', '#334155'),
  createEventImage('#111827', '#1e293b'),
  createEventImage('#0f172a', '#1e40af'),
]

/**
 * eventImages - Utility function
 * @returns void
 */
const addHours = (iso: string, hours: number) => {
  const d = new Date(iso)
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

export const mockHostingEvents: HostingEvent[] = [
  {
    id: 'host-001',
    /**
     * addHours - Utility function
     * @returns void
     */
    title: 'The Other Art Fair Los Angeles - 2026',
    location: '3021 Airport Avenue, Santa Monica, CA, USA',
    locationType: 'in-person',
    address: '3021 Airport Avenue, Santa Monica, CA, USA',
    /**
     * d - Utility function
     * @returns void
     */
    startDateTime: '2026-02-26T23:00:00Z',
    endDateTime: addHours('2026-02-26T23:00:00Z', 1),
    timeZone: 'UTC',
    createdAt: '2025-11-20T09:00:00Z',
    types: ['art-fair'],
    visibility: 'public',
    description: 'Discover emerging artists in Los Angeles.',
    attendees: 0,
    /**
     * mockHostingEvents - Utility function
     * @returns void
     */
    coverImageUrl: eventImages[0],
  },
  {
    id: 'host-002',
    title: 'Harlem Fine Art Show',
    location: 'The Glasshouse, 660 12th Ave, New York, NY, USA',
    locationType: 'in-person',
    address: 'The Glasshouse, 660 12th Ave, New York, NY, USA',
    startDateTime: '2026-02-21T06:00:00Z',
    endDateTime: addHours('2026-02-21T06:00:00Z', 1),
    timeZone: 'UTC',
    createdAt: '2025-10-02T13:30:00Z',
    types: ['exhibition', 'art-fair'],
    visibility: 'public',
    description: 'Annual fine art showcase in NYC.',
    attendees: 0,
    coverImageUrl: eventImages[1],
  },
  {
    id: 'host-003',
    title: 'The Superfair, Austin TX',
    location: 'Fair Market Austin, 1100 E 5th St, Austin, TX 78702, USA',
    locationType: 'in-person',
    address: 'Fair Market Austin, 1100 E 5th St, Austin, TX 78702, USA',
    startDateTime: '2026-02-21T05:00:00Z',
    endDateTime: addHours('2026-02-21T05:00:00Z', 1),
    timeZone: 'UTC',
    createdAt: '2025-09-18T15:45:00Z',
    types: ['art-fair'],
    visibility: 'public',
    description: 'Large-scale art fair in Austin.',
    attendees: 0,
    coverImageUrl: eventImages[2],
  },
]
