import { useEffect, useRef, useState, type CSSProperties, type PropsWithChildren } from 'react'
import { cn } from '@shared/lib/utils'

type RevealDirection = 'up' | 'left' | 'right' | 'none'

type ScrollRevealProps = PropsWithChildren<{
  className?: string
  delay?: number
  direction?: RevealDirection
  distance?: number
  threshold?: number
}>

const getRevealOffset = (direction: RevealDirection, distance: number) => {
  switch (direction) {
    case 'left':
      return { x: `${distance}px`, y: '0px' }
    case 'right':
      return { x: `-${distance}px`, y: '0px' }
    case 'none':
      return { x: '0px', y: '0px' }
    case 'up':
    default:
      return { x: '0px', y: `${distance}px` }
  }
}

export const ScrollReveal = ({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 28,
  threshold = 0.16,
}: ScrollRevealProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const offset = getRevealOffset(direction, distance)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return undefined

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      const frameId = window.requestAnimationFrame(() => setIsVisible(true))
      return () => window.cancelAnimationFrame(frameId)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        setIsVisible(true)
        observer.unobserve(entry.target)
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold,
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold])

  return (
    <div
      ref={elementRef}
      className={cn('landing-scroll-reveal', className)}
      data-reveal-state={isVisible ? 'visible' : 'hidden'}
      style={
        {
          '--reveal-delay': `${delay}ms`,
          '--reveal-x': offset.x,
          '--reveal-y': offset.y,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

export default ScrollReveal
