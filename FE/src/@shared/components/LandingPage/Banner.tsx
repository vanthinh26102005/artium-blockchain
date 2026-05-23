import Link from 'next/link'
import { ArrowRight, BadgeCheck, Gavel, Search, ShieldCheck } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

// @shared - landing page
import { InteractiveDarkSection } from './InteractiveColorField'
import LandingPageSection from './LandingPageSection'
import { LandingMotionPlayer } from './LandingMotionPlayer'
import { ScrollReveal } from './ScrollReveal'

type BannerProps = {
  className?: string
}

const trustSignals = [
  { label: 'Verified provenance', icon: BadgeCheck },
  { label: 'Live auction tools', icon: Gavel },
  { label: 'Secure collector checkout', icon: ShieldCheck },
]

const marketStats = [
  { value: '15K+', label: 'Artworks Sold', accent: 'from-[#f97316]/70 via-white/20' },
  { value: '8K+', label: 'Active Collectors', accent: 'from-[#35c9ee]/70 via-white/20' },
  { value: '$4.5M+', label: 'Artwork Sales', accent: 'from-[#22c55e]/70 via-white/20' },
]

const Banner = ({ className }: BannerProps) => {
  return (
    <InteractiveDarkSection variant="hero" className={cn('text-white', className)}>
      <LandingPageSection className="flex min-h-[calc(100vh-88px)] flex-col justify-center !py-10 lg:!py-14">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] lg:items-center">
          <ScrollReveal className="max-w-4xl min-w-0" delay={60} distance={20}>
            <p className="mb-5 inline-flex min-h-11 max-w-full items-center gap-2 rounded-[8px] border border-white/16 bg-white/[0.04] px-3 text-[11px] font-semibold tracking-[0.16em] text-white/68 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md sm:px-4 sm:tracking-[0.22em]">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Marketplace, auctions, CRM, and payments</span>
              <span className="sm:hidden">Marketplace + auctions</span>
            </p>

            <h1 className="font-monument-grotes max-w-[780px] text-[56px] leading-[0.9] font-semibold tracking-normal text-white uppercase sm:text-[74px] lg:text-[104px] xl:text-[118px]">
              Artium
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76 lg:text-xl lg:leading-9">
              A collector-facing art marketplace with the operating system artists and galleries
              need behind the scenes: live auctions, portfolio sites, invoices, inventory, email,
              and client management.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="xl"
                className="min-h-14 w-full rounded-full !bg-white px-7 text-base font-semibold !text-black hover:!bg-white/90 sm:w-auto"
              >
                <Link href="/discover">
                  Explore artworks
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="min-h-14 w-full rounded-full border-white/18 !bg-transparent px-7 text-base font-semibold !text-white hover:!bg-white hover:!text-black sm:w-auto"
              >
                <Link href="/auction">View live auctions</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {trustSignals.map((signal) => {
                const Icon = signal.icon
                return (
                  <span
                    key={signal.label}
                    className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.035] px-3 text-xs font-medium text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md"
                  >
                    <Icon className="h-4 w-4 text-white" />
                    {signal.label}
                  </span>
                )
              })}
            </div>
          </ScrollReveal>

          <ScrollReveal
            className="relative min-w-0 lg:-mr-8 xl:-mr-20"
            delay={140}
            direction="right"
            distance={24}
          >
            <LandingMotionPlayer />
          </ScrollReveal>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:mt-12">
          {marketStats.map((stat, index) => (
            <ScrollReveal key={stat.label} className="min-w-0" delay={index * 90} distance={22}>
              <div className="group relative flex min-h-[124px] flex-col items-center justify-center overflow-hidden rounded-[8px] border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] px-5 py-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/[0.055] sm:min-h-[132px]">
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-0 right-6 left-6 h-px bg-gradient-to-r to-transparent opacity-80',
                    stat.accent,
                  )}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_42%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <p className="font-monument-grotes relative text-4xl font-semibold tracking-normal text-white tabular-nums sm:text-[42px] lg:text-[46px]">
                  {stat.value}
                </p>
                <p className="relative mt-2 text-[10px] font-semibold tracking-[0.2em] text-white/48 uppercase sm:text-[11px]">
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </LandingPageSection>
    </InteractiveDarkSection>
  )
}

export default Banner
