import { useMemo, useState, type CSSProperties } from 'react'
import Marquee from '@shared/components/ui/marquee'
import { cn } from '@shared/lib/utils'

// @shared - landing page
import LandingPageSection from './LandingPageSection'
import { SPOTLIGHT_ARTISTS } from './constants'
import { SpotlightCard } from './CommunitySpotlightCards'

type CommunitySpotlightSectionProps = {
  className?: string
}

const MARQUEE_DURATION_SECONDS = 40

const CommunitySpotlight = ({ className }: CommunitySpotlightSectionProps) => {
  // -- state --
  const [paused, setPaused] = useState(false)

  // -- derived --
  const marqueeStyle = useMemo<CSSProperties>(
    () => ({ '--marquee-play': paused ? 'paused' : 'running' }) as CSSProperties,
    [paused],
  )

  return (
    <div className={cn('bg-black', className)}>
      <LandingPageSection className="!max-w-full !px-0 lg:!px-0">
        <div
          className="group relative overflow-hidden py-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* -- marquee content -- */}
          <Marquee
            className="landing-marquee !p-0 [--gap:18px]"
            pauseOnHover
            repeat={3}
            style={marqueeStyle}
          >
            {SPOTLIGHT_ARTISTS.map((artist, index) => (
              <SpotlightCard key={`spotlight-${index}`} artist={artist} />
            ))}
          </Marquee>

          {/* -- fade overlay -- */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent" />
        </div>
      </LandingPageSection>

      {/* -- styles -- */}
      <style jsx>{`
        :global(.landing-marquee) {
          --duration: ${MARQUEE_DURATION_SECONDS}s;
          --gap: 18px;
        }
        :global(.landing-marquee .animate-marquee) {
          animation: landing-marquee-horizontal var(--duration) linear infinite;
          animation-play-state: var(--marquee-play, running);
          will-change: transform;
        }
        :global(.landing-marquee .animate-marquee-vertical) {
          animation: landing-marquee-vertical var(--duration) linear infinite;
          animation-play-state: var(--marquee-play, running);
          will-change: transform;
        }
        :global(.landing-marquee:hover .animate-marquee),
        :global(.landing-marquee:hover .animate-marquee-vertical) {
          animation-play-state: var(--marquee-play, paused);
        }
        @keyframes landing-marquee-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% - var(--gap)));
          }
        }
        @keyframes landing-marquee-vertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(calc(-100% - var(--gap)));
          }
        }
      `}</style>
    </div>
  )
}

export default CommunitySpotlight
