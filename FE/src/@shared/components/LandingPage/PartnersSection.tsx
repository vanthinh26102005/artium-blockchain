import Link from 'next/link'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

// @shared - landing page
import LandingPageSection from './LandingPageSection'
import { Heading } from './typography'

type PartnersSectionProps = {
  className?: string
}

/**
 * PartnersSection - React component
 * @returns React element
 */
const PartnersSection = ({ className }: PartnersSectionProps) => {
  return (
    <LandingPageSection
      className={cn('!py-[60px] text-center lg:!pb-[80px] lg:!pt-[100px]', className)}
    >
      {/* -- headings -- */}
      <Heading
        size="h1"
        tone="light"
        className="text-[19px] font-bold leading-none text-white/60 3xl:text-[100px] lg:text-[60px] lg:font-medium"
      >
        The art world&apos;s future is creator-first
      </Heading>
      <Heading
        size="h1"
        tone="light"
        className="mt-[8px] text-[30px] font-bold leading-none 3xl:text-[100px] lg:text-[60px] lg:font-medium"
      >
        The future is Artium
      </Heading>

      {/* -- cta -- */}
      <Button asChild className="mt-[16px] lg:mt-[64px]">
        <Link href="/discover">Get Started</Link>
      </Button>
    </LandingPageSection>
  )
}

export default PartnersSection
