// react
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - events
import { type HostingEventStatus } from '@domains/events/mock/mockHostingEvents'

type StatusButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  status: HostingEventStatus
}

/**
 * statusStyles - Utility function
 * @returns void
 */
const statusStyles: Record<HostingEventStatus, string> = {
  going: 'border-[#C5DBFF] bg-[#D7E7FF] text-[#1D4ED8]',
  maybe: 'border-[#FDE68A] bg-[#FFF2A8] text-[#111827]',
  notGoing: 'border-[#F7C6C6] bg-[#FADADA] text-[#111827]',
  rsvp: 'border-slate-200 bg-white text-slate-700',
}

export const StatusButton = forwardRef<HTMLButtonElement, StatusButtonProps>(
  ({ status, className, type = 'button', ...props }, ref) => {
    return (
      /**
       * StatusButton - React component
       * @returns React element
       */
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold',
          statusStyles[status],
          className,
        )}
        {...props}
      />
    )
  },
)

StatusButton.displayName = 'StatusButton'
