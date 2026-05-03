import { useState } from 'react'

// @domains - events
import {
  EventDialog,
  EventDialogContent,
  EventDialogTitle,
} from '@domains/events/modals/EventDialog'
import { InviteEventForm } from '@domains/events/forms/InviteEventForm'
import { EmailPreviewModal } from '@domains/events/modals/EmailPreviewModal'
import type { HostingEvent } from '@domains/events/state/useHostingEventsStore'
import { useHostingEventsStore } from '@domains/events/state/useHostingEventsStore'

type InviteEventModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: HostingEvent
  onInviteSuccess?: (recipientEmails: string[]) => void
}

/**
 * InviteEventModal - React component
 * @returns React element
 */
export function InviteEventModal({
  open,
  onOpenChange,
  event,
  onInviteSuccess,
}: InviteEventModalProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewRecipientEmails, setPreviewRecipientEmails] = useState<string[]>([])
  const sendInvitations = useHostingEventsStore((state) => state.sendInvitations)

  const handlePreview = (recipientEmails: string[]) => {
    /**
     * sendInvitations - Utility function
     * @returns void
     */
    setPreviewRecipientEmails(recipientEmails)
    setPreviewOpen(true)
  }

  const handleSubmit = async (recipientEmails: string[], message?: string) => {
    /**
     * handlePreview - Utility function
     * @returns void
     */
    await sendInvitations(event.id, recipientEmails, message)

    // Call success callback
    onInviteSuccess?.(recipientEmails)

    // Close modal
    onOpenChange(false)
  }
  /**
   * handleSubmit - Utility function
   * @returns void
   */

  return (
    <>
      <EventDialog open={open} onOpenChange={onOpenChange}>
        <EventDialogContent className="max-h-[85vh] overflow-hidden font-inter">
          <div className="border-b border-slate-200 pb-5 pt-4 text-center">
            <EventDialogTitle className="text-3xl leading-tight">Invite to Event</EventDialogTitle>
            <p className="mt-2 text-sm text-slate-600">{event.title}</p>
          </div>
          <InviteEventForm
            event={event}
            onCancel={() => onOpenChange(false)}
            onPreview={handlePreview}
            onSubmitSuccess={handleSubmit}
          />
        </EventDialogContent>
      </EventDialog>

      <EmailPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        event={event}
        recipientEmails={previewRecipientEmails}
      />
    </>
  )
}
