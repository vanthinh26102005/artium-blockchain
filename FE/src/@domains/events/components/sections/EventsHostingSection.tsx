// react
import { useMemo, useState, useRef, useEffect } from 'react'

// next
import { useRouter } from 'next/router'

// third-party
import { Plus } from 'lucide-react'

// @shared - components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select'

// @domains - events
import { HostingEventCard } from '@domains/events/components/cards/HostingEventCard'
import { CreateEventModal } from '@domains/events/modals/CreateEventModal'
import { InviteEventModal } from '@domains/events/modals/InviteEventModal'
import { ShareEventModal } from '@domains/events/modals/ShareEventModal'
import { DeleteEventModal } from '@domains/events/modals/DeleteEventModal'
import { EventsPagination } from '@domains/events/components/ui/EventsPagination'
import { ToastPortal } from '@domains/events/components/ui/ToastPortal'
import {
  EVENTS_HOSTING_SORT_OPTIONS,
  type EventsHostingSortValue,
} from '@domains/events/constants/hostingSortOptions'
import { type CreateEventFormValues } from '@domains/events/forms/CreateEventForm'
import {
  type HostingEvent,
  useHostingEventsStore,
} from '@domains/events/state/useHostingEventsStore'

/**
 * DEFAULT_SORT_VALUE - React component
 * @returns React element
 */
const DEFAULT_SORT_VALUE: EventsHostingSortValue = EVENTS_HOSTING_SORT_OPTIONS[0].value
const DEFAULT_ITEMS_PER_PAGE = 12

