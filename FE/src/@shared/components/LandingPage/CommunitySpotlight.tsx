import { useMemo, useState, type CSSProperties } from 'react'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import Marquee from '@shared/components/ui/marquee'
import { cn } from '@shared/lib/utils'

// @shared - landing page
import { InteractiveDarkSection } from './InteractiveColorField'
import LandingPageSection from './LandingPageSection'
import { ScrollReveal } from './ScrollReveal'
import { SPOTLIGHT_ARTISTS } from './constants'
import { SpotlightCard } from './CommunitySpotlightCards'

type CommunitySpotlightSectionProps = {
  className?: string
}

const MARQUEE_DURATION_SECONDS = 42

const CommunitySpotlight = ({ className }: CommunitySpotlightSectionProps) => {
  const [paused, setPaused] = useState(false)

  const marqueeStyle = useMemo<CSSProperties>(
    () => ({ '--marquee-play': paused ? 'paused' : 'running' }) as CSSProperties,
    [paused],
  )

  return (
    <InteractiveDarkSection className={cn('text-white', className)}>
      <LandingPageSection className="grid gap-8 !pb-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(320px,0.3fr)] lg:items-end">
        <ScrollReveal distance={24}>
          <p className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.035] px-3 text-[11px] tracking-[0.2em] text-white/58 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            Community signal
          </p>
          <h2 className="font-monument-grotes max-w-4xl text-4xl leading-[1] font-semibold tracking-normal text-white uppercase md:text-6xl">
            A marketplace that keeps the artist visible.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={90} distance={24}>
          <p className="text-base leading-7 text-white/62 lg:text-lg">
            Real works, live demand, and collector signals sit beside the business workflows that
            help artists and galleries act on that momentum.
          </p>
        </ScrollReveal>
      </LandingPageSection>

      <LandingPageSection className="!max-w-full !px-0 !pt-0 lg:!px-0">
        <ScrollReveal
          className="group relative overflow-hidden py-4"
          delay={80}
          distance={18}
          direction="none"
        >
          <div
            className="group relative overflow-hidden py-4"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
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

            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#050505] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#050505] to-transparent" />
          </div>
        </ScrollReveal>
      </LandingPageSection>

      <LandingPageSection className="grid gap-4 !pt-4 sm:grid-cols-3">
        {[
          [
            'Artist storefronts',
            'Launch a collector-ready profile and keep every work searchable.',
          ],
          [
            'Live auctions',
            'Turn demand into transparent bidding with blockchain-backed settlement.',
          ],
          [
            'Operating tools',
            'Manage inventory, invoices, CRM, email, and payouts from one place.',
          ],
        ].map(([title, body], index) => (
          <ScrollReveal key={title} className="min-w-0" delay={index * 80} distance={22}>
            <div className="rounded-[8px] border border-white/10 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
              <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-[6px] bg-white/[0.92] text-black">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <h3 className="font-monument-grotes text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/56">{body}</p>
            </div>
          </ScrollReveal>
        ))}
      </LandingPageSection>

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
        @media (prefers-reduced-motion: reduce) {
          :global(.landing-marquee .animate-marquee),
          :global(.landing-marquee .animate-marquee-vertical) {
            animation-play-state: paused;
          }
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
    </InteractiveDarkSection>
  )
}

export default CommunitySpotlight
