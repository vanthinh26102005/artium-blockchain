import Link from 'next/link'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

// @shared - landing page
import LandingPageSection from './LandingPageSection'
import { Heading } from './typography'

type PartnersSectionProps = {
  className?: string
}

const PartnersSection = ({ className }: PartnersSectionProps) => {
  return (
    <LandingPageSection
      className={cn('!py-[60px] text-center lg:!pt-[100px] lg:!pb-[80px]', className)}
    >
      {/* -- headings -- */}
      <Heading
        size="h1"
        tone="light"
        className="3xl:text-[100px] text-[19px] leading-none font-bold text-white/60 lg:text-[60px] lg:font-medium"
      >
        The art world&apos;s future is creator-first
      </Heading>
      <Heading
        size="h1"
        tone="light"
        className="3xl:text-[100px] mt-[8px] text-[30px] leading-none font-bold lg:text-[60px] lg:font-medium"
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
