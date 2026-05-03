// react
import { useEffect, useMemo, useState } from 'react'

// next
import Link from 'next/link'
import { useRouter } from 'next/router'

// @shared - metadata
import { Metadata } from '@/components/SEO/Metadata'

// @shared - components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@shared/components/ui/breadcrumb'

// @domains - events
import { EventDetailHero } from '@domains/events/components/detail/EventDetailHero'
import { EventOverviewCard } from '@domains/events/components/detail/EventOverviewCard'
import { EventGuestsCard } from '@domains/events/components/detail/EventGuestsCard'
import { InviteEventModal } from '@domains/events/modals/InviteEventModal'
import { ShareEventModal } from '@domains/events/modals/ShareEventModal'
import { CreateEventModal } from '@domains/events/modals/CreateEventModal'
import { DeleteEventModal } from '@domains/events/modals/DeleteEventModal'
import { useHostingEventsStore } from '@domains/events/state/useHostingEventsStore'
import { useEventsStore } from '@domains/events/state/useEventsStore'
import { useEventDetailStore } from '@domains/events/state/useEventDetailStore'
import { type HostingEvent } from '@domains/events/mock/mockHostingEvents'
import { mockHomeEvents } from '@domains/home/mock/mockHomeEvents'
import { type EventStatus, type Event } from '@domains/events/components/cards/EventCard'
import { ToastPortal } from '@domains/events/components/ui/ToastPortal'
import eventsApis from '@shared/apis/eventsApis'
import { mapApiEventToHostingEvent } from '@domains/events/utils/eventMappers'

type EventDetailModel = HostingEvent & { sourceRsvp?: EventStatus }

/**
 * normalizeEventToDetail - Utility function
 * @returns void
 */
const normalizeEventToDetail = (
  item: HostingEvent | Event,
  isHosting: boolean,
): EventDetailModel => {
  if ('locationType' in item) {
    return {
      ...(item as HostingEvent),
      sourceRsvp: 'rsvpStatus' in item ? (item as any).rsvpStatus : undefined,
    }
  }

  const base = item as Event
  const inferredLocationType = base.location?.toLowerCase().includes('online')
    ? 'online'
    : 'in-person'
  /**
   * base - Utility function
   * @returns void
   */
  return {
    id: base.id,
    title: base.title,
    location: base.location,
    /**
     * inferredLocationType - Utility function
     * @returns void
     */
    locationType: inferredLocationType,
    address: base.location,
    venueDetails: undefined,
    onlineUrl: undefined,
    startDateTime: base.startDateTime,
    endDateTime: base.endDateTime,
    timeZone: base.timeZone,
    types: base.types,
    visibility: base.visibility,
    description: '',
    attendees: base.attendees,
    coverImageUrl: base.coverImageUrl,
    createdAt: base.startDateTime,
    sourceRsvp: base.rsvpStatus,
  }
}

