import { HostingEvent } from '@domains/events/mock/mockHostingEvents'

// Using unsplash images for variety
const MOCK_HOME_EVENT_IMAGES = [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800&h=500',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800&h=500',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800&h=500',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800&h=500',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800&h=500',
    'https://images.unsplash.com/photo-1551972873-b7e8754e8e26?auto=format&fit=crop&q=80&w=800&h=500',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800&h=500',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=800&h=500'
]

const addDays = (date: Date, days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d.toISOString()
}

const now = new Date()

export const mockHomeEvents: HostingEvent[] = [
    {
        id: 'home-ev-001',
        title: 'Modern Art Exhibition 2026',
        location: 'San Francisco, CA, USA',
        locationType: 'in-person',
        address: '151 3rd St, San Francisco, CA 94103, USA',
        startDateTime: addDays(now, 5),
        endDateTime: addDays(now, 5),
        timeZone: 'America/Los_Angeles',
        types: ['exhibition'],
        visibility: 'public',
        description: 'A showcase of the most influential modern artists of the 21st century.',
        attendees: 120,
        coverImageUrl: MOCK_HOME_EVENT_IMAGES[0],
        createdAt: new Date().toISOString(),
    },
    {
        id: 'home-ev-002',
        title: 'Digital Art Summit',
        location: 'Austin, TX, USA',
        locationType: 'in-person',
        address: '500 E Cesar Chavez St, Austin, TX 78701, USA',
        startDateTime: addDays(now, 10),
        endDateTime: addDays(now, 12),
        timeZone: 'America/Chicago',
        types: ['conference'],
        visibility: 'public',
        description: 'Exploring the future of digital art and NFTs.',
        attendees: 350,
        coverImageUrl: MOCK_HOME_EVENT_IMAGES[1],
        createdAt: new Date().toISOString(),
    },
    {
        id: 'home-ev-003',
        title: 'Outdoor Sculpture Walk',
        location: 'Chicago, IL, USA',
        locationType: 'in-person',
        address: '201 E Randolph St, Chicago, IL 60602, USA',
        startDateTime: addDays(now, 15),
        endDateTime: addDays(now, 15),
        timeZone: 'America/Chicago',
        types: ['tour'],
        visibility: 'public',
        description: 'Guided tour through the city\'s most iconic sculptures.',
        attendees: 45,
        coverImageUrl: MOCK_HOME_EVENT_IMAGES[2],
        createdAt: new Date().toISOString(),
    },
    {
        id: 'home-ev-004',
        title: 'Abstract Photography Workshop',
        location: 'New York, NY, USA',
        locationType: 'in-person',
        address: '11 W 53rd St, New York, NY 10019, USA',
        startDateTime: addDays(now, 20),
        endDateTime: addDays(now, 20),
        timeZone: 'America/New_York',
        types: ['workshop'],
        visibility: 'public',
        description: 'Learn the techniques of abstract photography from industry professionals.',
        attendees: 25,
        coverImageUrl: MOCK_HOME_EVENT_IMAGES[3],
        createdAt: new Date().toISOString(),
    },
    {
        id: 'home-ev-005',
        title: 'Gallery Night Live',
        location: 'London, UK',
        locationType: 'in-person',
        address: 'Trafalgar Square, London WC2N 5DN, UK',
        startDateTime: addDays(now, 25),
        endDateTime: addDays(now, 25),
        timeZone: 'Europe/London',
        types: ['social'],
        visibility: 'public',
        description: 'An evening of art, music, and networking at the National Gallery.',
        attendees: 200,
        coverImageUrl: MOCK_HOME_EVENT_IMAGES[4],
        createdAt: new Date().toISOString(),
    },
    {
        id: 'home-ev-006',
        title: 'Contemporary Ceramics Fair',
        location: 'Tokyo, Japan',
        locationType: 'in-person',
        address: '3-21-1 Nihonbashi Hamacho, Chuo City, Tokyo 103-0007, Japan',
        startDateTime: addDays(now, 30),
        endDateTime: addDays(now, 32),
        timeZone: 'Asia/Tokyo',
        types: ['art-fair'],
        visibility: 'public',
        description: 'Celebrating the finest contemporary ceramics from around the world.',
        attendees: 150,
        coverImageUrl: MOCK_HOME_EVENT_IMAGES[5],
        createdAt: new Date().toISOString(),
    }
]
