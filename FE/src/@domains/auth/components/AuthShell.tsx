// react
import { ReactNode } from 'react'

type AuthShellProps = {
  children: ReactNode
}

/**
 * AuthShell - React component
 * @returns React element
 */
export const AuthShell = ({ children }: AuthShellProps) => {
  // -- render --
  return (
    <div className="relative min-h-full overflow-x-hidden bg-black px-4 py-12 text-white sm:px-6 lg:px-10">
      {/* background image */}
      <div className="fixed inset-0 z-0 bg-[url('/images/auth/background.webp')] bg-cover bg-center" />

      {/* overlay */}
      <div className="fixed inset-0 z-10 bg-black/70" />

      {/* decorative text - left */}
      <p className="pointer-events-none fixed -left-[5%] top-[60%] z-20 hidden w-[60%] -rotate-[15deg] font-monument-grotes text-[48px] uppercase leading-[0.9] tracking-[0.1em] text-white/90 2xl:text-[200px] 3xl:text-[250px] md:block lg:text-[140px]">
        Join the new art world
      </p>

      {/* decorative text - right */}
      <p className="pointer-events-none fixed -right-[6%] top-[13%] z-20 hidden w-[60%] rotate-[15deg] text-right font-monument-grotes text-[48px] uppercase leading-[0.9] tracking-[0.1em] text-white/90 2xl:text-[200px] 3xl:text-[250px] md:block lg:text-[140px]">
        Join the new art world
      </p>

      {/* content */}
      <div className="relative z-30 flex min-h-full items-start justify-center pb-12 pt-20">
        {children}
      </div>
    </div>
  )
}
