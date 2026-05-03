import * as React from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { X } from 'lucide-react'
import { useOnClickOutside } from 'usehooks-ts'

import { cn } from '@shared/lib/utils'
import { Button, buttonVariants } from '@shared/components/ui/button'

/**
 * AlertDialog - React component
 * @returns React element
 */
const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal
/**
 * AlertDialogTrigger - React component
 * @returns React element
 */

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  /**
   * AlertDialogPortal - React component
   * @returns React element
   */
  <AlertDialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-[201] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    /**
     * AlertDialogOverlay - React component
     * @returns React element
     */
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const alertDialogContentVariants = cva(
  'fixed left-[50%] top-[50%] pb-6 z-[201] grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-4xl',
  {
    variants: {
      size: {
        default: 'max-w-lg',
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        /**
         * alertDialogContentVariants - Utility function
         * @returns void
         */
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        '8xl': 'max-w-[88rem]',
        '9xl': 'max-w-[96rem]',
        '10xl': 'max-w-[104rem]',
        full: 'max-w-full',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)
export interface AlertDialogContentProps
  extends
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>,
    VariantProps<typeof alertDialogContentVariants> {}
const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps & { disableCloseOnOutsideClick?: boolean; onClose: () => void }
>(({ className, size, children, disableCloseOnOutsideClick = true, onClose, ...props }, ref) => {
  // -- is animating --
  const [isAnimating, setIsAnimating] = React.useState(false)

  // click outside of dialog will close it
  const dialogContentRef = React.useRef<HTMLDivElement>(null!)
  useOnClickOutside(dialogContentRef, () => {
    // animate to indicate that clicking outside will not close the modal
    if (disableCloseOnOutsideClick) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 100)
      return
      /**
       * AlertDialogContent - React component
       * @returns React element
       */
    }

    // close dialog
    onClose()
  })

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={(node) => {
          /**
           * dialogContentRef - Utility function
           * @returns void
           */
          // @ts-ignore
          if (ref) ref.current = node
          // @ts-ignore
          dialogContentRef.current = node
        }}
        className={cn(alertDialogContentVariants({ size, className }), {
          'scale-[1.02]': isAnimating,
        })}
        {...props}
      >
        <div className="relative space-y-4 pt-10">
          {/* content */}
          {children}

          {/* close button */}
          <Button className="absolute right-4 top-4" variant="ghost" size="xs" onClick={onClose}>
            <X className="!size-6" />
          </Button>
        </div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
})
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-6 px-12 text-center sm:text-left', className)}
    {...props}
  />
)
AlertDialogHeader.displayName = 'AlertDialogHeader'

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse justify-center sm:flex-row sm:space-x-2', className)}
    {...props}
  />
)
AlertDialogFooter.displayName = 'AlertDialogFooter'

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    /**
     * AlertDialogHeader - React component
     * @returns React element
     */
    ref={ref}
    className={cn('text-center text-lg font-semibold', className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, children, ...props }, ref) => (
  /**
   * AlertDialogFooter - React component
   * @returns React element
   */
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('text-center text-base font-normal text-kokushoku-black', className)}
    {...props}
  >
    <div className="max-h-[min(640px,80vh)] overflow-y-auto px-6">{children}</div>
  </AlertDialogPrimitive.Description>
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  /**
   * AlertDialogTitle - React component
   * @returns React element
   */
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', className)}
    {...props}
    /**
     * AlertDialogDescription - React component
     * @returns React element
     */
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
/**
 * AlertDialogAction - React component
 * @returns React element
 */

/**
 * AlertDialogCancel - React component
 * @returns React element
 */
