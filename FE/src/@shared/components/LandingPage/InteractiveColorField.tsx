import type { PropsWithChildren } from 'react'
import { cn } from '@shared/lib/utils'

type InteractiveDarkSectionProps = PropsWithChildren<{
  className?: string
  variant?: 'hero' | 'section'
}>

const fieldBackground = [
  'linear-gradient(115deg, transparent 0%, rgba(249,115,22,0.42) 18%, transparent 34%, rgba(53,201,238,0.34) 52%, transparent 66%, rgba(34,197,94,0.3) 84%, transparent 100%)',
  'linear-gradient(32deg, transparent 0%, rgba(236,72,153,0.24) 22%, transparent 31%, rgba(255,255,255,0.1) 47%, transparent 48%, transparent 100%)',
  'repeating-linear-gradient(90deg, rgba(255,255,255,0.055) 0 1px, transparent 1px 88px)',
  'repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 88px)',
].join(', ')

export const InteractiveDarkSection = ({
  children,
  className,
  variant = 'section',
}: InteractiveDarkSectionProps) => {
  return (
    <section
      className={cn(
        'group/interactive relative isolate overflow-hidden bg-[#050505] text-white',
        className,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className={cn(
            'landing-color-field absolute -inset-[14%] will-change-transform',
            variant === 'hero'
              ? 'opacity-95 group-hover/interactive:opacity-100'
              : 'opacity-58 group-hover/interactive:opacity-82',
          )}
          style={{
            background: fieldBackground,
            backgroundSize: '160% 160%, 140% 140%, 88px 88px, 88px 88px',
            backgroundPosition: '42% 36%, 68% 28%, center, center',
            filter: 'saturate(1.34)',
            mixBlendMode: 'screen',
          }}
        />
        <div
          className={cn(
            'absolute inset-0',
            variant === 'hero'
              ? 'bg-[linear-gradient(90deg,rgba(5,5,5,0.7)_0%,rgba(5,5,5,0.4)_48%,rgba(5,5,5,0.62)_100%)]'
              : 'bg-[linear-gradient(90deg,rgba(5,5,5,0.9)_0%,rgba(5,5,5,0.68)_48%,rgba(5,5,5,0.86)_100%)]',
          )}
        />
        <div
          className={cn(
            'absolute inset-0',
            variant === 'hero'
              ? 'bg-[linear-gradient(180deg,rgba(5,5,5,0)_0%,rgba(5,5,5,0.18)_64%,rgba(5,5,5,0.86)_100%)]'
              : 'bg-[linear-gradient(180deg,rgba(5,5,5,0.06)_0%,rgba(5,5,5,0.42)_64%,rgba(5,5,5,0.94)_100%)]',
          )}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </section>
  )
}
