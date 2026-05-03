/* eslint-disable @next/next/no-img-element */
import type { HostingEvent } from '@domains/events/state/useHostingEventsStore'

type EmailTemplatePreviewProps = {
  event: HostingEvent
  recipientEmails: string[]
}

/**
 * formatEventDate - Utility function
 * @returns void
 */
const formatEventDate = (dateString: string, timeZone?: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    /**
     * date - Utility function
     * @returns void
     */
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timeZone || undefined,
  }).format(date)
}

const formatEventTime = (startDateTime: string, endDateTime: string, timeZone?: string) => {
  const start = new Date(startDateTime)
  /**
   * formatEventTime - Utility function
   * @returns void
   */
  const end = new Date(endDateTime)

  const startTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timeZone || undefined,
  }).format(start)
  /**
   * start - Utility function
   * @returns void
   */

  const endTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    /**
     * end - Utility function
     * @returns void
     */
    hour12: true,
    timeZone: timeZone || undefined,
  }).format(end)

  return `${startTime} - ${endTime}`
  /**
   * startTime - Utility function
   * @returns void
   */
}

export function EmailTemplatePreview({
  event,
  recipientEmails: _recipientEmails,
}: EmailTemplatePreviewProps) {
  return (
    <div className="max-w-160 mx-auto bg-slate-50 font-inter text-slate-900">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 px-8 py-6">
          /** * endTime - Utility function * @returns void */
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Event Invitation
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            You&apos;re invited to {event.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {formatEventDate(event.startDateTime, event.timeZone)} •{' '}
            {formatEventTime(event.startDateTime, event.endDateTime, event.timeZone)}
            {event.timeZone ? ` • ${event.timeZone.replace(/_/g, ' ')}` : ''}
          </p>
          <button
            type="button"
            /**
             * EmailTemplatePreview - React component
             * @returns React element
             */
            className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
          >
            View Event
          </button>
        </div>

        <div className="border-b border-slate-200 px-8 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Event Details
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-700">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Date
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatEventDate(event.startDateTime, event.timeZone)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Time
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatEventTime(event.startDateTime, event.endDateTime, event.timeZone)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Location
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {event.locationType === 'online' ? 'Online event' : event.location}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Visibility
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {event.visibility === 'public' ? 'Public' : 'Private'}
              </p>
            </div>
          </div>
          {event.coverImageUrl ? (
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="mt-5 h-auto w-full rounded-2xl object-cover"
            />
          ) : null}
        </div>

        {event.description ? (
          <div className="border-b border-slate-200 px-8 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              About this event
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{event.description}</p>
          </div>
        ) : null}

        <div className="px-8 py-6">
          <p className="text-xs text-slate-500">Powered by Artium</p>
        </div>
      </div>
    </div>
  )
}
