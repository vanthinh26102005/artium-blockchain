import { cn } from '@shared/lib/utils'

// @shared - landing page
import LandingPageSection from './LandingPageSection'
import { Heading, Text } from './typography'
import { JOURNEY_ITEMS } from './constants'
import { JourneyCard } from './JourneyCard'

type JourneySectionProps = {
  className?: string
}

/**
 * JourneySection - React component
 * @returns React element
 */
const JourneySection = ({ className }: JourneySectionProps) => {
  return (
    <LandingPageSection className={cn('space-y-[24px] lg:space-y-[30px]', className)}>
      {/* -- header -- */}
      <Heading
        as="h2"
        size="h2"
        tone="light"
        className="text-center text-[24px] leading-[130%] font-medium tracking-[-1.4px] lg:!text-[70px] lg:leading-none"
      >
        <span className="inline lg:block">Designed for Every</span>{' '}
        <span className="inline lg:block">Stage of the Art Journey</span>
      </Heading>

      <Text className="!mt-2 text-center text-[14px] leading-[16px] text-white/80 lg:!mt-[30px] lg:text-[24px] lg:leading-[130%]">
        No matter your role in the art world,{' '}
        <span className="font-bold">
          Artium brings <br className="hidden lg:inline" /> everything you need into one seamless
          platform.
        </span>
      </Text>

      {/* -- cards -- */}
      <div className="flex flex-col items-start justify-center gap-6 self-stretch lg:flex-row">
        {JOURNEY_ITEMS.map((item) => (
          <JourneyCard key={item.title} {...item} />
        ))}
      </div>
    </LandingPageSection>
  )
}

export default JourneySection
