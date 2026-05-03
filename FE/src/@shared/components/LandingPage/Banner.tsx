import Link from 'next/link'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

// @shared - landing page
import LandingPageSection from './LandingPageSection'
import { Heading, Text } from './typography'
import HeroParticles from './HeroParticles'

type BannerProps = {
  className?: string
}

/**
 * Banner - React component
 * @returns React element
 */
const Banner = ({ className }: BannerProps) => {
  return (
    <section className={cn('relative isolate w-full overflow-hidden bg-black', className)}>
      {/* -- particles background -- */}
      <HeroParticles />

      {/* -- content -- */}
      <LandingPageSection className="relative z-10 pt-16 lg:pt-24">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <Heading
            size="h1"
            tone="light"
            className="text-[40px] leading-none lg:w-[60%] lg:text-[72px] xl:text-[92px]"
          >
            Discover art.
            <br />
            Manage your business.
            <br />
            All in one platform.
          </Heading>

          <div className="flex flex-col gap-6 lg:w-[34%]">
            <Text className="text-sm text-white/80 lg:text-lg xl:text-xl">
              Connect with collectors through AI-powered discovery while running your gallery or
              artist studio with professional tools for inventory, payments, website hosting,
              emails, and client management.
            </Text>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full bg-white text-black hover:bg-white/90"
              >
                <Link href="/discover">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </LandingPageSection>
    </section>
  )
}

export default Banner
