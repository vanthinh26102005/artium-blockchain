import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ArrowRight, Check, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

// @shared - landing page
import LandingPageSection from './LandingPageSection'
import { FEATURES } from './constants'

type FeaturesSectionProps = {
  className?: string
}

const FeaturesSection = ({ className }: FeaturesSectionProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeFeature = FEATURES[activeIndex] ?? FEATURES[0]
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const handleSignUpClick = () => {
    if (isAuthenticated) return
    void router.push('/sign-up')
  }

  return (
    <section className={cn('bg-white text-[#111111]', className)}>
      <LandingPageSection>
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,0.62fr)_minmax(320px,0.38fr)] lg:items-end">
          <div>
            <p className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-black/10 bg-white/70 px-3 text-[11px] tracking-[0.2em] text-black/50 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-md">
              <LayoutDashboard className="h-4 w-4" />
              Tools that close the loop
            </p>
            <h2 className="font-monument-grotes max-w-4xl text-4xl leading-[1] font-semibold tracking-normal uppercase md:text-6xl">
              One platform for the work after discovery.
            </h2>
          </div>
          <p className="text-base leading-7 text-black/62 lg:text-lg">
            Keep the storefront beautiful and the operational layer practical. Each tool is designed
            for repeat use by working artists and gallery teams.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[390px_minmax(0,1fr)]">
          <div className="space-y-3">
            {FEATURES.map((feature, idx) => {
              const isActive = idx === activeIndex
              return (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    'w-full cursor-pointer rounded-[8px] border px-5 py-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md transition-colors focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:outline-none',
                    isActive
                      ? 'border-black bg-black text-white'
                      : 'border-black/10 bg-white text-black hover:border-black/28 hover:bg-[#f6f6f2]',
                  )}
                  aria-pressed={isActive}
                >
                  <span className="font-monument-grotes block text-xl font-semibold">
                    {feature.title}
                  </span>
                  <span
                    className={cn(
                      'mt-2 block text-sm leading-6',
                      isActive ? 'text-white/68' : 'text-black/58',
                    )}
                  >
                    {feature.description}
                  </span>
                </button>
              )
            })}

            <Button
              size="lg"
              onClick={handleSignUpClick}
              disabled={isAuthenticated}
              className={cn(
                'mt-3 min-h-12 w-full rounded-full !bg-[#f97316] px-6 text-base font-semibold !text-white hover:!bg-[#ea580c]',
                isAuthenticated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              )}
            >
              Start building
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="relative min-h-[360px] overflow-hidden rounded-[8px] border border-black/10 bg-white/70 shadow-[0_24px_80px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-md lg:min-h-[590px]">
              <Image
                key={activeFeature.title}
                src={activeFeature.image}
                alt={activeFeature.title}
                fill
                className="object-contain object-right-bottom p-4 md:p-8"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            </div>

            <div className="flex flex-col justify-between rounded-[8px] border border-white/10 bg-[#111111]/[0.94] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
              <div>
                <p className="text-[11px] tracking-[0.2em] text-white/44 uppercase">
                  Current module
                </p>
                <h3 className="font-monument-grotes mt-3 text-3xl leading-none font-semibold">
                  {activeFeature.title}
                </h3>
              </div>
              <ul className="mt-8 space-y-4">
                {activeFeature.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm leading-6 text-white/70">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#22c55e]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </LandingPageSection>
    </section>
  )
}

export default FeaturesSection
