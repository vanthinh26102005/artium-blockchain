import type { PropsWithChildren } from 'react'
import { cn } from '@shared/lib/utils'

type LandingPageSectionProps = PropsWithChildren<{
  className?: string
}>

/**
 * LandingPageSection - React component
 * @returns React element
 */
const LandingPageSection = ({ children, className }: LandingPageSectionProps) => {
  return (
    <section
      className={cn('mx-auto w-full max-w-6xl px-4 py-10 lg:max-w-7xl lg:px-6 lg:py-16', className)}
    >
      {children}
    </section>
  )
}

export default LandingPageSection
