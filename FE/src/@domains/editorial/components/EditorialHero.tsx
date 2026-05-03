import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'

// icons
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'

// @domains - editorial
import type { EditorialItem } from '@domains/editorial/types'

type EditorialHeroProps = {
  items: EditorialItem[]
}

/**
 * formatPublishedDate - Utility function
 * @returns void
 */
const formatPublishedDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))

export const EditorialHero = ({ items }: EditorialHeroProps) => {
  // -- state --
  const [activeIndex, setActiveIndex] = useState(0)
/**
 * EditorialHero - React component
 * @returns React element
 */
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next')
  const router = useRouter()

  // -- derived --
  const slides = useMemo(() => (items.length > 0 ? items : []), [items])
  const activeItem = slides[activeIndex] ?? slides[0]
  const formattedDate = activeItem ? formatPublishedDate(activeItem.publishedAt) : ''
/**
 * router - Utility function
 * @returns void
 */

  // -- handlers --
  const goToSlide = (index: number, direction: 'next' | 'prev') => {
    setSlideDirection(direction)
    setActiveIndex(index)
  }
/**
 * slides - Utility function
 * @returns void
 */

  const goNext = () => {
    goToSlide((activeIndex + 1) % slides.length, 'next')
  }
/**
 * activeItem - Utility function
 * @returns void
 */

  const goPrev = () => {
    goToSlide(activeIndex === 0 ? slides.length - 1 : activeIndex - 1, 'prev')
  }
/**
 * formattedDate - Utility function
 * @returns void
 */

  // -- effects --
  useEffect(() => {
    if (slides.length <= 1) {
      return
    }
/**
 * goToSlide - Utility function
 * @returns void
 */

    const timer = window.setInterval(() => {
      goNext()
    }, 7000)

    return () => {
      window.clearInterval(timer)
    }
/**
 * goNext - Utility function
 * @returns void
 */
  }, [slides.length, activeIndex])

  // -- render --
  if (!activeItem) {
    return null
  }

/**
 * goPrev - Utility function
 * @returns void
 */
  const handleNavigate = () => {
    router.push(`/editorial/${activeItem.id}`)
  }

  return (
    <section
      className="relative isolate h-[970px] w-full overflow-hidden rounded-none bg-black shadow-[0_16px_48px_rgba(15,23,42,0.25)]"
      role="link"
      tabIndex={0}
      aria-label={`Read ${activeItem.title}`}
      onClick={handleNavigate}
      onKeyDown={(event) => {
        if (event.currentTarget !== event.target) {
/**
 * timer - Utility function
 * @returns void
 */
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleNavigate()
        }
      }}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex
        const translateClass = isActive
          ? 'translate-x-0'
          : slideDirection === 'next'
            ? 'translate-x-4'
            : '-translate-x-4'
        return (
          <div
/**
 * handleNavigate - Utility function
 * @returns void
 */
            key={slide.id}
            className={`absolute inset-0 h-full w-full transition-all duration-[1200ms] ease-out ${
              isActive
                ? `blur-0 scale-100 opacity-100 ${translateClass}`
                : `scale-[1.02] opacity-0 blur-[2px] ${translateClass}`
            }`}
            aria-hidden={!isActive}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        )
      })}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-10 sm:px-10 lg:px-14">
        <div
          className="w-full max-w-4xl space-y-4 rounded-3xl border border-white/25 bg-white/10 p-5 text-white shadow-[0_10px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl sm:p-6"
          style={{
/**
 * isActive - Utility function
 * @returns void
 */
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(22px) saturate(170%)',
            WebkitBackdropFilter: 'blur(22px) saturate(170%)',
          }}
/**
 * translateClass - Utility function
 * @returns void
 */
        >
          <div className="inline-flex w-fit items-center rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[12px] leading-tight font-semibold tracking-[0.14em] text-white uppercase">
            {activeItem.category}
          </div>

          <div className="space-y-3">
            <h1 className="text-[30px] leading-none font-semibold text-white sm:text-[34px] lg:text-[38px]">
              {activeItem.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-white/90">
              <span className="line-clamp-1 text-[20px] leading-tight font-normal text-white">
                by {activeItem.author}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/60" />
              <span className="text-[15px] font-medium">{formattedDate}</span>
              <span className="h-1 w-1 rounded-full bg-white/60" />
              <span className="inline-flex items-center gap-2 text-[15px] font-medium">
                <Clock className="h-4 w-4" />
                {activeItem.readTime}
              </span>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                handleNavigate()
              }}
              className="inline-flex w-fit rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Read story
            </button>
          </div>
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={(event) => {
                  event.stopPropagation()
                  goToSlide(index, index > activeIndex ? 'next' : 'prev')
                }}
                className={`h-2.5 rounded-full transition ${
                  index === activeIndex ? 'w-6 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          <div className="absolute inset-y-0 left-4 flex items-center text-white sm:left-6 lg:left-8">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={(event) => {
                event.stopPropagation()
                goPrev()
              }}
              className="inline-flex h-20 w-20 items-center justify-center text-white transition-transform duration-200 hover:scale-110"
            >
              <ChevronLeft
                className="h-16 w-16 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                strokeWidth={1.4}
              />
            </button>
          </div>
          <div className="absolute inset-y-0 right-4 flex items-center text-white sm:right-6 lg:right-8">
            <button
              type="button"
              aria-label="Next slide"
              onClick={(event) => {
                event.stopPropagation()
                goNext()
              }}
              className="inline-flex h-20 w-20 items-center justify-center text-white transition-transform duration-200 hover:scale-110"
            >
              <ChevronRight
                className="h-16 w-16 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                strokeWidth={1.4}
              />
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
