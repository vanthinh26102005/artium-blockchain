import React, { useState } from 'react'

// @domains - pricing
import { PricingBanner } from './PricingBanner'
import { PricingHeader } from './PricingHeader'
import { PricingPlanCard } from './PricingPlanCard'
import { PricingSupportServices } from './PricingSupportServices'
import { PricingComparisonTable } from './PricingComparisonTable'
import { BILLING_CYCLES, BillingCycle, PRICING_PLANS } from '../constants/pricingData'

/**
 * PricingMain - React component
 * @returns React element
 */
export const PricingMain: React.FC = () => {
  // -- state --
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BILLING_CYCLES.MONTHLY)

  return (
    <div className="container mx-auto px-2 pb-16 md:px-4 md:pb-24">
      {/* -- banner -- */}
      <PricingBanner />

      {/* -- header & toggle -- */}
      <PricingHeader billingCycle={billingCycle} setBillingCycle={setBillingCycle} />

      {/* -- plans grid -- */}
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PRICING_PLANS.map((plan) => (
          <PricingPlanCard key={plan.id} plan={plan} billingCycle={billingCycle} />
        ))}
      </div>

      {/* -- support services -- */}
      <PricingSupportServices />

      {/* -- comparison table -- */}
      <PricingComparisonTable />
    </div>
  )
}
