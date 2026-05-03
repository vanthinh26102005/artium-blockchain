import { cn } from '@shared/lib/utils'

/**
 * Skeleton - React component
 * @returns React element
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('bg-muted animate-pulse rounded-md', className)} {...props} />
}

export { Skeleton }
