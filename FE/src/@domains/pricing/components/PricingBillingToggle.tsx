import React from 'react'
import { cn } from '@shared/lib/utils'
import { BillingCycle, BILLING_CYCLES } from '../constants/pricingData'

interface PricingBillingToggleProps {
  billingCycle: BillingCycle
  onChange: (cycle: BillingCycle) => void
}

/**
 * PricingBillingToggle - React component
 * @returns React element
 */
export const PricingBillingToggle: React.FC<PricingBillingToggleProps> = ({
  billingCycle,
  onChange,
}) => {
  return (
    <div className="mt-6 mb-4 flex justify-center">
      <div className="inline-flex h-[42px] w-[130px] rounded-full bg-white p-1 ring-1 ring-slate-200">
        <button
          onClick={() => onChange(BILLING_CYCLES.MONTHLY)}
          className={cn(
            'h-full flex-1 rounded-full text-xs leading-[125%] font-semibold transition-all duration-300',
            billingCycle === BILLING_CYCLES.MONTHLY
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900',
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => onChange(BILLING_CYCLES.YEARLY)}
          className={cn(
            'h-full flex-1 rounded-full text-xs leading-[125%] font-semibold transition-all duration-300',
            billingCycle === BILLING_CYCLES.YEARLY
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900',
          )}
        >
          Yearly
        </button>
      </div>
    </div>
  )
}
