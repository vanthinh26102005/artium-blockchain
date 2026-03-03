import { EditorialDiscoverBanner } from '@domains/editorial/components/EditorialDiscoverBanner'
import { EDITORIAL_ITEMS } from '@domains/editorial/data/editorials'
import { EventCard, Event, EventStatus } from '@domains/events/components/cards/EventCard'
import { InviteEventModal } from '@domains/events/modals/InviteEventModal'
import { ShareEventModal } from '@domains/events/modals/ShareEventModal'
import { HostingEvent } from '@domains/events/state/useHostingEventsStore'
import { useEventsStore } from '@domains/events/state/useEventsStore'
import { useShallow } from 'zustand/react/shallow'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { mockHomeArtworks } from '@domains/home/mock/mockHomeArtworks'
import { mockHomeEvents } from '@domains/home/mock/mockHomeEvents'
import { ToastPortal } from '@domains/events/components/ui/ToastPortal'

// --- Mock Data ---

const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
})

// Multiple event images for variety
const MOCK_EVENT_IMAGES = [
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=600&h=400',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600&h=400',
]

// Mock avatar images
const MOCK_AVATARS = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
]

// Use real items for Editorials with avatar
const EDITORIALS = EDITORIAL_ITEMS.slice(0, 10).map((item, index) => ({
    id: item.id,
    title: item.title,
    author: item.author,
    date: item.publishedAt,
    readTime: item.readTime,
    category: item.category,
    imageUrl: item.imageUrl,
    avatarUrl: MOCK_AVATARS[index % MOCK_AVATARS.length],
}))

// MOCK_EVENT_IMAGES and EVENTS definitions removed as we now use mockHomeEvents

const NEW_ARTWORKS = mockHomeArtworks.slice(0, 12)

// --- Components ---

interface EditorialCardProps {
    id: string
    title: string
    author: string
    date: string
    readTime: string
    category: string
    imageUrl: string
    avatarUrl: string
}

const EditorialCard = ({
    id,
    title,
    author,
    date,
    readTime,
    category,
    imageUrl,
    avatarUrl,
}: EditorialCardProps) => {
    const router = useRouter()
    return (
        <div
            className="group w-[300px] shrink-0 cursor-pointer md:w-[350px]"
            onClick={() => router.push(`/editorial/${id}`)}
        >
            <div className="relative mb-4 aspect-16/10 overflow-hidden rounded-xl">
                <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500">{category}</span>
                <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
                    {title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <img
                        src={avatarUrl}
                        alt={author}
                        className="h-4 w-4 rounded-full object-cover"
                    />
                    <span>{author}</span>
                    <span>•</span>
                    <span>{date}</span>
                    <span>•</span>
                    <span>{readTime}</span>
                </div>
            </div>
        </div>
    )
}


const ArtworkCard = ({ item }: { item: (typeof NEW_ARTWORKS)[0] }) => {
    const router = useRouter()
    const priceLabel = item.isSold ? 'Sold' : priceFormatter.format(item.price)

    return (
        <div
            className="group w-[240px] shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-3 transition-shadow hover:shadow-md md:w-[280px]"
            onClick={() => router.push(`/artworks/${item.id}`)}
        >
            <div className="relative mb-3 aspect-3/4 overflow-hidden rounded-lg bg-slate-100">
                <img
                    src={item.imageMedium}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <img
                        src={item.creator.coverImage || `https://i.pravatar.cc/64?u=${item.creator.username}`}
                        alt={item.creator.fullName}
                        className="h-5 w-5 rounded-full object-cover"
                    />
                    <span className="truncate text-xs font-semibold text-slate-900">{item.creator.fullName}</span>
                    <svg className="h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <h3 className="line-clamp-1 text-sm font-bold text-slate-900">{item.title}</h3>
                <div className="flex items-center">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-900">
                        <span className={`h-1.5 w-1.5 rounded-full ${item.isSold ? 'bg-slate-400' : 'bg-blue-600'}`}></span>
                        {priceLabel}
                    </span>
                </div>
            </div>
        </div>
    )
}

const DiscoverBanner = () => (
    <div className="flex min-h-[300px] w-full flex-col overflow-hidden bg-slate-50 lg:flex-row">
        <div className="flex flex-1 flex-col justify-center p-12 lg:max-w-md">
            <h2 className="mb-6 text-3xl font-bold text-slate-900">
                Discover Art Tailored to Your Taste
            </h2>
            <div>
                <button className="cursor-pointer rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
                    Browse
                </button>
            </div>
        </div>
        <div className="grid flex-1 grid-cols-5 gap-0 overflow-hidden opacity-90">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="relative h-full w-full">
                    <img
                        src={`https://images.unsplash.com/photo-${i === 1
                            ? '1547826039-bfc35e0f1ea8'
                            : i === 2
                                ? '1579783902614-a3fb392796a5'
                                : i === 3
                                    ? '1549490349-8643362247b5'
                                    : i === 4
                                        ? '1541963463532-d68292c34b19'
                                        : '1569172131633-cf85ea14418d'
                            }?auto=format&fit=crop&q=80&w=400&h=800`}
                        alt="Art"
                        className="h-full w-full object-cover"
                    />
                </div>
            ))}
        </div>
    </div>
)

