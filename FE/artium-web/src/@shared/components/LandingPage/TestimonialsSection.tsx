import { useMemo, useState, type CSSProperties } from 'react'
import Marquee from '@shared/components/ui/marquee'

// @shared - landing page
import LandingPageSection from './LandingPageSection'
import { Heading } from './typography'
import { TestimonialVideoCard, ArtistQuoteCard } from './TestimonialCards'
import { ARTIST_DATA } from './testimonialsData'

type TestimonialsSectionProps = {
  className?: string
}

const TestimonialsSection = ({ className }: TestimonialsSectionProps) => {
  // -- state --
  const [paused, setPaused] = useState(false)

  // -- derived --
  const style = useMemo<CSSProperties>(
    () => ({ '--marquee-play': paused ? 'paused' : 'running' }) as CSSProperties,
    [paused],
  )

  return (
    <div className={className}>
      {/* -- header -- */}
      <LandingPageSection className="!pb-0">
        <Heading
          as="h2"
          size="h2"
          tone="light"
          className="font-monument-grotes mx-auto text-center text-[24px] leading-[42px] font-medium lg:w-[700px] lg:flex-shrink-0 lg:text-[44px] lg:leading-[56px] lg:tracking-[-0.2px]"
        >
          Meet the Community Using Artium to Scale Their Success
        </Heading>
      </LandingPageSection>

      {/* -- marquee content -- */}
      <LandingPageSection className="mt-[30px] !max-w-full !px-0 !pt-0 lg:mt-[47px]">
        <div
          className="group relative overflow-hidden py-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <Marquee
            className="testimonials-marquee !p-0 [--gap:16px] lg:[--gap:25px]"
            pauseOnHover
            repeat={3}
            style={style}
          >
            {ARTIST_DATA.map((artist, idx) =>
              artist.type === 'video' ? (
                <TestimonialVideoCard key={idx} {...artist} />
              ) : (
                <ArtistQuoteCard key={idx} {...artist} />
              ),
            )}
          </Marquee>

          {/* -- fade overlay -- */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent" />
        </div>
      </LandingPageSection>

      {/* -- styles -- */}
      <style jsx>{`
        :global(.testimonials-marquee) {
          --duration: 30s;
          --gap: 16px;
        }
        :global(.testimonials-marquee .animate-marquee) {
          animation: testimonials-marquee-horizontal var(--duration) linear infinite;
          animation-play-state: var(--marquee-play, running);
          will-change: transform;
        }
        :global(.testimonials-marquee:hover .animate-marquee) {
          animation-play-state: var(--marquee-play, paused);
        }
        @keyframes testimonials-marquee-horizontal {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% - var(--gap)));
          }
        }
      `}</style>
    </div>
  )
}

export default TestimonialsSection
