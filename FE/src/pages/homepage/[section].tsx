import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Metadata } from '@/components/SEO/Metadata'
import { SidebarLayout } from '@shared/components/layout/SidebarLayout'
import type { NextPageWithLayout } from '@shared/types/next'
import { EDITORIAL_ITEMS } from '@domains/editorial/data/editorials'
import { EventCard, Event, EventStatus } from '@domains/events/components/cards/EventCard'
import { HostingEvent } from '@domains/events/state/useHostingEventsStore'
import { InviteEventModal } from '@domains/events/modals/InviteEventModal'
import { ShareEventModal } from '@domains/events/modals/ShareEventModal'
import { mockHomeEvents } from '@domains/home/mock/mockHomeEvents'
import { mockHomeArtworks } from '@domains/home/mock/mockHomeArtworks'
import { ToastPortal } from '@domains/events/components/ui/ToastPortal'
import { useEventsStore } from '@domains/events/state/useEventsStore'
import { useShallow } from 'zustand/react/shallow'

/**
 * priceFormatter - Utility function
 * @returns void
 */
const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
})

// Use real editorial data for the editorials section
const EDITORIALS_DATA = EDITORIAL_ITEMS.slice(0, 20).map((item) => ({
    id: item.id,
    title: item.title,
/**
 * EDITORIALS_DATA - React component
 * @returns React element
 */
    author: item.author,
    imageUrl: item.imageUrl,
}))

const MOCK_EVENT_IMAGES = [
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600&h=400',
/**
 * MOCK_EVENT_IMAGES - React component
 * @returns React element
 */
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600&h=400',
]

