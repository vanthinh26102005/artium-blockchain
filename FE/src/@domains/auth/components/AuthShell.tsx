// react
import { ReactNode } from 'react'

type AuthShellProps = {
  children: ReactNode
}

export const AuthShell = ({ children }: AuthShellProps) => {
  // -- render --
  return (
    <div className="relative min-h-full overflow-x-hidden bg-black px-4 py-12 text-white sm:px-6 lg:px-10">
      {/* background image */}
      <div className="fixed inset-0 z-0 bg-[url('/images/auth/background.webp')] bg-cover bg-center" />

      {/* overlay */}
      <div className="fixed inset-0 z-10 bg-black/70" />

      {/* decorative text - left */}
      <p className="font-monument-grotes 3xl:text-[250px] pointer-events-none fixed top-[60%] -left-[5%] z-20 hidden w-[60%] -rotate-[15deg] text-[48px] leading-[0.9] tracking-[0.1em] text-white/90 uppercase md:block lg:text-[140px] 2xl:text-[200px]">
        Join the new art world
      </p>

      {/* decorative text - right */}
      <p className="font-monument-grotes 3xl:text-[250px] pointer-events-none fixed top-[13%] -right-[6%] z-20 hidden w-[60%] rotate-[15deg] text-right text-[48px] leading-[0.9] tracking-[0.1em] text-white/90 uppercase md:block lg:text-[140px] 2xl:text-[200px]">
        Join the new art world
      </p>

      {/* content */}
      <div className="relative z-30 flex min-h-full items-start justify-center pt-20 pb-12">
        {children}
      </div>
    </div>
  )
}
