import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@shared/lib/utils'

/**
 * badgeVariants - Utility function
 * @returns void
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-black bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-black bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-black bg-destructive text-destructive-foreground hover:bg-destructive/80',
        success: 'border-black bg-success text-white hover:bg-success/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
/**
 * Badge - React component
 * @returns React element
 */

export { Badge, badgeVariants }