// Events data
const EVENTS_DATA_INITIAL: (Event & { locationType: 'in-person' | 'online'; description: string; createdAt: string })[] = [
    {
        id: 'event-1',
        title: 'ARTEXPO New York',
        location: 'New York, NY, USA',
        locationType: 'in-person',
        startDateTime: '2025-04-09T22:00:00',
        endDateTime: '2025-04-09T23:00:00',
        timeZone: 'America/New_York',
/**
 * EVENTS_DATA_INITIAL - React component
 * @returns React element
 */
        types: ['art-fair'],
        visibility: 'public',
        attendees: 3,
        coverImageUrl: MOCK_EVENT_IMAGES[0],
        rsvpStatus: 'rsvp',
        description: 'The largest art trade show in America, featuring contemporary and fine art.',
        createdAt: '2025-01-01T00:00:00Z',
    },
    {
        id: 'event-2',
        title: 'Art Basel Miami Beach',
        location: 'Miami Beach, FL, USA',
        locationType: 'in-person',
        startDateTime: '2025-12-06T18:00:00',
        endDateTime: '2025-12-06T22:00:00',
        timeZone: 'America/New_York',
        types: ['art-fair'],
        visibility: 'public',
        attendees: 12,
        coverImageUrl: MOCK_EVENT_IMAGES[1],
        rsvpStatus: 'rsvp',
        description: 'Premier international art fair showcasing modern and contemporary works.',
        createdAt: '2025-01-01T00:00:00Z',
    },
    {
        id: 'event-3',
        title: 'Frieze London',
        location: "Regent's Park, London, UK",
        locationType: 'in-person',
        startDateTime: '2025-10-11T10:00:00',
        endDateTime: '2025-10-11T18:00:00',
        timeZone: 'Europe/London',
        types: ['art-fair'],
        visibility: 'public',
        attendees: 8,
        coverImageUrl: MOCK_EVENT_IMAGES[2],
        rsvpStatus: 'rsvp',
        description: 'Leading contemporary art fair held annually in London.',
        createdAt: '2025-01-01T00:00:00Z',
    },
    {
        id: 'event-4',
        title: 'The Armory Show',
        location: 'Javits Center, New York, NY, USA',
        locationType: 'in-person',
        startDateTime: '2025-09-05T12:00:00',
        endDateTime: '2025-09-05T20:00:00',
        timeZone: 'America/New_York',
        types: ['art-fair'],
        visibility: 'public',
        attendees: 5,
        coverImageUrl: MOCK_EVENT_IMAGES[3],
        rsvpStatus: 'rsvp',
        description: 'One of the most influential art fairs in the United States.',
        createdAt: '2025-01-01T00:00:00Z',
    },
    {
        id: 'event-5',
        title: 'Art Paris',
        location: 'Grand Palais Éphémère, Paris, France',
        locationType: 'in-person',
        startDateTime: '2025-04-03T14:00:00',
        endDateTime: '2025-04-03T22:00:00',
        timeZone: 'Europe/Paris',
        types: ['art-fair'],
        visibility: 'public',
        attendees: 7,
        coverImageUrl: MOCK_EVENT_IMAGES[4],
        rsvpStatus: 'rsvp',
        description: 'Spring art fair dedicated to modern and contemporary art.',
        createdAt: '2025-01-01T00:00:00Z',
    },
    {
        id: 'event-6',
        title: 'TEFAF Maastricht',
        location: 'MECC Maastricht, Netherlands',
        locationType: 'in-person',
        startDateTime: '2025-03-09T11:00:00',
        endDateTime: '2025-03-09T19:00:00',
        timeZone: 'Europe/Amsterdam',
        types: ['art-fair'],
        visibility: 'private',
        attendees: 4,
        coverImageUrl: MOCK_EVENT_IMAGES[5],
        rsvpStatus: 'rsvp',
        description: "The world's premier art and antiques fair.",
        createdAt: '2025-01-01T00:00:00Z',
    },
    {
        id: 'event-7',
        title: 'Documenta',
        location: 'Kassel, Germany',
        locationType: 'in-person',
        startDateTime: '2025-06-18T09:00:00',
        endDateTime: '2025-06-18T18:00:00',
        timeZone: 'Europe/Berlin',
        types: ['exhibition'],
        visibility: 'public',
        attendees: 15,
        coverImageUrl: MOCK_EVENT_IMAGES[6],
        rsvpStatus: 'rsvp',
        description: 'Exhibition of contemporary art held every five years.',
        createdAt: '2025-01-01T00:00:00Z',
    },
    {
        id: 'event-8',
        title: 'Venice Biennale',
        location: 'Giardini, Venice, Italy',
        locationType: 'in-person',
        startDateTime: '2025-04-20T10:00:00',
        endDateTime: '2025-04-20T19:00:00',
        timeZone: 'Europe/Rome',
        types: ['exhibition'],
        visibility: 'public',
        attendees: 20,
        coverImageUrl: MOCK_EVENT_IMAGES[7],
        rsvpStatus: 'rsvp',
        description: 'Prestigious international art exhibition showcasing global artists.',
        createdAt: '2025-01-01T00:00:00Z',
    },
]

// Mock data for artworks section
const ARTWORKS_DATA = mockHomeArtworks

