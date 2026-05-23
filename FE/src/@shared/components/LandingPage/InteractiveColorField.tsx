import { useCallback, type CSSProperties, type PointerEvent, type PropsWithChildren } from 'react'
import { cn } from '@shared/lib/utils'

type InteractiveDarkSectionProps = PropsWithChildren<{
  className?: string
  variant?: 'hero' | 'section'
}>

const baseFieldStyle = {
  '--field-x': '52%',
  '--field-y': '34%',
  '--field-shift-x': '0px',
  '--field-shift-y': '0px',
  '--field-hue': '0deg',
} as CSSProperties

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
  const handlePointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.min(Math.max(((event.clientX - rect.left) / rect.width) * 100, 0), 100)
    const y = Math.min(Math.max(((event.clientY - rect.top) / rect.height) * 100, 0), 100)

    event.currentTarget.style.setProperty('--field-x', `${x.toFixed(2)}%`)
    event.currentTarget.style.setProperty('--field-y', `${y.toFixed(2)}%`)
    event.currentTarget.style.setProperty('--field-shift-x', `${((x - 50) * -0.55).toFixed(1)}px`)
    event.currentTarget.style.setProperty('--field-shift-y', `${((y - 50) * -0.36).toFixed(1)}px`)
    event.currentTarget.style.setProperty('--field-hue', `${((x - 50) * 0.8).toFixed(1)}deg`)
  }, [])

  const handlePointerLeave = useCallback((event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--field-x', '52%')
    event.currentTarget.style.setProperty('--field-y', '34%')
    event.currentTarget.style.setProperty('--field-shift-x', '0px')
    event.currentTarget.style.setProperty('--field-shift-y', '0px')
    event.currentTarget.style.setProperty('--field-hue', '0deg')
  }, [])

  return (
    <section
      className={cn(
        'group/interactive relative isolate overflow-hidden bg-[#050505] text-white',
        className,
      )}
      style={baseFieldStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className={cn(
            'absolute -inset-[14%] transition-opacity duration-300 ease-out will-change-transform',
            variant === 'hero'
              ? 'opacity-95 group-hover/interactive:opacity-100'
              : 'opacity-58 group-hover/interactive:opacity-82',
          )}
          style={{
            background: fieldBackground,
            backgroundPosition:
              'var(--field-x) var(--field-y), calc(100% - var(--field-x)) var(--field-y), center, center',
            backgroundSize: '160% 160%, 140% 140%, 88px 88px, 88px 88px',
            filter: 'hue-rotate(var(--field-hue)) saturate(1.42)',
            mixBlendMode: 'screen',
            transform: 'translate3d(var(--field-shift-x), var(--field-shift-y), 0)',
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
