import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@shared/lib/utils'

/**
 * VideoModal - React component
 * @returns React element
 */
const VideoModal = DialogPrimitive.Root

const VideoModalTrigger = DialogPrimitive.Trigger

const VideoModalPortal = DialogPrimitive.Portal
/**
 * VideoModalTrigger - React component
 * @returns React element
 */

const VideoModalClose = DialogPrimitive.Close

const VideoModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
/**
 * VideoModalPortal - React component
 * @returns React element
 */
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
/**
 * VideoModalClose - React component
 * @returns React element
 */
      'data-[state=closed]:animate-modal-fade-out data-[state=open]:animate-modal-fade-in fixed inset-0 z-50 backdrop-blur-xl',
      className,
    )}
    {...props}
  />
/**
 * VideoModalOverlay - React component
 * @returns React element
 */
))
VideoModalOverlay.displayName = DialogPrimitive.Overlay.displayName

const VideoModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <VideoModalPortal>
    <VideoModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed top-1/2 left-1/2 z-50 flex h-screen w-screen -translate-x-1/2 -translate-y-1/2 items-center justify-center p-3',
        'data-[state=closed]:animate-modal-fade-out data-[state=open]:animate-modal-fade-in data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[50%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[50%] transition-all',
        className,
      )}
      {...props}
    >
/**
 * VideoModalContent - React component
 * @returns React element
 */
      <div className="relative mx-auto flex size-full items-center justify-center rounded-2xl border border-gray-950/[.1] bg-gray-50/[.2] dark:border-gray-50/[.1] dark:bg-gray-950/[.5]">
        {/* Mobile close button */}
        <CloseIcon isMobile />

        <div className="flex h-4/5 w-full max-w-5xl gap-6">
          {/* Desktop close button */}
          <CloseIcon />
          <div className="flex w-full flex-col max-lg:p-4 max-lg:text-center">{children}</div>
        </div>
      </div>
    </DialogPrimitive.Content>
  </VideoModalPortal>
))

VideoModalContent.displayName = DialogPrimitive.Content.displayName

const VideoModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('mb-4 text-2xl font-bold text-white md:text-4xl dark:text-gray-50', className)}
    {...props}
  />
))
VideoModalTitle.displayName = DialogPrimitive.Title.displayName

const VideoModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
/**
 * VideoModalTitle - React component
 * @returns React element
 */
    className={cn('mb-6 text-xl text-gray-950/80 dark:text-gray-50/70', className)}
    {...props}
  />
))
VideoModalDescription.displayName = DialogPrimitive.Description.displayName

const VideoPreview = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'absolute inset-0 z-10 transition-opacity duration-500 group-[.playing]:pointer-events-none group-[.playing]:opacity-0',
        className,
      )}
      {...props}
/**
 * VideoModalDescription - React component
 * @returns React element
 */
    >
      {children}
    </div>
  ),
)
VideoPreview.displayName = 'VideoPreview'

const VideoPlayButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 group-[.playing]:pointer-events-none group-[.playing]:opacity-0',
        className,
      )}
/**
 * VideoPreview - React component
 * @returns React element
 */
      {...props}
    >
      {children}
    </div>
  ),
)
VideoPlayButton.displayName = 'VideoPlayButton'

const VideoPlayer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const [isPlaying, setIsPlaying] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn(
          'group relative aspect-video max-w-4xl overflow-hidden rounded-xl border border-gray-950/[.1] object-cover dark:border-gray-50/[.1]',
          isPlaying && 'playing',
          className,
/**
 * VideoPlayButton - React component
 * @returns React element
 */
        )}
        onClick={() => setIsPlaying(true)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
VideoPlayer.displayName = 'VideoPlayer'

const VideoModalVideo = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'aspect-video max-w-4xl overflow-hidden rounded-xl border border-gray-950/[.1] object-cover shadow-xl dark:border-gray-50/[.1]',
        className,
      )}
/**
 * VideoPlayer - React component
 * @returns React element
 */
      {...props}
    >
      {children}
    </div>
  ),
)
VideoModalVideo.displayName = 'VideoModalVideo'

const CloseIcon = React.forwardRef<
  React.ElementRef<typeof VideoModalClose>,
  React.ComponentPropsWithoutRef<typeof VideoModalClose> & {
    isMobile?: boolean
  }
>(({ className, isMobile = false, ...props }, ref) => (
  <VideoModalClose
    ref={ref}
    className={cn(
      'rounded-full border border-white p-2 text-white transition duration-300 hover:bg-white/10',
      isMobile ? 'absolute top-4 right-4 lg:hidden' : 'hidden self-start lg:block',
      className,
    )}
    {...props}
  >
    <svg fill="none" height="12" viewBox="0 0 12 12" width="12" xmlns="http://www.w3.org/2000/svg">
      <path
/**
 * VideoModalVideo - React component
 * @returns React element
 */
        d="M1 1L11 11M11 1L1 11"
        className="stroke-current"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
    </svg>
    <span className="sr-only">Close</span>
  </VideoModalClose>
))

CloseIcon.displayName = 'CloseIcon'

export {
  VideoModal,
  VideoModalTrigger,
  VideoModalContent,
  VideoModalTitle,
  VideoModalDescription,
/**
 * CloseIcon - React component
 * @returns React element
 */
  VideoModalVideo,
  VideoPreview,
  VideoPlayButton,
  VideoPlayer,
}