export const DashboardView = () => {
    const router = useRouter()
    // Subscribe to home events from the store
    const events = useEventsStore(useShallow(state =>
        state.allEvents.filter(e => e.id.startsWith('home-ev-'))
    ))
    const updateRsvpStatus = useEventsStore(state => state.updateRsvpStatus)

    // State for modals - using HostingEvent type for modal compatibility
    const [inviteModalOpen, setInviteModalOpen] = useState(false)
    const [inviteModalEvent, setInviteModalEvent] = useState<HostingEvent | null>(null)
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const [shareModalEvent, setShareModalEvent] = useState<HostingEvent | null>(null)
    const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

    const navigateToSection = (section: string) => {
        router.push({
            pathname: '/homepage/[section]',
            query: { section },
        })
    }

    const handleRsvpChange = (eventId: string, status: EventStatus) => {
        updateRsvpStatus(eventId, status)
        setToast({
            message: 'Your response updated!',
            variant: 'success',
        })
        setTimeout(() => setToast(null), 3000)
    }

    const handleInvite = (event: Event) => {
        // Cast to HostingEvent for modal compatibility
        setInviteModalEvent(event as unknown as HostingEvent)
        setInviteModalOpen(true)
    }

    const handleShare = (event: Event) => {
        // Cast to HostingEvent for modal compatibility
        setShareModalEvent(event as unknown as HostingEvent)
        setShareModalOpen(true)
    }

    return (
        <div className="w-full space-y-12 py-8">
            <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

            <div className="space-y-12">
                {/* Weekly Editorial */}
                <section>
                    <div
                        className="group mb-6 flex cursor-pointer items-center gap-2 pr-6"
                        onClick={() => navigateToSection('editorials')}
                    >
                        <h2 className="text-2xl font-bold text-slate-900">Weekly Editorial For You</h2>
                        <ChevronRight className="h-6 w-6 text-slate-400 transition-colors group-hover:text-slate-900" />
                    </div>
                    <div className="no-scrollbar -mr-6 flex gap-6 overflow-x-auto pb-4 pr-6">
                        {EDITORIALS.map((item) => (
                            <EditorialCard key={item.id} {...item} />
                        ))}
                    </div>
                </section>

                {/* Upcoming Events */}
                <section className="overflow-visible">
                    <div
                        className="group mb-6 flex cursor-pointer items-center gap-2 pr-6"
                        onClick={() => navigateToSection('events')}
                    >
                        <h2 className="text-2xl font-bold text-slate-900">Upcoming Events</h2>
                        <ChevronRight className="h-6 w-6 text-slate-400 transition-colors group-hover:text-slate-900" />
                    </div>
                    <div className="no-scrollbar -mr-6 flex gap-6 overflow-x-auto overflow-y-visible pb-[200px] pr-6 -mb-[180px]">
                        {events.map((event) => (
                            <div key={event.id} className="w-[300px] shrink-0 md:w-[380px]">
                                <EventCard
                                    event={event}
                                    onRsvpChange={handleRsvpChange}
                                    onInvite={handleInvite}
                                    onShare={handleShare}
                                    onClick={(id) => router.push(`/homepage/events/${id}`)}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* New Artworks */}
                <section>
                    <div
                        className="group mb-6 flex cursor-pointer items-center gap-2 pr-6"
                        onClick={() => navigateToSection('new-artworks')}
                    >
                        <h2 className="text-2xl font-bold text-slate-900">
                            New Artworks From Users You Follow
                        </h2>
                        <ChevronRight className="h-6 w-6 text-slate-400 transition-colors group-hover:text-slate-900" />
                    </div>
                    <div className="no-scrollbar -mr-6 flex gap-6 overflow-x-auto pb-4 pr-6">
                        {NEW_ARTWORKS.map((artwork) => (
                            <ArtworkCard key={artwork.id} item={artwork} />
                        ))}
                    </div>
                </section>
            </div>

            {/* Discover Banner */}
            <EditorialDiscoverBanner />

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
    )
}
