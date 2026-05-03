'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '@shared/lib/utils'

/**
 * EventDialog - React component
 * @returns React element
 */
const EventDialog = DialogPrimitive.Root

const EventDialogTrigger = DialogPrimitive.Trigger

const EventDialogPortal = DialogPrimitive.Portal
/**
 * EventDialogTrigger - React component
 * @returns React element
 */

const EventDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  /**
   * EventDialogPortal - React component
   * @returns React element
   */
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[210] bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
      /**
       * EventDialogOverlay - React component
       * @returns React element
       */
    )}
    {...props}
  />
))
EventDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const EventDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <EventDialogPortal>
      <EventDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-[220] w-[min(760px,calc(100%-2rem))] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white shadow-2xl',
          className,
          /**
           * EventDialogContent - React component
           * @returns React element
           */
        )}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => event.preventDefault()}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-6 top-6 inline-flex h-6 w-6 items-center justify-center text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </EventDialogPortal>
  )
})
EventDialogContent.displayName = DialogPrimitive.Content.displayName

const EventDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-center font-semibold text-slate-900', className)}
    {...props}
  />
))
EventDialogTitle.displayName = DialogPrimitive.Title.displayName

export {
  EventDialog,
  EventDialogTrigger,
  /**
   * EventDialogTitle - React component
   * @returns React element
   */
  EventDialogContent,
  EventDialogTitle,
}
