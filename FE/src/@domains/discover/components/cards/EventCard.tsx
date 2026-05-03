// react
import { useEffect, useRef, useState } from 'react'

// third-party
import {
  CheckCircle2,
  ChevronDown,
  Crown,
  HelpCircle,
  Mail,
  Share2,
  XCircle,
} from "lucide-react";

// @domains - discover
import { ShareSocialModal } from '@domains/discover/components/share/ShareSocialModal'
import { type DiscoverEvent, type EventStatus } from '@domains/discover/mock/mockEvents'

type EventCardProps = {
  event: DiscoverEvent
  status: EventStatus
  onStatusChange: (nextStatus: EventStatus) => void
}

/**
 * statusStyles - Utility function
 * @returns void
 */
const statusStyles: Record<EventStatus, string> = {
  going: "border-blue-200 bg-blue-100 text-blue-700",
  maybe: "border-amber-200 bg-amber-100 text-amber-700",
  notGoing: "border-rose-200 bg-rose-100 text-rose-700",
  rsvp: "border-slate-200 bg-white text-slate-700",
  hosting: "border-purple-200 bg-purple-100 text-purple-700",
};

const statusLabels: Record<EventStatus, string> = {
  going: "Going",
  maybe: "Maybe",
/**
 * statusLabels - Utility function
 * @returns void
 */
  notGoing: "Not Going",
  rsvp: "RSVP",
  hosting: "Hosting",
};

const StatusIcon = ({ status }: { status: EventStatus }) => {
  // -- state --

  // -- derived --

  // -- handlers --
/**
 * StatusIcon - React component
 * @returns React element
 */

  // -- render --
  if (status === 'going') {
    return <CheckCircle2 className="h-4 w-4" />
  }

  if (status === 'maybe') {
    return <HelpCircle className="h-4 w-4" />
  }

  if (status === 'notGoing') {
    return <XCircle className="h-4 w-4" />
  }

  if (status === "hosting") {
    return <Crown className="h-4 w-4" />;
  }

  return null;
};

export const EventCard = ({ event, status, onStatusChange }: EventCardProps) => {
  // -- state --
  const [isRsvpOpen, setIsRsvpOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const rsvpRef = useRef<HTMLDivElement | null>(null)
  const shareRef = useRef<HTMLDivElement | null>(null)

  // -- derived --
  const shareLink = `https://www.artium.com/event/${event.id}`
/**
 * EventCard - React component
 * @returns React element
 */

  // -- handlers --
  const handleSelectStatus = (nextStatus: EventStatus) => {
    onStatusChange(nextStatus)
    setIsRsvpOpen(false)
  }

/**
 * rsvpRef - Utility function
 * @returns void
 */
  useEffect(() => {
    if (!isRsvpOpen) {
      return
    }
/**
 * shareRef - Utility function
 * @returns void
 */

    const handleClick = (eventTarget: MouseEvent) => {
      const target = eventTarget.target as Node
      if (rsvpRef.current && rsvpRef.current.contains(target)) {
        return
      }
/**
 * shareLink - Utility function
 * @returns void
 */
      setIsRsvpOpen(false)
    }

    const handleKeyDown = (eventKey: KeyboardEvent) => {
      if (eventKey.key === 'Escape') {
        setIsRsvpOpen(false)
/**
 * handleSelectStatus - Utility function
 * @returns void
 */
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isRsvpOpen])

  useEffect(() => {
    if (!isShareModalOpen) {
/**
 * handleClick - Utility function
 * @returns void
 */
      return
    }

    const handleClick = (eventTarget: MouseEvent) => {
/**
 * target - Utility function
 * @returns void
 */
      const target = eventTarget.target as Node
      if (shareRef.current && shareRef.current.contains(target)) {
        return
      }
      setIsShareModalOpen(false)
    }

    const handleKeyDown = (eventKey: KeyboardEvent) => {
      if (eventKey.key === 'Escape') {
        setIsShareModalOpen(false)
/**
 * handleKeyDown - Utility function
 * @returns void
 */
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isShareModalOpen])

  // -- render --
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.08)]">
      {/* cover */}
      <div className="relative overflow-hidden rounded-t-2xl">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="aspect-video w-full object-cover"
            loading="lazy"
/**
 * handleClick - Utility function
 * @returns void
 */
          />
        ) : (
          <div className="aspect-video w-full bg-linear-to-br from-slate-100 via-slate-200 to-slate-100" />
        )}
/**
 * target - Utility function
 * @returns void
 */

        {/* date badge */}
        <div className="absolute top-4 right-4 flex flex-col items-center rounded-xl border border-slate-200 bg-white px-2 py-1 shadow-sm">
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white uppercase">
            {event.month}
          </span>
          <span className="text-lg font-semibold text-slate-900">{event.day}</span>
        </div>
      </div>

/**
 * handleKeyDown - Utility function
 * @returns void
 */
      {/* details */}
      <div className="space-y-3 px-4 pt-3 pb-4">
        {/* meta */}
        <div className="text-xs text-slate-500">
          {event.location} | {event.startTime}
        </div>

        {/* title */}
        <h3 className="text-base font-semibold text-slate-900">{event.title}</h3>

        {/* attendees */}
        <div className="text-xs text-slate-500">
          {typeof event.attendees === "number" ? (
            `${event.attendees} attendee${event.attendees === 1 ? "" : "s"}`
          ) : (
            <span className="invisible">No attendees</span>
          )}
        </div>

        {/* actions */}
        <div className="relative z-10 flex items-center gap-2 pt-2">
          {/* rsvp */}
          <div className="relative flex-1" ref={rsvpRef}>
            <button
              type="button"
              onClick={() => {
                setIsShareModalOpen(false)
                setIsRsvpOpen((prev) => !prev)
              }}
              className={`inline-flex w-full whitespace-nowrap items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusStyles[status]}`}
            >
              <StatusIcon status={status} />
              {statusLabels[status]}
              <ChevronDown className="h-4 w-4" />
            </button>
            {isRsvpOpen ? (
              <div className="absolute top-full left-0 z-30 mt-2 w-full min-w-45 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {/* rsvp menu */}
                {(
                  [
                    { value: 'going', label: 'Going' },
                    { value: 'maybe', label: 'Maybe' },
                    { value: 'notGoing', label: 'Not Going' },
                  ] as Array<{ value: EventStatus; label: string }>
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectStatus(option.value)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <StatusIcon status={option.value} />
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* invite */}
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            <Mail className="h-4 w-4" />
            Invite
          </button>

          {/* share */}
          <div className="relative" ref={shareRef}>
            <button
              type="button"
              aria-label="Share"
              onClick={() => {
                setIsRsvpOpen(false)
                setIsShareModalOpen((prev) => !prev)
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <ShareSocialModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              fullName={event.title}
              storefrontUrl={shareLink}
              className="absolute top-full left-1/2 z-40 mt-2 -translate-x-1/2"
            />
          </div>
        </div>
      </div>
    </article>
  )
}
