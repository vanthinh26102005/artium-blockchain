import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { EmailTemplatePreview } from '@domains/events/components/email/EmailTemplatePreview'
import type { HostingEvent } from '@domains/events/state/useHostingEventsStore'

type EmailPreviewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: HostingEvent
  recipientEmails: string[]
}

/**
 * EmailPreviewModal - React component
 * @returns React element
 */
export function EmailPreviewModal({
  open,
  onOpenChange,
  event,
  recipientEmails,
}: EmailPreviewModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay with higher z-index */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[230] bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        {/* Content with higher z-index */}
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-[240] max-h-[90vh] w-[min(680px,calc(100%-2rem))] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl bg-white font-inter shadow-2xl',
          )}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="border-b border-slate-200 pb-4 pt-4 text-center">
            <DialogPrimitive.Title className="text-center text-2xl font-semibold leading-tight text-slate-900">
              Email Preview
            </DialogPrimitive.Title>
            <p className="mt-1 text-xs text-slate-600">Subject - Event invitation: {event.title}</p>
          </div>
          <div className="max-h-[calc(90vh-180px)] overflow-y-auto">
            <EmailTemplatePreview event={event} recipientEmails={recipientEmails} />
          </div>
          <div className="border-t border-slate-200 bg-white px-6 py-4 text-center">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
          {/* Close button */}
          <DialogPrimitive.Close className="absolute right-6 top-6 inline-flex h-6 w-6 items-center justify-center text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
