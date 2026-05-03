import React from 'react'
import { Check } from 'lucide-react'

// @shared - components
import { Button } from '@shared/components/ui/button'

// @domains - pricing
import { BillingCycle, BILLING_CYCLES } from '../constants/pricingData'

type PricingPlanCardProps = {
  plan: {
    id: string
    name: string
    description: string
    price: {
      monthly: number
      yearly: number
    }
    actionLabel: string
    features: string[]
    isPopular: boolean
  }
  billingCycle: BillingCycle
}

/**
 * PricingPlanCard - React component
 * @returns React element
 */
export const PricingPlanCard: React.FC<PricingPlanCardProps> = ({ plan, billingCycle }) => {
  // -- derived state --
  const price = billingCycle === BILLING_CYCLES.MONTHLY ? plan.price.monthly : plan.price.yearly
  const isFree = price === 0

/**
 * price - Utility function
 * @returns void
 */
  return (
    <div
      className={`relative flex h-full min-h-[460px] flex-col rounded-2xl border bg-white p-8 ${
        plan.isPopular ? 'border-blue-600 shadow-lg ring-1 ring-blue-600' : 'border-slate-200'
/**
 * isFree - Utility function
 * @returns void
 */
      }`}
    >
      {/* -- popular badge -- */}
      {plan.isPopular && (
        <div className="absolute top-0 right-0 -mt-3 mr-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
          Most Popular
        </div>
      )}

      {/* -- header -- */}
      <div className="mb-5 text-center">
        <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
        <p className="mt-2 min-h-[40px] text-base text-slate-500">{plan.description}</p>
      </div>

      {/* -- pricing -- */}
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="flex items-end justify-center gap-2 text-slate-900">
          <span className="-translate-y-2 self-start text-sm leading-none font-semibold">
            {isFree ? '' : 'US$'}
          </span>
          <span className="text-6xl leading-none font-black">{isFree ? 'Free' : price}</span>
          {!isFree && (
            <span className="text-base leading-none font-semibold text-slate-800">/month</span>
          )}
        </div>
        {isFree ? (
          <div className="mt-1 mb-1 text-xs font-medium text-slate-800">Free Forever</div>
        ) : (
          <div className="mt-1 mb-1 text-xs font-medium text-slate-800">
            {billingCycle === BILLING_CYCLES.YEARLY ? 'Billed yearly' : 'Billed monthly'}
          </div>
        )}
      </div>

      {/* -- features -- */}
      <div className="mt-2 flex flex-col items-center gap-2">
        <ul className="space-y-2">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-center">
              <Check className="mr-2 h-5 w-5 shrink-0 text-blue-600" />
              <span className="text-sm text-slate-600">{feature}</span>
            </li>
          ))}
        </ul>

        {/* -- discount badge -- */}
        {!isFree && billingCycle === BILLING_CYCLES.YEARLY && (
          <div className="mt-2 mb-2 inline-flex items-center gap-2 rounded-md border border-green-900 bg-[#A8FF8F] px-3 py-1 text-xs font-semibold text-green-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M12 3 3 9l9 6 9-6-9-6Z" />
              <path d="M3 15l9 6 9-6" />
              <path d="m3 9 9 6 9-6" />
            </svg>
            Save 21%
          </div>
        )}
      </div>

      {/* -- actions -- */}
      {plan.actionLabel ? (
        <div className="mt-4 flex w-full justify-center">
          <Button className="w-3/4 bg-blue-600">{plan.actionLabel}</Button>
        </div>
      ) : null}

      {plan.actionLabel ? (
        <div className="mt-3 flex w-full justify-center">
          <button className="text-xs font-semibold text-blue-600 hover:text-black">
            Start Free Trial
          </button>
        </div>
      ) : null}
    </div>
  )
}
