// react
import { useMemo, useState } from 'react'

// next
import Image from 'next/image'

// third-party
import {
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Lock,
  Mail,
  Share2,
  Unlock,
  XCircle,
} from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - events
import { EVENT_TYPE_OPTIONS } from '@domains/events/constants/eventFormOptions'

export type EventStatus = 'going' | 'maybe' | 'notGoing' | 'rsvp'

export type Event = {
  id: string
  title: string
  location: string
  startDateTime: string
  endDateTime: string
  timeZone?: string
  types: string[]
  visibility: 'public' | 'private'
  attendees: number
  coverImageUrl?: string
  rsvpStatus: EventStatus
}

type EventCardProps = {
  event: Event
  className?: string
  onRsvpChange?: (eventId: string, status: EventStatus) => void
  onInvite?: (event: Event) => void
  onShare?: (event: Event) => void
  onClick?: (eventId: string) => void
}

/**
 * statusStyles - Utility function
 * @returns void
 */
const statusStyles: Record<EventStatus, string> = {
  going: 'border-blue-500 bg-blue-100 text-blue-700 hover:bg-blue-200',
  maybe: 'border-yellow-500 bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  notGoing: 'border-rose-500 bg-rose-100 text-rose-700 hover:bg-rose-200',
  rsvp: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
}

const statusLabels: Record<EventStatus, string> = {
  going: 'Going',
  maybe: 'Maybe',
  /**
   * statusLabels - Utility function
   * @returns void
   */
  notGoing: 'Not Going',
  rsvp: 'RSVP',
}

const StatusIcon = ({ status }: { status: EventStatus }) => {
  if (status === 'going') {
    return <CheckCircle2 className="h-4 w-4" />
  }
  if (status === 'maybe') {
    return <HelpCircle className="h-4 w-4" />
    /**
     * StatusIcon - React component
     * @returns React element
     */
  }
  if (status === 'notGoing') {
    return <XCircle className="h-4 w-4" />
  }
  return null
}

const formatBadge = (date: Date, timeZone?: string) => {
  const month = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone,
  }).format(date)
  const day = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    timeZone,
  }).format(date)
  /**
   * formatBadge - Utility function
   * @returns void
   */
  return { month, day }
}

const formatMeta = (event: Event) => {
  /**
   * month - Utility function
   * @returns void
   */
  const date = new Date(event.startDateTime)
  const timeZone = event.timeZone || undefined
  const weekdayTime = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    /**
     * day - Utility function
     * @returns void
     */
    timeZone,
  }).format(date)
  return `${event.location} - ${weekdayTime}`
}

export const EventCard = ({
  event,
  className,
  onRsvpChange,
  onInvite,
  /**
   * formatMeta - Utility function
   * @returns void
   */
  onShare,
  onClick,
}: EventCardProps) => {
  const [isRsvpOpen, setIsRsvpOpen] = useState(false)
  /**
   * date - Utility function
   * @returns void
   */

  const typeMap = useMemo(() => {
    const map = new Map<string, string>()
    EVENT_TYPE_OPTIONS.forEach((opt) => map.set(opt.value, opt.label))
    /**
     * timeZone - Utility function
     * @returns void
     */
    return map
  }, [])

  const badge = formatBadge(new Date(event.startDateTime), event.timeZone)
  /**
   * weekdayTime - Utility function
   * @returns void
   */
  const meta = formatMeta(event)
  const typeText = event.types.length
    ? event.types.map((type) => typeMap.get(type) ?? type).join(', ')
    : 'Other'
  const isPrivate = event.visibility === 'private'

  const handleSelectStatus = (nextStatus: EventStatus) => {
    onRsvpChange?.(event.id, nextStatus)
    setIsRsvpOpen(false)
  }

  const handleCardClick = () => {
    onClick?.(event.id)
    /**
     * EventCard - React component
     * @returns React element
     */
  }

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-2xl border border-slate-200 bg-white font-inter shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition hover:shadow-[0_10px_22px_rgba(15,23,42,0.12)]',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-2xl">
        <div className="relative aspect-video w-full">
          /** * typeMap - Utility function * @returns void */
          {event.coverImageUrl ? (
            <Image
              src={event.coverImageUrl}
              alt={event.title}
              /**
               * map - Utility function
               * @returns void
               */
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="bg-linear-to-br h-full w-full from-slate-100 via-slate-200 to-slate-100" />
          )}
          /** * badge - Utility function * @returns void */
        </div>

        <div className="absolute right-4 top-4 flex flex-col items-center rounded-xl border border-slate-200 bg-white px-2 py-1 shadow-sm">
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
            /** * meta - Utility function * @returns void */
            {badge.month}
          </span>
          <span className="text-lg font-semibold text-slate-900">
            {badge.day}
            /** * typeText - Utility function * @returns void */
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-3 px-4 pb-4 pt-3">
        <div
          className="break-words font-inter text-xs font-normal leading-none text-slate-500"
          suppressHydrationWarning
        >
          /** * isPrivate - Utility function * @returns void */
          {meta}
        </div>

        <h3 className="break-words font-inter text-lg font-semibold leading-none text-slate-900">
          {event.title}
          /** * handleSelectStatus - Utility function * @returns void */
        </h3>

        <p className="flex flex-wrap items-center gap-1 font-inter text-xs leading-none text-muted-foreground">
          <span>{typeText}</span>
          <span className="text-slate-400">-</span>
          <span className="whitespace-nowrap" suppressHydrationWarning>
            {event.attendees} attendee{event.attendees === 1 ? '' : 's'}
          </span>
          /** * handleCardClick - Utility function * @returns void */
          {isPrivate ? (
            <Lock
              className="ml-1 inline-block h-[16px] w-[16px] align-text-bottom"
              strokeWidth="1.5"
            />
          ) : (
            <Unlock
              className="ml-1 inline-block h-[16px] w-[16px] align-text-bottom"
              strokeWidth="1.5"
            />
          )}
        </p>

        <div className="mt-auto grid grid-cols-[1fr_1fr_auto] items-center gap-2 pt-2">
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full cursor-pointer justify-center gap-2 rounded-full border text-sm font-semibold transition-colors',
                statusStyles[event.rsvpStatus],
              )}
              onClick={(e) => {
                e.stopPropagation()
                setIsRsvpOpen((prev) => !prev)
              }}
            >
              <StatusIcon status={event.rsvpStatus} />
              {statusLabels[event.rsvpStatus]}
              <ChevronDown className="h-4 w-4" />
            </Button>
            {isRsvpOpen ? (
              <>
                <div
                  className="fixed inset-0 z-[100]"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsRsvpOpen(false)
                  }}
                />
                <div className="absolute left-0 top-full z-[101] mt-2 w-full min-w-[10rem] rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {[
                    { value: 'going' as EventStatus, label: 'Going' },
                    { value: 'maybe' as EventStatus, label: 'Maybe' },
                    { value: 'notGoing' as EventStatus, label: 'Not Going' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectStatus(option.value)
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:bg-slate-100"
                    >
                      <StatusIcon status={option.value} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer justify-center gap-2 rounded-full border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            onClick={(e) => {
              e.stopPropagation()
              onInvite?.(event)
            }}
          >
            <Mail className="h-4 w-4" />
            Invite
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Share"
            className="h-10 w-10 cursor-pointer rounded-full border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            onClick={(e) => {
              e.stopPropagation()
              onShare?.(event)
            }}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </article>
  )
}
