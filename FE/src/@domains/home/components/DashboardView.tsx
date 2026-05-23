import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  GalleryVerticalEnd,
  Mail,
  MapPin,
  Palette,
  Share2,
  Sparkles,
} from 'lucide-react'
import { EDITORIAL_ITEMS } from '@domains/editorial/data/editorials'
import { EventCard, type Event, type EventStatus } from '@domains/events/components/cards/EventCard'
import { ToastPortal } from '@domains/events/components/ui/ToastPortal'
import { InviteEventModal } from '@domains/events/modals/InviteEventModal'
import { ShareEventModal } from '@domains/events/modals/ShareEventModal'
import type { HostingEvent } from '@domains/events/state/useHostingEventsStore'
import { useEventsStore } from '@domains/events/state/useEventsStore'
import { mockHomeArtworks } from '@domains/home/mock/mockHomeArtworks'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
]

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

const NEW_ARTWORKS = mockHomeArtworks.slice(0, 12)

type EditorialItem = (typeof EDITORIALS)[number]
type ArtworkItem = (typeof NEW_ARTWORKS)[number]

type SectionHeaderProps = {
  title: string
  eyebrow?: string
  actionLabel?: string
  onAction?: () => void
}

const formatEventDate = (event: Event) => {
  const date = new Date(event.startDateTime)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    timeZone: event.timeZone,
  }).format(date)
}

const formatEventTime = (event: Event) => {
  const date = new Date(event.startDateTime)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: event.timeZone,
  }).format(date)
}

const SectionHeader = ({
  title,
  eyebrow,
  actionLabel = 'View all',
  onAction,
}: SectionHeaderProps) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow ? (
        <p className="mb-2 text-[10px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-monument-grotes text-2xl leading-none font-semibold tracking-normal text-slate-950 uppercase sm:text-3xl">
        {title}
      </h2>
    </div>
    {onAction ? (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex min-h-10 w-fit cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
      >
        {actionLabel}
        <ChevronRight className="h-4 w-4" />
      </button>
    ) : null}
  </div>
)

const VerifiedMark = () => (
  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
    ✓
  </span>
)

const ArtworkCard = ({
  item,
  onClick,
  featured = false,
}: {
  item: ArtworkItem
  onClick: () => void
  featured?: boolean
}) => {
  const priceLabel = item.isSold ? 'Sold' : priceFormatter.format(item.price)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group min-w-0 cursor-pointer overflow-hidden rounded-[8px] border border-black/10 bg-white/82 text-left shadow-[0_18px_50px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-md transition hover:-translate-y-1 hover:border-black/18 hover:shadow-[0_26px_70px_rgba(15,23,42,0.13)]',
        featured ? 'grid gap-0 md:grid-cols-[0.44fr_0.56fr]' : 'w-[240px] shrink-0 sm:w-[270px]',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-slate-100',
          featured ? 'min-h-[280px] md:min-h-full' : 'aspect-[3/4]',
        )}
      >
        <Image
          src={item.imageMedium}
          alt={item.title}
          fill
          sizes={featured ? '(max-width: 768px) 100vw, 34vw' : '(max-width: 768px) 68vw, 260px'}
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
          unoptimized
        />
      </div>
      <div className={cn('p-4', featured ? 'flex flex-col justify-between md:p-6' : '')}>
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-slate-200">
              <Image
                src={
                  item.creator.coverImage || `https://i.pravatar.cc/64?u=${item.creator.username}`
                }
                alt={item.creator.fullName}
                fill
                sizes="28px"
                className="object-cover"
                unoptimized
              />
            </span>
            <span className="min-w-0 truncate text-xs font-semibold text-slate-700">
              {item.creator.fullName}
            </span>
            <VerifiedMark />
          </div>
          <h3
            className={cn(
              'font-monument-grotes leading-none font-semibold tracking-normal text-slate-950',
              featured ? 'text-3xl uppercase sm:text-4xl' : 'line-clamp-1 text-lg',
            )}
          >
            {item.title}
          </h3>
        </div>
        <div className={cn('mt-5 flex items-center justify-between gap-3', featured ? 'pt-8' : '')}>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                item.isSold ? 'bg-slate-400' : 'bg-blue-600',
              )}
            />
            {priceLabel}
          </span>
          <span className="text-xs font-semibold text-slate-400 transition group-hover:text-slate-900">
            View work
          </span>
        </div>
      </div>
    </button>
  )
}

