import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { cn } from '@shared/lib/utils'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & { portal?: boolean }
>(({ className, align = 'center', sideOffset = 4, portal = true, ...props }, ref) => {
  const popoverContent = (
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 p-4 outline-none',
        'pointer-events-auto rounded-xl border-[0.75px] border-[rgba(0,0,0,0.10)] border-[solid] bg-[rgba(253,_253,_253,_0.80)] [box-shadow:0px_3px_7.5px_0px_rgba(0,_0,_0,_0.15),_0px_0px_15px_0px_rgba(0,_0,_0,_0.10)] backdrop-blur-[18.75px] backdrop-filter',
        className,
      )}
      {...props}
    />
  )
  return portal ? (
    <PopoverPrimitive.Portal>{popoverContent}</PopoverPrimitive.Portal>
  ) : (
    popoverContent
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