const SectionDetail: NextPageWithLayout = () => {
    const router = useRouter()
    const { section } = router.query
    const events = useEventsStore(useShallow(state =>
        state.allEvents.filter(e => e.id.startsWith('home-ev-'))
    ))
    const updateRsvpStatus = useEventsStore(state => state.updateRsvpStatus)

    const [inviteModalOpen, setInviteModalOpen] = useState(false)
    const [inviteModalEvent, setInviteModalEvent] = useState<HostingEvent | null>(null)
/**
 * ARTWORKS_DATA - React component
 * @returns React element
 */
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const [shareModalEvent, setShareModalEvent] = useState<HostingEvent | null>(null)
    const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

    const handleRsvpChange = (eventId: string, status: EventStatus) => {
/**
 * SectionDetail - React component
 * @returns React element
 */
        updateRsvpStatus(eventId, status)
        setToast({
            message: 'Your response updated!',
            variant: 'success',
/**
 * router - Utility function
 * @returns void
 */
        })
        setTimeout(() => setToast(null), 3000)
    }

    const handleInvite = (event: Event) => {
/**
 * events - Utility function
 * @returns void
 */
        setInviteModalEvent(event as unknown as HostingEvent)
        setInviteModalOpen(true)
    }

    const handleShare = (event: Event) => {
        setShareModalEvent(event as unknown as HostingEvent)
/**
 * updateRsvpStatus - Utility function
 * @returns void
 */
        setShareModalOpen(true)
    }

    // Determine title based on section param
    const getTitle = () => {
        if (section === 'editorials') return 'Weekly Editorials For You'
        if (section === 'new-artworks') return 'New Artworks From Users You Follow'
        if (section === 'events') return 'Upcoming Events'
        return 'Collection'
    }

/**
 * handleRsvpChange - Utility function
 * @returns void
 */
    const handleEditorialClick = (id: string) => {
        router.push(`/editorial/${id}`)
    }

    return (
        <>
            <Metadata title={`${getTitle()} | Artium`} />
            <div className="w-full min-h-[80vh] px-6 py-8 pb-48">
                <div className="mb-8">
                    <Link
                        href="/homepage"
                        className="mb-4 inline-flex items-center text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
/**
 * handleInvite - Utility function
 * @returns void
 */
                    >
                        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">{getTitle()}</h1>
                </div>

                {/* Masonry Layout for Editorials and Artworks */}
                {(section === 'editorials' || section === 'new-artworks') && (
/**
 * handleShare - Utility function
 * @returns void
 */
                    <div className="gap-6 columns-1 md:columns-2 lg:columns-3 xl:columns-4">
                        {section === 'editorials' && EDITORIALS_DATA.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleEditorialClick(item.id)}
                                className="mb-6 cursor-pointer break-inside-avoid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                            >
                                <img
                                    src={item.imageUrl}
/**
 * getTitle - Utility function
 * @returns void
 */
                                    alt={item.title}
                                    className="h-auto w-full object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="mb-1 line-clamp-2 font-bold text-slate-900">{item.title}</h3>
                                    <p className="text-sm text-slate-500">By {item.author}</p>
                                </div>
                            </div>
                        ))}
                        {section === 'new-artworks' && ARTWORKS_DATA.map((item) => (
/**
 * handleEditorialClick - Utility function
 * @returns void
 */
                            <div
                                key={item.id}
                                onClick={() => router.push(`/artworks/${item.id}`)}
                                className="mb-6 cursor-pointer break-inside-avoid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                            >
                                <img
                                    src={item.imageMedium}
                                    alt={item.title}
                                    className="h-auto w-full object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="mb-1 font-bold text-slate-900">{item.title}</h3>
                                    <p className="mb-3 text-sm text-slate-500">By {item.creator.fullName}</p>
                                    <div className="flex items-center">
                                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-900">
                                            <span className={`h-1.5 w-1.5 rounded-full ${item.isSold ? 'bg-slate-400' : 'bg-blue-600'}`}></span>
                                            {item.isSold ? 'Sold' : priceFormatter.format(item.price)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Grid Layout for Events to maintain card aspect ratio and size */}
                {section === 'events' && (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
                        {events.map((item) => (
                            <div
                                key={item.id}
                                className="w-full"
                            >
                                <EventCard
                                    event={item}
                                    onRsvpChange={handleRsvpChange}
                                    onInvite={handleInvite}
                                    onShare={handleShare}
                                    onClick={(id) => router.push(`/homepage/events/${id}`)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {section !== 'editorials' && section !== 'new-artworks' && section !== 'events' && (
                    <p className="text-slate-500">Content coming soon...</p>
                )}

                {/* Invite Event Modal */}
                {inviteModalEvent && (
                    <InviteEventModal
                        open={inviteModalOpen}
                        onOpenChange={setInviteModalOpen}
                        event={inviteModalEvent}
                        onInviteSuccess={(recipientIds) => {
                            console.log(`Invitations sent to ${recipientIds.length} people`)
                        }}
                    />
                )}

                {/* Share Event Modal */}
                {shareModalEvent && (
                    <ShareEventModal
                        open={shareModalOpen}
                        onOpenChange={setShareModalOpen}
                        event={shareModalEvent}
                    />
                )}

                {toast && (
                    <ToastPortal
                        message={toast.message}
                        variant={toast.variant}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </>
    )
}

SectionDetail.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>

export default SectionDetail
