import { cn } from '@shared/lib/utils'

// @shared - landing page
import { InteractiveDarkSection } from './InteractiveColorField'
import LandingPageSection from './LandingPageSection'
import { ScrollReveal } from './ScrollReveal'
import { JOURNEY_ITEMS } from './constants'
import { JourneyCard } from './JourneyCard'

type JourneySectionProps = {
  className?: string
}

const JourneySection = ({ className }: JourneySectionProps) => {
  return (
    <InteractiveDarkSection className={cn('text-white', className)}>
      <LandingPageSection>
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,0.62fr)_minmax(320px,0.38fr)] lg:items-end">
          <ScrollReveal distance={24}>
            <h2 className="font-monument-grotes max-w-4xl text-4xl leading-[1] font-semibold tracking-normal uppercase md:text-6xl">
              Built for every side of the art market.
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={90} distance={24}>
            <p className="text-base leading-7 text-white/62 lg:text-lg">
              Artists get a better way to publish and sell. Galleries get a sharper operating system
              for programs, buyers, and revenue.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {JOURNEY_ITEMS.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 90} distance={24}>
              <JourneyCard {...item} />
            </ScrollReveal>
          ))}
        </div>
      </LandingPageSection>
    </InteractiveDarkSection>
  )
}

export default JourneySection
