import { useEffect, useRef } from 'react'
import { Play, ShieldCheck } from 'lucide-react'
import { cn } from '@shared/lib/utils'

// @shared - landing page
import LandingPageSection from './LandingPageSection'

type IntroductionProps = {
  className?: string
}

const workflowItems = [
  'Publish portfolio pages and collector-facing listings',
  'Run live auctions with transparent bid state',
  'Send invoices, collect payments, and track client relationships',
]

const Introduction = ({ className }: IntroductionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return undefined

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          void videoElement.play().catch(() => undefined)
        } else {
          videoElement.pause()
        }
      })
    }

    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.36 })
    observer.observe(videoElement)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <section className={cn('bg-[#f4f1ea] text-[#121212]', className)}>
      <LandingPageSection className="grid gap-8 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:items-center">
        <div>
          <p className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-black/12 bg-white/[0.45] px-3 text-[11px] tracking-[0.2em] text-black/54 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            One connected workspace
          </p>
          <h2 className="font-monument-grotes max-w-xl text-4xl leading-[1] font-semibold tracking-normal uppercase md:text-6xl">
            From first view to final payout.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-black/64 lg:text-lg">
            Artium gives galleries and artists a public marketplace layer and a private operating
            layer, so discovery, sales, communication, and fulfillment stay connected.
          </p>

          <div className="mt-8 space-y-3">
            {workflowItems.map((item, index) => (
              <div key={item} className="flex gap-4 border-t border-black/10 pt-4">
                <span className="font-monument-grotes text-sm font-semibold text-black/36">
                  0{index + 1}
                </span>
                <p className="text-sm leading-6 text-black/72">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[8px] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
          <video
            ref={videoRef}
            className="aspect-[16/11] h-full min-h-[320px] w-full object-cover opacity-90"
            preload="metadata"
            loop
            muted
            playsInline
          >
            <source
              src="/videos/homepage/v2/introduction/13633632-uhd_3840_2160_30fps.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/78 to-transparent p-5 text-white md:p-7">
            <div>
              <p className="text-[11px] tracking-[0.2em] text-white/56 uppercase">
                Platform preview
              </p>
              <p className="mt-2 max-w-md text-lg leading-6 font-semibold">
                Marketplace energy with back-office precision.
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] bg-white text-black">
              <Play className="h-5 w-5 fill-black" />
            </div>
          </div>
        </div>
      </LandingPageSection>
    </section>
  )
}

export default Introduction