export const EventsHostingSection = () => {
  /**
   * DEFAULT_ITEMS_PER_PAGE - React component
   * @returns React element
   */
  // -- refs --
  const sectionRef = useRef<HTMLElement>(null)
  const router = useRouter()

  // -- state --
  /**
   * EventsHostingSection - React component
   * @returns React element
   */
  const [sortValue, setSortValue] = useState<EventsHostingSortValue>(DEFAULT_SORT_VALUE)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  /**
   * sectionRef - Utility function
   * @returns void
   */
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)
  const [isCreating, setIsCreating] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  /**
   * router - Utility function
   * @returns void
   */
  const [inviteModalEvent, setInviteModalEvent] = useState<HostingEvent | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareModalEvent, setShareModalEvent] = useState<HostingEvent | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<HostingEvent | null>(null)
  const events = useHostingEventsStore((state) => state.events)
  const isLoading = useHostingEventsStore((state) => state.isLoading)
  const hasLoaded = useHostingEventsStore((state) => state.hasLoaded)
  const loadEvents = useHostingEventsStore((state) => state.loadEvents)
  const addEvent = useHostingEventsStore((state) => state.addEvent)
  const deleteEvent = useHostingEventsStore((state) => state.deleteEvent)
  const copyLink = useHostingEventsStore((state) => state.copyLink)
  const updateEventFromForm = useHostingEventsStore((state) => state.updateEventFromForm)
  const [editingEvent, setEditingEvent] = useState<HostingEvent | null>(null)

  // Track previous page to detect actual page changes (not initial mount)
  const prevPageRef = useRef(currentPage)
  useEffect(() => {
    // Only scroll if page actually changed (user clicked pagination)
    if (prevPageRef.current !== currentPage) {
      /**
       * events - Utility function
       * @returns void
       */
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      prevPageRef.current = currentPage
    }
  }, [currentPage])
  /**
   * isLoading - Utility function
   * @returns void
   */

  useEffect(() => {
    if (!hasLoaded) {
      void loadEvents()
      /**
       * hasLoaded - Utility function
       * @returns void
       */
    }
  }, [hasLoaded, loadEvents])

  // -- derived --
  /**
   * loadEvents - Utility function
   * @returns void
   */
  const sortedEvents = useMemo(() => {
    const nextEvents = [...events]

    switch (sortValue) {
      /**
       * addEvent - Utility function
       * @returns void
       */
      case 'eventDateNewest':
        return nextEvents.sort((a, b) => Date.parse(b.startDateTime) - Date.parse(a.startDateTime))
      /**
       * deleteEvent - Utility function
       * @returns void
       */
      case 'eventDateOldest':
        return nextEvents.sort((a, b) => Date.parse(a.startDateTime) - Date.parse(b.startDateTime))
      /**
       * copyLink - Utility function
       * @returns void
       */
      case 'createdDateNewest':
        return nextEvents.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      /**
       * updateEventFromForm - Utility function
       * @returns void
       */
      case 'createdDateOldest':
        return nextEvents.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
      case 'titleAsc':
        return nextEvents.sort(
          (a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }),
          /**
           * prevPageRef - Utility function
           * @returns void
           */
        )
      case 'titleDesc':
        return nextEvents.sort((a, b) =>
          b.title.localeCompare(a.title, 'en', { sensitivity: 'base' }),
        )
      default:
        return nextEvents
    }
  }, [events, sortValue])

  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage)
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedEvents.slice(startIndex, endIndex)
  }, [sortedEvents, currentPage, itemsPerPage])

  const hasEvents = sortedEvents.length > 0

  /**
   * sortedEvents - Utility function
   * @returns void
   */
  // -- handlers --
  const handleCreateEvent = async (values: CreateEventFormValues) => {
    setIsCreating(true)
    try {
      /**
       * nextEvents - Utility function
       * @returns void
       */
      await addEvent(values)
      setToast({ message: 'Event created successfully', variant: 'success' })
      setIsCreateModalOpen(false)
      setEditingEvent(null)
    } catch (error) {
      console.error(error)
      setToast({ message: 'Failed to create event', variant: 'error' })
    } finally {
      setIsCreating(false)
      window.setTimeout(() => setToast(null), 2200)
    }
  }

  const handleUpdateEvent = async (id: string, values: CreateEventFormValues) => {
    setIsCreating(true)
    try {
      await updateEventFromForm(id, values)
      setToast({ message: 'Event updated successfully', variant: 'success' })
      setIsCreateModalOpen(false)
      setEditingEvent(null)
    } catch (error) {
      console.error(error)
      setToast({ message: 'Failed to update event', variant: 'error' })
    } finally {
      setIsCreating(false)
      window.setTimeout(() => setToast(null), 2200)
    }
  }

  const handleCopyLink = async (event: HostingEvent) => {
    try {
      await copyLink?.(event.id)
    } catch (error) {
      console.warn('Copy failed', error)
    }
    /**
     * totalPages - Utility function
     * @returns void
     */
  }

  // -- render --
  return (
    /**
     * paginatedEvents - Utility function
     * @returns void
     */
    <section
      ref={sectionRef}
      className="rounded-3xl border border-slate-200 bg-white p-6 font-inter"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-inter text-2xl font-semibold leading-none text-slate-900">
            /** * startIndex - Utility function * @returns void */ Events You&apos;re Hosting
          </h2>
          {hasEvents ? (
            <button
              /**
               * endIndex - Utility function
               * @returns void
               */
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-full border border-blue-500 bg-white px-4 text-[14px] font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                <Plus className="h-4 w-4" />
              </span>
              /** * hasEvents - Utility function * @returns void */ Create event
            </button>
          ) : null}
        </div>

        <div className="w-fit">
          /** * handleCreateEvent - Utility function * @returns void */
          <Select
            value={sortValue}
            onValueChange={(value) => setSortValue(value as EventsHostingSortValue)}
          >
            <SelectTrigger
              aria-label="Sort events"
              className="h-10 cursor-pointer rounded-full border border-slate-200 bg-white px-4 text-[14px] font-semibold text-slate-900 shadow-none transition hover:border-slate-300 hover:bg-slate-50 focus:border focus:border-slate-200 focus:outline-none focus:ring-0 focus-visible:border focus-visible:border-slate-200 focus-visible:outline-none focus-visible:ring-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 bg-white font-inter text-slate-900 shadow-lg">
              {EVENTS_HOSTING_SORT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-[13px] font-medium text-slate-700 focus:bg-slate-50 focus:text-slate-900"
                >
                  /** * handleUpdateEvent - Utility function * @returns void */
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {toast ? (
        <ToastPortal
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
          showClose={false}
        />
      ) : null}

      {isLoading && !hasEvents ? (
        <div className="mt-6 flex min-h-[240px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-sm text-slate-600">
          /** * handleCopyLink - Utility function * @returns void */ Loading events...
        </div>
      ) : hasEvents ? (
        <>
          <div className="mt-6 grid auto-rows-fr grid-cols-1 gap-4 2xl:grid-cols-3 lg:grid-cols-2">
            {paginatedEvents.map((event) => (
              <HostingEventCard
                key={event.id}
                event={event}
                onInvite={(event) => {
                  setInviteModalEvent(event)
                  setInviteModalOpen(true)
                }}
                onShare={(event) => {
                  setShareModalEvent(event)
                  setShareModalOpen(true)
                }}
                onCopyLink={() => handleCopyLink(event)}
                onDelete={() => {
                  setDeleteTarget(event)
                  setDeleteModalOpen(true)
                }}
                onEdit={() => {
                  setEditingEvent(event)
                  setIsCreateModalOpen(true)
                }}
                onClick={(id) => router.push(`/events/${id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <EventsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={sortedEvents.length}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value)
                  setCurrentPage(1)
                }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No events yet</h3>
          <p className="max-w-[720px] text-sm text-slate-600">
            Create and manage upcoming exhibitions, openings, or art-related events.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-6 inline-flex h-[43px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[26px] border border-blue-500 bg-white px-[24px] py-2 text-[14px] font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
              <Plus className="h-4 w-4" />
            </span>
            Create event
          </button>
        </div>
      )}

      <CreateEventModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreate={handleCreateEvent}
        onUpdate={handleUpdateEvent}
        editingEvent={editingEvent}
      />

      {inviteModalEvent && (
        <InviteEventModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          event={inviteModalEvent}
          onInviteSuccess={(recipientEmails) => {
            setToast({
              message: `Invitations sent to ${recipientEmails.length} ${recipientEmails.length === 1 ? 'person' : 'people'}`,
              variant: 'success',
            })
            window.setTimeout(() => setToast(null), 3000)
          }}
        />
      )}

      {shareModalEvent && (
        <ShareEventModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          event={shareModalEvent}
        />
      )}

      {deleteTarget && (
        <DeleteEventModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          eventTitle={deleteTarget.title}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await deleteEvent(deleteTarget.id)
            setToast({ message: 'Event deleted', variant: 'success' })
            window.setTimeout(() => setToast(null), 2200)
            setDeleteTarget(null)
          }}
        />
      )}
    </section>
  )
}
