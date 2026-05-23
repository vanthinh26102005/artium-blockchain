import { useMemo, useState, type CSSProperties } from 'react'
import { MessageSquareQuote } from 'lucide-react'
import Marquee from '@shared/components/ui/marquee'
import { cn } from '@shared/lib/utils'

// @shared - landing page
import { InteractiveDarkSection } from './InteractiveColorField'
import LandingPageSection from './LandingPageSection'
import { TestimonialVideoCard, ArtistQuoteCard } from './TestimonialCards'
import { ARTIST_DATA } from './testimonialsData'

type TestimonialsSectionProps = {
  className?: string
}

const TestimonialsSection = ({ className }: TestimonialsSectionProps) => {
  const [paused, setPaused] = useState(false)

  const style = useMemo<CSSProperties>(
    () => ({ '--marquee-play': paused ? 'paused' : 'running' }) as CSSProperties,
    [paused],
  )

  return (
    <InteractiveDarkSection className={cn('text-white', className)}>
      <LandingPageSection className="grid gap-6 !pb-4 lg:grid-cols-[minmax(0,0.66fr)_minmax(320px,0.34fr)] lg:items-end">
        <div>
          <p className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.035] px-3 text-[11px] tracking-[0.2em] text-white/58 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
            <MessageSquareQuote className="h-4 w-4" />
            Artist proof
          </p>
          <h2 className="font-monument-grotes max-w-4xl text-4xl leading-[1] font-semibold tracking-normal uppercase md:text-6xl">
            Sales stories from working artists.
          </h2>
        </div>
        <p className="text-base leading-7 text-white/62 lg:text-lg">
          The landing page now moves from discovery to proof: artists, galleries, and collectors can
          see real outcomes before they enter the marketplace.
        </p>
      </LandingPageSection>

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

          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#050505] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#050505] to-transparent" />
        </div>
      </LandingPageSection>

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
        @media (prefers-reduced-motion: reduce) {
          :global(.testimonials-marquee .animate-marquee) {
            animation-play-state: paused;
          }
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
    </InteractiveDarkSection>
  )
}

export default TestimonialsSection
