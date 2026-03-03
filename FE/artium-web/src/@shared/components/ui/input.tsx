import * as React from 'react'

import { cn } from '@shared/lib/utils'

const inputClassName = cn(
  'flex h-[44px] w-full rounded-[8px] border border-input bg-background px-[16px] py-2',
  'text-base text-foreground ring-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
  'placeholder:text-black/[.3] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  'focus-visible:outline-none',
)

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return <input type={type} className={cn(inputClassName, className)} ref={ref} {...props} />
  },
)
Input.displayName = 'Input'

export { Input, inputClassName }
