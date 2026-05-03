import React from 'react'
import { PricingBillingToggle } from './PricingBillingToggle'
import { BillingCycle } from '../constants/pricingData'

type PricingHeaderProps = {
  billingCycle: BillingCycle
  setBillingCycle: (cycle: BillingCycle) => void
}

/**
 * PricingHeader - React component
 * @returns React element
 */
export const PricingHeader: React.FC<PricingHeaderProps> = ({ billingCycle, setBillingCycle }) => {
  return (
    <div className="mx-auto mb-16 max-w-3xl text-center">
      {/* -- title -- */}
      <h2 className="text-5xl font-black whitespace-nowrap text-[#191414] md:text-6xl">
        Choose Your Perfect Plan
      </h2>

      {/* -- subtitle/badge -- */}
      <div className="mt-6 mb-8 inline-flex items-center gap-2 rounded-2xl border border-green-900 !bg-[#A8FF8F] px-4 py-2 text-base font-semibold text-green-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="m5 12 5 5L20 7" />
        </svg>
        Save 21% with annual billing
      </div>

      {/* -- toggle -- */}
      <PricingBillingToggle billingCycle={billingCycle} onChange={setBillingCycle} />
    </div>
  )
}
