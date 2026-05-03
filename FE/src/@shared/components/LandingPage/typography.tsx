import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { cn } from '@shared/lib/utils'

type HeadingSize = 'h1' | 'h2' | 'h3'

/**
 * headingSizeClass - Utility function
 * @returns void
 */
const headingSizeClass: Record<HeadingSize, string> = {
  h1: 'text-[32px] leading-[1.05] lg:text-[64px] xl:text-[80px]',
  h2: 'text-[24px] leading-[1.1] lg:text-[40px] xl:text-[54px]',
  h3: 'text-[20px] leading-[1.15] lg:text-[28px] xl:text-[34px]',
}

type HeadingTone = 'default' | 'light' | 'inherit'

const headingToneClass: Record<HeadingTone, string> = {
  default: 'text-black',
  light: 'text-white',
/**
 * headingToneClass - Utility function
 * @returns void
 */
  inherit: 'text-inherit',
}

type HeadingProps<T extends ElementType = 'h2'> = {
  as?: T
  size?: HeadingSize
  tone?: HeadingTone
  className?: string
  children: ReactNode
} & ComponentPropsWithoutRef<T>

export const Heading = <T extends ElementType = 'h2'>({
  as,
  size = 'h2',
  tone = 'default',
  className,
  children,
/**
 * Heading - React component
 * @returns React element
 */
  ...props
}: HeadingProps<T>) => {
  const Component = (as || 'h2') as ElementType
  return (
    <Component
      className={cn(
        'font-monument-grotes font-semibold tracking-tight',
        headingSizeClass[size],
        headingToneClass[tone],
        className,
      )}
/**
 * Component - React component
 * @returns React element
 */
      {...props}
    >
      {children}
    </Component>
  )
}

type TextProps = {
  className?: string
  children: ReactNode
} & ComponentPropsWithoutRef<'p'>

export const Text = ({ className, children, ...props }: TextProps) => (
  <p className={cn('text-base leading-relaxed text-black/85 lg:text-lg', className)} {...props}>
    {children}
  </p>
)

/**
 * Text - React component
 * @returns React element
 */