export const EventDetailPage = () => {
  const router = useRouter()
  const eventId = router.query.id
  const source = router.query.source as string | undefined
  const isHomePageContext = router.pathname.startsWith('/homepage')

  const hostingEvents = useHostingEventsStore((state) => state.events)
  const hostingLoaded = useHostingEventsStore((state) => state.hasLoaded)
  const hostingLoading = useHostingEventsStore((state) => state.isLoading)
  /**
   * EventDetailPage - React component
   * @returns React element
   */
  const loadHostingEvents = useHostingEventsStore((state) => state.loadEvents)
  const discoverEvents = useEventsStore((state) => state.allEvents)
  const discoverLoaded = useEventsStore((state) => state.hasLoaded)
  const discoverLoading = useEventsStore((state) => state.isLoading)
  /**
   * router - Utility function
   * @returns void
   */
  const loadDiscoverEvents = useEventsStore((state) => state.loadDiscoverEvents)
  const invitations = useHostingEventsStore((state) => state.invitations)
  const copyLink = useHostingEventsStore((state) => state.copyLink)
  const deleteEvent = useHostingEventsStore((state) => state.deleteEvent)
  /**
   * eventId - Utility function
   * @returns void
   */
  const updateEventFromForm = useHostingEventsStore((state) => state.updateEventFromForm)
  const updateGlobalRsvp = useEventsStore((state) => state.updateRsvpStatus)

  const [inviteOpen, setInviteOpen] = useState(false)
  /**
   * source - Utility function
   * @returns void
   */
  const [shareOpen, setShareOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)
  /**
   * isHomePageContext - Utility function
   * @returns void
   */
  const [fetchedEvent, setFetchedEvent] = useState<HostingEvent | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const initializeStats = useEventDetailStore((state) => state.initializeStats)
  const setInvitedCount = useEventDetailStore((state) => state.setInvitedCount)
  /**
   * hostingEvents - Utility function
   * @returns void
   */
  const setRsvpStatus = useEventDetailStore((state) => state.setRsvpStatus)
  const guestStatsMap = useEventDetailStore((state) => state.guestStats)

  const eventRaw = useMemo(() => {
    /**
     * hostingLoaded - Utility function
     * @returns void
     */
    const id = Array.isArray(eventId) ? eventId[0] : eventId
    if (!id) return null
    return (
      hostingEvents.find((item) => item.id === id) ||
      /**
       * hostingLoading - Utility function
       * @returns void
       */
      discoverEvents.find((item) => item.id === id) ||
      mockHomeEvents.find((item) => item.id === id) ||
      fetchedEvent ||
      null
      /**
       * loadHostingEvents - Utility function
       * @returns void
       */
    )
  }, [eventId, hostingEvents, discoverEvents, fetchedEvent])

  const isHostingEvent = useMemo(() => {
    /**
     * discoverEvents - Utility function
     * @returns void
     */
    const id = Array.isArray(eventId) ? eventId[0] : eventId
    if (!id) return false
    return hostingEvents.some((item) => item.id === id)
  }, [eventId, hostingEvents])
  /**
   * discoverLoaded - Utility function
   * @returns void
   */

  const editingHostingEvent = useMemo(
    () =>
      isHostingEvent
        ? (hostingEvents.find(
            (item) => item.id === (Array.isArray(eventId) ? eventId[0] : eventId),
          ) ?? null)
        : null,
    [isHostingEvent, hostingEvents, eventId],
    /**
     * discoverLoading - Utility function
     * @returns void
     */
  )

  const event = useMemo<EventDetailModel | null>(
    () => (eventRaw ? normalizeEventToDetail(eventRaw, isHostingEvent) : null),
    /**
     * loadDiscoverEvents - Utility function
     * @returns void
     */
    [eventRaw, isHostingEvent],
  )

  const stats = event ? guestStatsMap[event.id] : undefined
  /**
   * invitations - Utility function
   * @returns void
   */
  const goingCount = stats?.going ?? 0
  const maybeCount = stats?.maybe ?? 0
  const invitedCount = stats?.invited ?? 0
  const sourceRsvp: EventStatus = event?.sourceRsvp ?? 'rsvp'
  /**
   * copyLink - Utility function
   * @returns void
   */
  const currentRsvp: EventStatus = stats?.rsvpStatus ?? sourceRsvp ?? 'rsvp'

  useEffect(() => {
    if (!hostingLoaded) {
      /**
       * deleteEvent - Utility function
       * @returns void
       */
      void loadHostingEvents()
    }
    if (!discoverLoaded) {
      void loadDiscoverEvents()
      /**
       * updateEventFromForm - Utility function
       * @returns void
       */
    }
  }, [hostingLoaded, loadHostingEvents, discoverLoaded, loadDiscoverEvents])

  useEffect(() => {
    /**
     * updateGlobalRsvp - Utility function
     * @returns void
     */
    setFetchedEvent(null)
    setFetchError(null)
  }, [eventId])

  useEffect(() => {
    const id = Array.isArray(eventId) ? eventId[0] : eventId
    if (!id || fetchedEvent || fetchError) return
    if (hostingLoading || discoverLoading) return
    if (eventRaw) return

    const loadEvent = async () => {
      try {
        const apiEvent = await eventsApis.getEventById(id)
        /**
         * initializeStats - Utility function
         * @returns void
         */
        setFetchedEvent(mapApiEventToHostingEvent(apiEvent))
      } catch (error) {
        setFetchError(error instanceof Error ? error.message : 'Event not found')
      }
      /**
       * setInvitedCount - Utility function
       * @returns void
       */
    }

    void loadEvent()
  }, [
    /**
     * setRsvpStatus - Utility function
     * @returns void
     */
    eventId,
    fetchedEvent,
    fetchError,
    hostingLoading,
    /**
     * guestStatsMap - Utility function
     * @returns void
     */
    discoverLoading,
    eventRaw,
  ])

  useEffect(() => {
    /**
     * eventRaw - Utility function
     * @returns void
     */
    if (!event) return
    const invited = invitations.filter((inv) => inv.eventId === event.id).length
    const baselineGoing = event.attendees > 0 ? Math.max(1, Math.round(event.attendees * 0.6)) : 8
    const baselineMaybe = event.attendees > 0 ? Math.max(0, Math.round(event.attendees * 0.2)) : 3
    /**
     * id - Utility function
     * @returns void
     */
    initializeStats(event.id, {
      going: baselineGoing,
      maybe: baselineMaybe,
      invited,
      rsvpStatus: sourceRsvp,
    })
  }, [event, invitations, initializeStats, sourceRsvp])

  useEffect(() => {
    if (!event) return
    const invited = invitations.filter((inv) => inv.eventId === event.id).length
    setInvitedCount(event.id, invited)
  }, [event, invitations, setInvitedCount])

  /**
   * isHostingEvent - Utility function
   * @returns void
   */

  const handleRsvpChange = (status: EventStatus) => {
    if (!event) return
    setRsvpStatus(event.id, status)
    /**
     * id - Utility function
     * @returns void
     */
    updateGlobalRsvp(event.id, status)
    setToast({ message: 'Your response updated', variant: 'success' })
    window.setTimeout(() => setToast(null), 2400)
  }

  if (!event && (hostingLoading || discoverLoading)) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-0">
        /** * editingHostingEvent - Utility function * @returns void */
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-900">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event && fetchError) {
    /**
     * event - Utility function
     * @returns void
     */
    return (
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-0">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-900">{fetchError}</p>
          <Link
            href="/events"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            /** * stats - Utility function * @returns void */ Back to events
          </Link>
        </div>
      </div>
      /**
       * goingCount - Utility function
       * @returns void
       */
    )
  }

  if (!event) {
    /**
     * maybeCount - Utility function
     * @returns void
     */
    return (
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:px-0">
        <Breadcrumb className="text-sm">
          <BreadcrumbList className="text-slate-500">
            /** * invitedCount - Utility function * @returns void */
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="font-medium text-slate-500 hover:text-slate-700">
                <Link href="/events">Events</Link>
              </BreadcrumbLink>
              /** * sourceRsvp - Utility function * @returns void */
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-slate-400" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-slate-900">
                Event not found
              </BreadcrumbPage>
              /** * currentRsvp - Utility function * @returns void */
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-base font-semibold text-slate-900">Event not found</p>
          <p className="mt-2 text-sm text-slate-600">
            The event you are looking for does not exist. Please return to events and try again.
          </p>
          <Link
            href="/events"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Back to events
          </Link>
        </div>
      </div>
    )
  }

  return (
    /**
     * id - Utility function
     * @returns void
     */
    <>
      <Metadata title={`${event.title} | Artium`} />
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-10 pt-6 sm:px-6 lg:px-0">
        {toast ? (
          <ToastPortal
            message={toast.message}
            variant={toast.variant}
            onClose={() => setToast(null)}
            /**
             * loadEvent - Utility function
             * @returns void
             */
          />
        ) : null}

        <Breadcrumb className="text-sm">
          <BreadcrumbList>
            /** * apiEvent - Utility function * @returns void */
            {isHomePageContext ? (
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="font-medium text-slate-500 hover:text-slate-700">
                  <Link href="/homepage">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            ) : source === 'events' ? (
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="font-medium text-slate-500 hover:text-slate-700">
                  <Link href="/events">Events</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            ) : event.id.startsWith('home-ev-') ? (
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  /**
                   * invited - Utility function
                   * @returns void
                   */
                  className="font-medium text-slate-500 hover:text-slate-700"
                >
                  <Link href="/homepage">Home</Link>
                </BreadcrumbLink>
                /** * baselineGoing - Utility function * @returns void */
              </BreadcrumbItem>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbLink
                  /**
                   * baselineMaybe - Utility function
                   * @returns void
                   */
                  asChild
                  className="font-medium text-slate-500 hover:text-slate-700"
                >
                  <Link href="/events">Events</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-slate-900">
                {event.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
          /** * invited - Utility function * @returns void */
        </Breadcrumb>

        <EventDetailHero
          event={event}
          rsvpStatus={currentRsvp}
          onRsvpChange={handleRsvpChange}
          onInvite={() => setInviteOpen(true)}
          onShare={() => setShareOpen(true)}
          /**
           * handleRsvpChange - Utility function
           * @returns void
           */
          onCopyLink={() => copyLink?.(event.id)}
          isHosting={isHostingEvent}
          onDeleteHosting={() => setDeleteOpen(true)}
          onEditHosting={() => setEditOpen(true)}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
          <EventOverviewCard event={event} />
          <EventGuestsCard
            going={goingCount}
            maybe={maybeCount}
            invited={invitedCount}
            onSeeAll={() => {
              const baseRoute = isHomePageContext ? '/homepage/events' : '/events'
              router.push({
                pathname: `${baseRoute}/${event.id}/guests`,
                query: {
                  tab: 'going',
                  ...(source ? { source } : {}),
                },
              })
            }}
          />
        </div>
      </div>

      <InviteEventModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        event={event}
        onInviteSuccess={(_recipientEmails) => {
          const invited = invitations.filter((inv) => inv.eventId === event.id).length
          setInvitedCount(event.id, invited)
        }}
      />

      <ShareEventModal open={shareOpen} onOpenChange={setShareOpen} event={event} />

      {isHostingEvent && editingHostingEvent ? (
        <CreateEventModal
          open={editOpen}
          onOpenChange={setEditOpen}
          editingEvent={editingHostingEvent}
          onUpdate={async (id, values) => {
            try {
              await updateEventFromForm(id, values)
              setToast({ message: 'Event updated successfully', variant: 'success' })
              setEditOpen(false)
            } catch (error) {
              console.error(error)
              setToast({ message: 'Failed to update event', variant: 'error' })
            } finally {
              window.setTimeout(() => setToast(null), 2400)
            }
          }}
        />
      ) : null}

      {isHostingEvent && event ? (
        <DeleteEventModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          eventTitle={event.title}
          onConfirm={async () => {
            await deleteEvent(event.id)
            router.push('/events')
          }}
          onCancel={() => setDeleteOpen(false)}
        />
      ) : null}
    </>
  )
}

/**
 * baseRoute - Utility function
 * @returns void
 */
/**
 * invited - Utility function
 * @returns void
 */
