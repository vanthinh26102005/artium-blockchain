import { useEffect, useRef } from 'react'
import { cn } from '@shared/lib/utils'

// @shared - landing page
import LandingPageSection from './LandingPageSection'

type IntroductionProps = {
  className?: string
}

/**
 * Introduction - React component
 * @returns React element
 */
const Introduction = ({ className }: IntroductionProps) => {
  // -- state --
  const videoRef = useRef<HTMLVideoElement>(null)

  // -- effects --
/**
 * videoRef - Utility function
 * @returns void
 */
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return undefined

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
/**
 * videoElement - Utility function
 * @returns void
 */
          void videoElement.play().catch(() => undefined)
        } else {
          videoElement.pause()
        }
      })
    }
/**
 * handleIntersect - Utility function
 * @returns void
 */

    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.5 })
    observer.observe(videoElement)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <LandingPageSection className={cn(className)}>
      {/* -- video container -- */}
      <div className="relative overflow-hidden rounded-[20px]">
/**
 * observer - Utility function
 * @returns void
 */
        <video
          ref={videoRef}
          className="h-[172px] w-full object-cover md:h-[370px] lg:h-[755px]"
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
      </div>
    </LandingPageSection>
  )
}

export default Introduction