const EditorialCard = ({ item, onClick }: { item: EditorialItem; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-[300px] shrink-0 cursor-pointer overflow-hidden rounded-[8px] border border-black/10 bg-white/82 text-left shadow-[0_18px_50px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-md transition hover:-translate-y-1 hover:border-black/18 hover:shadow-[0_26px_70px_rgba(15,23,42,0.13)] sm:w-[350px]"
  >
    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
      <Image
        src={item.imageUrl}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 80vw, 350px"
        className="object-cover transition duration-500 group-hover:scale-[1.035]"
        unoptimized
      />
    </div>
    <div className="p-4">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
        {item.category}
      </p>
      <h3 className="mt-3 line-clamp-2 text-lg leading-tight font-semibold text-slate-950 transition group-hover:text-blue-600">
        {item.title}
      </h3>
      <div className="mt-4 flex min-w-0 items-center gap-2 text-xs text-slate-500">
        <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-slate-200">
          <Image
            src={item.avatarUrl}
            alt={item.author}
            fill
            sizes="20px"
            className="object-cover"
            unoptimized
          />
        </span>
        <span className="truncate">{item.author}</span>
        <span className="shrink-0">·</span>
        <span className="shrink-0">{item.readTime}</span>
      </div>
    </div>
  </button>
)

const FeaturedEditorial = ({ item, onClick }: { item: EditorialItem; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="group grid min-h-[360px] cursor-pointer overflow-hidden rounded-[8px] border border-black/10 bg-white/82 text-left shadow-[0_24px_80px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-md transition hover:-translate-y-1 hover:border-black/18 md:grid-cols-[0.48fr_0.52fr]"
  >
    <div className="relative min-h-[240px] overflow-hidden bg-slate-100 md:min-h-full">
      <Image
        src={item.imageUrl}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 100vw, 36vw"
        className="object-cover transition duration-500 group-hover:scale-[1.035]"
        unoptimized
      />
    </div>
    <div className="flex flex-col justify-between p-6">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
          {item.category}
        </p>
        <h3 className="font-monument-grotes mt-4 text-3xl leading-none font-semibold tracking-normal text-slate-950 uppercase sm:text-5xl">
          {item.title}
        </h3>
      </div>
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-black/10 pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
            <Image
              src={item.avatarUrl}
              alt={item.author}
              fill
              sizes="40px"
              className="object-cover"
              unoptimized
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{item.author}</p>
            <p className="text-xs text-slate-500">
              {item.date} · {item.readTime}
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-950" />
      </div>
    </div>
  </button>
)

const HeroArtworkCollage = ({
  artworks,
  onArtworkClick,
}: {
  artworks: ArtworkItem[]
  onArtworkClick: (id: string) => void
}) => {
  const [primary, secondary, tertiary] = artworks

  return (
    <div className="grid min-h-[420px] grid-cols-[0.82fr_1fr] gap-3 sm:gap-4">
      {[primary, secondary, tertiary].filter(Boolean).map((artwork, index) => (
        <button
          key={artwork.id}
          type="button"
          onClick={() => onArtworkClick(artwork.id)}
          className={cn(
            'group relative min-w-0 cursor-pointer overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.16)]',
            index === 0 ? 'row-span-2' : '',
          )}
        >
          <Image
            src={artwork.imageMedium}
            alt={artwork.title}
            fill
            sizes={
              index === 0 ? '(max-width: 1024px) 45vw, 26vw' : '(max-width: 1024px) 45vw, 22vw'
            }
            className="object-cover transition duration-500 group-hover:scale-[1.035]"
            unoptimized
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 to-transparent p-4 text-left text-white">
            <p className="line-clamp-1 text-sm font-semibold">{artwork.title}</p>
            <p className="mt-1 line-clamp-1 text-xs text-white/68">{artwork.creator.fullName}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

const HomeHero = ({
  artworks,
  editorialCount,
  eventCount,
  artworkCount,
  onExploreArtworks,
  onViewEvents,
  onArtworkClick,
}: {
  artworks: ArtworkItem[]
  editorialCount: number
  eventCount: number
  artworkCount: number
  onExploreArtworks: () => void
  onViewEvents: () => void
  onArtworkClick: (id: string) => void
}) => (
  <section className="relative overflow-hidden rounded-[8px] border border-black/10 bg-[linear-gradient(135deg,#ffffff_0%,#f4f6f1_52%,#edf7f6_100%)] shadow-[0_24px_90px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,0.88)]">
    <div
      aria-hidden="true"
      className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-[#f97316]/14 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-[#35c9ee]/14 blur-3xl"
    />
    <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.52fr)_minmax(420px,0.48fr)] lg:p-8 xl:p-10">
      <div className="flex min-w-0 flex-col justify-center py-4">
        <p className="mb-5 inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-[#f97316]" />
          Today in Artium
        </p>
        <h1 className="font-monument-grotes max-w-3xl text-[44px] leading-[0.92] font-semibold tracking-normal text-slate-950 uppercase sm:text-[64px] xl:text-[78px]">
          Your curated art market home.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          A brighter collector workspace that surfaces weekly editorial, upcoming events, and new
          artwork from people you follow.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            size="xl"
            onClick={onExploreArtworks}
            className="min-h-13 cursor-pointer rounded-full !bg-slate-950 px-7 text-base font-semibold !text-white hover:!bg-slate-800"
          >
            Explore new works
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="xl"
            variant="outline"
            onClick={onViewEvents}
            className="min-h-13 cursor-pointer rounded-full border-black/12 !bg-white/60 px-7 text-base font-semibold !text-slate-950 hover:!bg-white"
          >
            View events
          </Button>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { value: editorialCount, label: 'Editorials' },
            { value: eventCount, label: 'Upcoming events' },
            { value: artworkCount, label: 'New artworks' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[8px] border border-black/10 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md"
            >
              <p className="font-monument-grotes text-2xl font-semibold text-slate-950">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      <HeroArtworkCollage artworks={artworks.slice(0, 3)} onArtworkClick={onArtworkClick} />
    </div>
  </section>
)

const FeaturedEventCard = ({
  event,
  onClick,
  onInvite,
  onShare,
}: {
  event?: Event
  onClick: (id: string) => void
  onInvite: (event: Event) => void
  onShare: (event: Event) => void
}) => {
  if (!event) return null

  return (
    <article className="relative flex min-h-[360px] overflow-hidden rounded-[8px] border border-black/10 bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
      {event.coverImageUrl ? (
        <Image
          src={event.coverImageUrl}
          alt={event.title}
          fill
          sizes="(max-width: 1024px) 100vw, 42vw"
          className="object-cover opacity-42"
          unoptimized
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/10" />
      <div className="relative z-10 flex min-h-full w-full flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-[8px] bg-white px-4 py-3 text-center text-slate-950 shadow-xl">
            <p
              className="text-[10px] font-semibold tracking-[0.16em] uppercase"
              suppressHydrationWarning
            >
              {formatEventDate(event).split(' ')[0]}
            </p>
            <p
              className="font-monument-grotes mt-1 text-3xl font-semibold"
              suppressHydrationWarning
            >
              {formatEventDate(event).split(' ')[1]}
            </p>
          </div>
          <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold text-white/78 backdrop-blur-md">
            {event.types[0] ?? 'event'}
          </span>
        </div>
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-white/48 uppercase">
            <CalendarDays className="h-4 w-4" />
            Upcoming private view
          </p>
          <h3 className="font-monument-grotes text-4xl leading-none font-semibold tracking-normal uppercase sm:text-5xl">
            {event.title}
          </h3>
          <div className="mt-5 grid gap-2 text-sm text-white/68">
            <p className="flex items-center gap-2" suppressHydrationWarning>
              <Clock3 className="h-4 w-4" />
              {formatEventTime(event)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.location}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => onClick(event.id)}
              className="min-h-11 cursor-pointer rounded-full !bg-white px-5 text-sm font-semibold !text-slate-950 hover:!bg-white/90"
            >
              View event
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onInvite(event)}
              className="min-h-11 cursor-pointer rounded-full border-white/18 !bg-white/10 px-5 text-sm font-semibold !text-white hover:!bg-white hover:!text-slate-950"
            >
              <Mail className="h-4 w-4" />
              Invite
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onShare(event)}
              className="min-h-11 cursor-pointer rounded-full border-white/18 !bg-white/10 px-5 text-sm font-semibold !text-white hover:!bg-white hover:!text-slate-950"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export const DashboardView = () => {
  const router = useRouter()
  const events = useEventsStore(
    useShallow((state) => state.allEvents.filter((event) => event.id.startsWith('home-ev-'))),
  )
  const updateRsvpStatus = useEventsStore((state) => state.updateRsvpStatus)

  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteModalEvent, setInviteModalEvent] = useState<HostingEvent | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareModalEvent, setShareModalEvent] = useState<HostingEvent | null>(null)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  const featuredEditorial = EDITORIALS[0]
  const featuredArtwork = NEW_ARTWORKS[0]
  const featuredEvent = events[0]

  const navigateToSection = (section: string) => {
    void router.push({
      pathname: '/homepage/[section]',
      query: { section },
    })
  }

  const navigateToEditorial = (id: string) => {
    void router.push(`/editorial/${id}`)
  }

  const navigateToArtwork = (id: string) => {
    void router.push(`/artworks/${id}`)
  }

  const navigateToEvent = (id: string) => {
    void router.push(`/homepage/events/${id}`)
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
    setInviteModalEvent(event as unknown as HostingEvent)
    setInviteModalOpen(true)
  }

  const handleShare = (event: Event) => {
    setShareModalEvent(event as unknown as HostingEvent)
    setShareModalOpen(true)
  }

  return (
    <div className="-mx-6 -my-4 min-h-screen overflow-hidden bg-[#f6f6f2] px-4 py-6 text-slate-950 sm:-mx-8 sm:px-6 lg:-mx-12 lg:px-10">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="mx-auto w-full max-w-7xl space-y-10">
        <HomeHero
          artworks={NEW_ARTWORKS}
          editorialCount={EDITORIALS.length}
          eventCount={events.length}
          artworkCount={NEW_ARTWORKS.length}
          onExploreArtworks={() => navigateToSection('new-artworks')}
          onViewEvents={() => navigateToSection('events')}
          onArtworkClick={navigateToArtwork}
        />

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <div>
            <SectionHeader title="Featured Editorial" eyebrow="Read next" />
            <FeaturedEditorial
              item={featuredEditorial}
              onClick={() => navigateToEditorial(featuredEditorial.id)}
            />
          </div>

          <div>
            <SectionHeader title="Upcoming Private View" eyebrow="Next event" />
            <FeaturedEventCard
              event={featuredEvent}
              onClick={navigateToEvent}
              onInvite={handleInvite}
              onShare={handleShare}
            />
          </div>
        </section>

        <section>
          <SectionHeader
            title="New Artworks From Artists You Follow"
            eyebrow="Fresh arrivals"
            onAction={() => navigateToSection('new-artworks')}
          />
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
            {NEW_ARTWORKS.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                item={artwork}
                onClick={() => navigateToArtwork(artwork.id)}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)]">
          <div>
            <SectionHeader
              title="Spotlight Artwork"
              eyebrow="Collector signal"
              actionLabel="Open work"
              onAction={() => navigateToArtwork(featuredArtwork.id)}
            />
            <ArtworkCard
              item={featuredArtwork}
              featured
              onClick={() => navigateToArtwork(featuredArtwork.id)}
            />
          </div>

          <div className="rounded-[8px] border border-black/10 bg-white/72 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md">
            <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
              <GalleryVerticalEnd className="h-4 w-4" />
              Market pulse
            </p>
            <h2 className="font-monument-grotes text-4xl leading-none font-semibold tracking-normal text-slate-950 uppercase">
              Discovery that keeps moving.
            </h2>
            <div className="mt-8 grid gap-3">
              {[
                {
                  icon: Palette,
                  title: 'New artists',
                  body: 'Fresh listings from the people you follow stay close to editorial and events.',
                },
                {
                  icon: CalendarDays,
                  title: 'Live moments',
                  body: 'Events remain actionable with RSVP, invite, and share controls.',
                },
                {
                  icon: Sparkles,
                  title: 'Curated reading',
                  body: 'Editorial context helps collectors move from inspiration to action.',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-[8px] border border-black/8 bg-white/76 p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-slate-950 text-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            title="Weekly Editorial For You"
            eyebrow="Journal"
            onAction={() => navigateToSection('editorials')}
          />
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
            {EDITORIALS.map((item) => (
              <EditorialCard
                key={item.id}
                item={item}
                onClick={() => navigateToEditorial(item.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Upcoming Events"
            eyebrow="Calendar"
            onAction={() => navigateToSection('events')}
          />
          <div className="no-scrollbar flex gap-4 overflow-x-auto overflow-y-visible pb-28">
            {events.map((event) => (
              <div key={event.id} className="w-[310px] shrink-0 sm:w-[380px]">
                <EventCard
                  event={event}
                  onRsvpChange={handleRsvpChange}
                  onInvite={handleInvite}
                  onShare={handleShare}
                  onClick={navigateToEvent}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {inviteModalEvent && (
        <InviteEventModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          event={inviteModalEvent}
          onInviteSuccess={() => {}}
        />
      )}

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
