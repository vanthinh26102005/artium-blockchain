import React from 'react'
import { Button } from '@shared/components/ui/button'

/**
 * PricingBanner - React component
 * @returns React element
 */
export const PricingBanner: React.FC = () => {
  return (
    <section
      className="relative right-1/2 left-1/2 -mt-20 mb-16 w-screen -translate-x-1/2 overflow-hidden bg-linear-to-r from-blue-400 via-sky-200 to-cyan-200 px-6 text-center shadow-lg md:px-12 lg:px-16"
      style={{ minHeight: '800px' }}
    >
      {/* -- content -- */}
      <div className="relative z-10 mt-10 flex h-full flex-col items-center justify-center space-y-8 py-20 md:py-28 lg:py-32">
        <h1 className="text-5xl leading-tight font-black text-[#191414] md:text-6xl lg:text-7xl">
          <span className="block">Everything you need to</span>
          <span className="block">run your art business</span>
        </h1>
        <p className="max-w-2xl text-xl font-semibold text-slate-700 md:text-2xl">
          With no commissions, full control, and keep 100% of your earnings
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:mt-8">
          <Button className="h-auto rounded-full bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-blue-700">
            Start free trial
          </Button>
          <p className="text-base font-medium text-slate-600 italic">Try 14 days, cancel anytime</p>
        </div>
      </div>

      {/* -- background effects -- */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-blue-400 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-cyan-400 blur-3xl" />
      </div>
    </section>
  )
}
