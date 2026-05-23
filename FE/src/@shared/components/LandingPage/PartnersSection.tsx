import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Gavel, ShieldCheck } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

// @shared - landing page
import LandingPageSection from './LandingPageSection'
import { ScrollReveal } from './ScrollReveal'

type PartnersSectionProps = {
  className?: string
}

const PartnersSection = ({ className }: PartnersSectionProps) => {
  return (
    <section className={cn('bg-[#f6f6f2] text-[#111111]', className)}>
      <LandingPageSection className="grid gap-8 lg:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)] lg:items-center">
        <ScrollReveal distance={24}>
          <p className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-black/12 bg-white/50 px-3 text-[11px] tracking-[0.2em] text-black/54 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            Ready for demo
          </p>
          <h2 className="font-monument-grotes max-w-3xl text-4xl leading-[1] font-semibold tracking-normal uppercase md:text-6xl">
            Start with the marketplace. Keep every sale connected.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-black/64 lg:text-lg">
            Collectors can browse live work, bid in auctions, and move into a clearer checkout path
            while artists manage the operational layer behind the scenes.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="xl"
              className="min-h-14 rounded-full !bg-black px-7 text-base font-semibold !text-white hover:!bg-black/80"
            >
              <Link href="/discover">
                Browse marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="min-h-14 rounded-full border-black/15 !bg-transparent px-7 text-base font-semibold !text-black hover:!bg-black hover:!text-white"
            >
              <Link href="/auction">
                Live auctions
                <Gavel className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal
          className="grid min-h-[460px] grid-cols-[0.78fr_1fr] gap-4"
          delay={100}
          direction="right"
          distance={24}
        >
          <div className="relative mt-16 overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.12)]">
            <Image
              src="/images/homepage-v2/community-spotlight/art-3.jpg"
              alt="Featured Artium artwork"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 44vw, 22vw"
            />
          </div>
          <div className="grid gap-4">
            <div className="relative overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.1)]">
              <Image
                src="/images/homepage-v2/community-spotlight/art-8.jpg"
                alt="Collector-ready artwork listing"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 56vw, 28vw"
              />
            </div>
            <div className="rounded-[8px] border border-white/10 bg-[#111111]/[0.94] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
              <p className="text-[11px] tracking-[0.2em] text-white/44 uppercase">Next step</p>
              <p className="font-monument-grotes mt-4 text-3xl leading-none font-semibold">
                Demo the full collector flow.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </LandingPageSection>
    </section>
  )
}

export default PartnersSection
