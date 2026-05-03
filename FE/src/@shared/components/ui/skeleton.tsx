import { cn } from '@shared/lib/utils'

/**
 * Skeleton - React component
 * @returns React element
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}

export { Skeleton }
